import { Client } from 'ssh2';
import { readdir, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

// -----------------------------
// CLI argument parsing
// -----------------------------
const args = process.argv.slice(2);
const primaryArg = args[0] || 'patch'; // patch, minor, major, or rollback
const extraArgs = args.slice(1);

const VALID_VERSION_TYPES = ['patch', 'minor', 'major'];
const isRollbackMode = primaryArg === 'rollback';
const versionType = isRollbackMode ? 'patch' : primaryArg;

if (!isRollbackMode && !VALID_VERSION_TYPES.includes(versionType)) {
  console.error('❌ Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

// Store original package.json content for potential rollback
let originalPackageJson = null;
let shouldCommitVersion = false;
let activeDeployVersion = '';

// -----------------------------
// Helpers
// -----------------------------

function bumpVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2] += 1;
      break;
  }

  return parts.join('.');
}

function ensureCleanGitStateForMaster() {
  console.log('🔍 Verifying git state for master deploy...');

  // 1) No unstaged or staged local changes
  const status = execSync('git status --porcelain', { stdio: 'pipe' })
    .toString()
    .trim();

  if (status) {
    console.error('\n❌ Cannot deploy from master: working tree is not clean.');
    console.error('   Please commit, stash, or discard these changes first:\n');
    console.error(status);
    console.error('');
    process.exit(1);
  }

  // 2) No commits ahead of upstream (i.e. nothing unpushed)
  let hasUpstream = true;
  try {
    execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', {
      stdio: 'pipe',
    });
  } catch {
    hasUpstream = false;
    console.error(
      '\n⚠️  master has no upstream tracking branch configured. ' +
        'Consider running: git branch --set-upstream-to=origin/master master\n'
    );
  }

  if (hasUpstream) {
    const aheadRaw = execSync('git rev-list --count @{u}..HEAD', {
      stdio: 'pipe',
    })
      .toString()
      .trim();
    const ahead = parseInt(aheadRaw || '0', 10);

    if (ahead > 0) {
      console.error(
        '\n❌ Cannot deploy from master: there are local commits not pushed to origin/master.'
      );
      console.error('   Please push your changes first:\n');
      console.error('   git push origin master\n');
      console.error('');
      process.exit(1);
    }
  }

  console.log('✅ Git state is clean and up to date for master deploy.\n');
}

async function updateVersion() {
  console.log('📌 Managing version...');

  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  console.log(`   Branch: ${branch}`);

  const packagePath = './package.json';
  const packageJsonContent = await readFile(packagePath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent.toString());
  const currentVersion = packageJson.version;
  console.log(`   Current version: ${currentVersion}`);

  let newVersion = currentVersion;

  if (branch !== 'master') {
    // Non-master branch: derive canary version without touching package.json
    const versionParts = currentVersion.split('.').map(Number);
    versionParts[2] += 1;

    const safeBranchName = branch.replace(/[^a-zA-Z0-9]/g, '-');
    let shortSha = '';
    try {
      shortSha = execSync('git rev-parse --short HEAD').toString().trim();
    } catch {
      shortSha = 'local';
    }

    newVersion = `${versionParts.join('.')}--canary-${safeBranchName}-${shortSha}`;

    console.log(
      `   📦 Creating canary version (no package.json change): ${newVersion}\n`
    );
  } else {
    console.log(`   🔍 Checking git tags (version type: ${versionType})...`);

    // Ensure master is clean and fully pushed before continuing
    ensureCleanGitStateForMaster();

    try {
      execSync('git fetch --tags', { stdio: 'pipe' });

      let latestTag;
      try {
        latestTag = execSync('git describe --tags --abbrev=0', {
          stdio: 'pipe',
        })
          .toString()
          .trim();
        latestTag = latestTag.startsWith('v') ? latestTag.slice(1) : latestTag;
      } catch {
        latestTag = null;
        console.log('   ℹ️  No existing tags found');
      }

      console.log(`   Latest tag: ${latestTag || 'none'}`);

      if (latestTag && latestTag !== currentVersion) {
        console.error(`\n❌ Version mismatch detected!`);
        console.error(`   package.json version: ${currentVersion}`);
        console.error(`   Latest tag:           ${latestTag}`);
        console.error('\n   This indicates an inconsistent repository state.');
        console.error('   Please resolve manually before deploying.\n');
        process.exit(1);
      }

      originalPackageJson = packageJsonContent.toString();

      newVersion = bumpVersion(currentVersion, versionType);
      console.log(
        `   📦 Bumping ${versionType} version: ${currentVersion} → ${newVersion}`
      );

      packageJson.version = newVersion;
      await writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(
        '   ✅ Version updated in package.json (not committed yet)\n'
      );

      shouldCommitVersion = true;
    } catch (err) {
      console.error(`\n❌ Error checking tags: ${err.message}\n`);
      process.exit(1);
    }
  }

  activeDeployVersion = newVersion;
  return newVersion;
}

async function rollbackVersion() {
  if (originalPackageJson) {
    console.log('\n🔄 Rolling back package.json to original value...');
    await writeFile('./package.json', originalPackageJson);
    console.log('✅ package.json restored to original version\n');
  }
}

async function commitAndTagVersion(version) {
  if (!shouldCommitVersion) {
    return;
  }

  console.log(`\n📝 [version=${version}] Committing version bump...`);

  try {
    execSync('git add package.json', { stdio: 'pipe' });
    const commitMessage = `chore: release ${version}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
    console.log(`   ✓ Committed: ${commitMessage}`);

    execSync('git push origin master', { stdio: 'pipe' });
    console.log('   ✓ Pushed commit to master');

    const tagName = `v${version}`;
    execSync(`git tag -a ${tagName} -m "Release ${version}"`, {
      stdio: 'pipe',
    });
    console.log(`   ✓ Created tag: ${tagName}`);

    execSync(`git push origin ${tagName}`, { stdio: 'pipe' });
    console.log(`   ✓ Pushed tag ${tagName}`);

    console.log('✅ Version committed and tagged successfully\n');
  } catch (err) {
    console.error(
      `\n⚠️  [version=${version}] Warning: Failed to commit/tag version: ${err.message}`
    );
    console.error(
      '   Deployment may have succeeded but version was not committed to git.\n'
    );
  }
}

// -----------------------------
// SSH configuration
// -----------------------------

const envUsername =
  process.env.SITEGROUND_USERNAME || process.env.SSH_USERNAME || '';
const sshKeyPathEnv =
  process.env.SITEGROUND_AUTH_KEY ||
  process.env.SSH_KEY_PATH ||
  join(homedir(), '.ssh', 'id_rsa');

let privateKey;
try {
  privateKey = await readFile(sshKeyPathEnv);
  console.log(`🔑 Using SSH key from: ${sshKeyPathEnv}`);
} catch {
  console.log(
    '🔒 No SSH key found at configured path, will try password authentication'
  );
}

const sitegroundPassword =
  process.env.SITEGROUND_AUTH_PW ||
  process.env.SITEGROUD_AUTH_PW ||
  process.env.SSH_PASSWORD;

const sshConfig = {
  host: process.env.SITEGROUND_HOSTNAME || process.env.SSH_HOST,
  port: parseInt(
    process.env.SITEGROUND_PORT || process.env.SSH_PORT || '22',
    10
  ),
  username: envUsername,
  ...(privateKey
    ? {
        privateKey,
        passphrase: process.env.SSH_KEY_PASSPHRASE || undefined,
      }
    : { password: sitegroundPassword }),
  algorithms: {
    serverHostKey: ['ssh-ed25519', 'rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa'],
  },
  tryKeyboard: true,
};

const remoteRoot = `/home/${envUsername}/www/gm.visegripped.com`;
const remotePublicHtml = `${remoteRoot}/public_html`;
const remoteIncludesRoot = `${remoteRoot}/includes`;
const remoteReleasesPublic = `${remotePublicHtml}/releases`;
const remoteReleasesIncludes = `${remoteIncludesRoot}/releases`;

// -----------------------------
// SFTP helpers
// -----------------------------

async function uploadFile(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    const fileName = remotePath.split('/').pop();
    const fileIcon =
      fileName && fileName.endsWith('.php')
        ? '🔷'
        : fileName && fileName.endsWith('.js')
          ? '📜'
          : fileName && fileName.endsWith('.css')
            ? '🎨'
            : fileName && fileName.endsWith('.html')
              ? '📝'
              : '📄';

    console.log(
      `  ${fileIcon} [version=${activeDeployVersion}] Uploading: ${fileName}`
    );
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) {
        console.error(
          `  ❌ [version=${activeDeployVersion}] Failed: ${fileName}`
        );
        reject(err);
      } else {
        console.log(`  ✓ [version=${activeDeployVersion}] ${fileName}`);
        resolve();
      }
    });
  });
}

async function uploadDirectory(sftp, localDir, remoteDir) {
  const files = await readdir(localDir);

  for (const file of files) {
    const localPath = join(localDir, file);
    const remotePath = `${remoteDir}/${file}`;
    const stats = await stat(localPath);

    if (stats.isDirectory()) {
      await new Promise((resolve) => {
        console.log(
          `  📁 [version=${activeDeployVersion}] Creating directory: ${remotePath}`
        );
        sftp.mkdir(remotePath, { mode: 0o755 }, (err) => {
          if (err && err.code !== 4) {
            console.log(
              `  ⚠️  mkdir warning (code ${err.code}) for ${remotePath}`
            );
          }
          resolve();
        });
      });
      await uploadDirectory(sftp, localPath, remotePath);
    } else {
      await uploadFile(sftp, localPath, remotePath);
    }
  }
}

// -----------------------------
// Build helpers
// -----------------------------

async function runBuild(version) {
  console.log(`\n🏗️  [version=${version}] Running frontend build...`);
  process.env.BUILD_VERSION = version;
  process.env.VITE_APP_VERSION = version;

  try {
    execSync('pnpm build', { stdio: 'inherit' });
    console.log(`✅ [version=${version}] Build completed successfully\n`);
  } catch (err) {
    console.error(
      `\n❌ [version=${version}] Build failed: ${err && err.message}`
    );
    throw err;
  }
}

async function prepareVersionedIndex(version) {
  const indexHtmlPath = './dist/index.html';
  const indexPhpPath = './dist/index.php';

  const rawHtml = await readFile(indexHtmlPath, 'utf-8');

  const versionedHtml = rawHtml.replace(
    /(src|href)=\"\/assets\//g,
    `$1="/releases/${version}/assets/`
  );

  await writeFile(indexPhpPath, versionedHtml, 'utf-8');
  console.log(
    `✅ [version=${version}] Prepared dist/index.php with versioned asset paths`
  );
}

// -----------------------------
// Remote cleanup & rollback helpers
// -----------------------------

function isCanaryVersion(name) {
  return name.includes('--canary-');
}

function parseStableVersion(name) {
  const m = name.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function compareStableVersions(a, b) {
  const pa = parseStableVersion(a);
  const pb = parseStableVersion(b);
  if (!pa && !pb) return 0;
  if (!pa) return -1;
  if (!pb) return 1;
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

async function cleanupRemoteVersions() {
  if (!shouldCommitVersion) {
    // Only clean up after stable (master) deployments
    return;
  }

  console.log('🧹 Cleaning up old release directories on server...');

  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        conn.exec(`ls -1 ${remoteReleasesPublic}`, (err, stream) => {
          if (err) {
            reject(err);
            return;
          }

          let output = '';
          stream
            .on('data', (data) => {
              output += data.toString();
            })
            .on('close', () => {
              const names = output
                .split('\n')
                .map((n) => n.trim())
                .filter(Boolean);

              const canaryVersions = names.filter(isCanaryVersion);
              const stableVersions = names.filter(
                (n) => !isCanaryVersion(n) && parseStableVersion(n)
              );

              stableVersions.sort(compareStableVersions);
              const toKeep = stableVersions.slice(-5);
              const toDeleteStable = stableVersions.filter(
                (n) => !toKeep.includes(n)
              );

              const deleteTargets = [];

              // All canaries get removed after a successful master deploy
              canaryVersions.forEach((v) => {
                deleteTargets.push(`${remoteReleasesPublic}/${v}`);
                deleteTargets.push(`${remoteReleasesIncludes}/${v}`);
              });

              // Older stable versions beyond the 5 most recent
              toDeleteStable.forEach((v) => {
                deleteTargets.push(`${remoteReleasesPublic}/${v}`);
                deleteTargets.push(`${remoteReleasesIncludes}/${v}`);
              });

              if (deleteTargets.length === 0) {
                console.log('🧹 No old releases to delete.');
                resolve(null);
                conn.end();
                return;
              }

              const cmd = deleteTargets.map((p) => `rm -rf ${p}`).join(' && ');
              console.log(
                '🧹 Removing old releases:\n  ' + deleteTargets.join('\n  ')
              );

              conn.exec(cmd, (rmErr, rmStream) => {
                if (rmErr) {
                  console.error(
                    '⚠️  Failed to remove old releases:',
                    rmErr.message
                  );
                  resolve(null);
                  conn.end();
                  return;
                }

                rmStream
                  .on('close', () => {
                    console.log('✅ Old releases cleaned up on server');
                    resolve(null);
                    conn.end();
                  })
                  .stderr.on('data', (data) => {
                    console.log('⚠️  cleanup STDERR:', data.toString().trim());
                  });
              });
            });
        });
      })
      .on('error', (err) => {
        console.error('⚠️  Cleanup connection error:', err.message);
        resolve(null);
        conn.end();
      })
      .connect(sshConfig);
  });
}

async function rollbackRemoteVersion(targetVersion) {
  console.log(`\n⏪ Rolling back to version ${targetVersion} on server...`);

  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        conn.sftp(async (sftpErr, sftp) => {
          if (sftpErr) {
            reject(sftpErr);
            return;
          }

          const publicIndexPath = `${remoteReleasesPublic}/${targetVersion}/index.php`;
          const includesPath = `${remoteReleasesIncludes}/${targetVersion}`;

          const exists = (path) =>
            new Promise((res) => {
              sftp.stat(path, (err) => {
                res(!err);
              });
            });

          const publicExists = await exists(publicIndexPath);
          const includesExists = await exists(includesPath);

          if (!publicExists || !includesExists) {
            console.error(
              `❌ Cannot rollback: release folders for version ${targetVersion} do not exist on server.`
            );
            conn.end();
            reject(new Error('Target version not found on server'));
            return;
          }

          const currentVersionPhp = [
            '<?php',
            `$APP_VERSION = '${targetVersion}';`,
            `$INCLUDE_VERSION = '${targetVersion}';`,
            '',
            'function gm_get_include_path($relativePath)',
            '{',
            '    global $INCLUDE_VERSION;',
            "    $relativePath = ltrim($relativePath, '/');",
            "    return __DIR__ . '/releases/' . $INCLUDE_VERSION . '/' . $relativePath;",
            '}',
            '',
          ].join('\n');

          sftp.writeFile(
            `${remoteIncludesRoot}/current_version.php`,
            Buffer.from(currentVersionPhp, 'utf-8'),
            (err) => {
              if (err) {
                console.error(
                  `❌ Failed to update includes/current_version.php during rollback: ${err.message}`
                );
                conn.end();
                reject(err);
                return;
              }

              console.log(
                `✅ Rollback complete. Backend now points to version ${targetVersion} (frontend router will use this as default).`
              );
              conn.end();
              resolve(null);
            }
          );
        });
      })
      .on('error', (err) => {
        console.error('❌ Rollback connection error:', err.message);
        conn.end();
        reject(err);
      })
      .connect(sshConfig);
  });
}

// -----------------------------
// Deployment
// -----------------------------

async function performDeploy(version) {
  console.log(`\n🚀 [version=${version}] Starting deployment...`);

  const ensureDirsCmd = [
    `mkdir -p ${remotePublicHtml}`,
    `mkdir -p ${remoteIncludesRoot}`,
    `mkdir -p ${remoteReleasesPublic}`,
    `mkdir -p ${remoteReleasesIncludes}`,
    `mkdir -p ${remoteReleasesPublic}/${version}`,
    `mkdir -p ${remoteReleasesIncludes}/${version}`,
  ].join(' && ');

  const phpDeployPaths = {
    includesLocal: './php/includes',
    includesRemote: `${remoteReleasesIncludes}/${version}`,
    currentVersionFileRemote: `${remoteIncludesRoot}/current_version.php`,
    apiLocal: './php/public_html/api.php',
    apiRemote: `${remotePublicHtml}/api.php`,
    reportLocal: './php/public_html/report.php',
    reportRemote: `${remotePublicHtml}/report.php`,
    reportingLocal: './php/public_html/reporting.php',
    reportingRemote: `${remotePublicHtml}/reporting.php`,
    archiveItemsLocal: './php/public_html/archive-items.php',
    archiveItemsRemote: `${remotePublicHtml}/archive-items.php`,
    indexRouterLocal: './php/public_html/index.php',
    indexRouterRemote: `${remotePublicHtml}/index.php`,
  };

  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('✅ SSH client :: ready');

        conn.exec(ensureDirsCmd, (err, stream) => {
          if (err) {
            reject(err);
            return;
          }
          stream
            .on('close', async () => {
              console.log('🧱 Remote directory structure ready\n');

              conn.sftp(async (sftpErr, sftp) => {
                if (sftpErr) {
                  reject(sftpErr);
                  return;
                }

                let phpDeploySuccess = false;

                try {
                  // PHASE 1: PHP
                  console.log('🔷 PHASE 1: Deploying PHP files...\n');

                  console.log('🔧 Deploying backend includes...');
                  await uploadDirectory(
                    sftp,
                    phpDeployPaths.includesLocal,
                    phpDeployPaths.includesRemote
                  );
                  console.log('✅ Backend includes deployed\n');

                  // Update includes/current_version.php on the server to point at this version.
                  // This controls which backend version is considered \"active\" for logs and includes.
                  const currentVersionPhp = [
                    '<?php',
                    `$APP_VERSION = '${version}';`,
                    `$INCLUDE_VERSION = '${version}';`,
                    '',
                    'function gm_get_include_path($relativePath)',
                    '{',
                    '    global $INCLUDE_VERSION;',
                    "    $relativePath = ltrim($relativePath, '/');",
                    "    return __DIR__ . '/releases/' . $INCLUDE_VERSION . '/' . $relativePath;",
                    '}',
                    '',
                  ].join('\n');

                  await new Promise((resolveCv, rejectCv) => {
                    sftp.writeFile(
                      phpDeployPaths.currentVersionFileRemote,
                      Buffer.from(currentVersionPhp, 'utf-8'),
                      (err) => {
                        if (err) {
                          console.error(
                            `⚠️  [version=${version}] Failed to update current_version.php on server`
                          );
                          // Do not fail the whole deployment for this
                          resolveCv(null);
                        } else {
                          console.log(
                            `✅ [version=${version}] Updated includes/current_version.php on server`
                          );
                          resolveCv(null);
                        }
                      }
                    );
                  });

                  console.log('🌐 Deploying PHP entrypoints...');
                  await uploadFile(
                    sftp,
                    phpDeployPaths.apiLocal,
                    phpDeployPaths.apiRemote
                  );
                  await uploadFile(
                    sftp,
                    phpDeployPaths.reportLocal,
                    phpDeployPaths.reportRemote
                  );
                  await uploadFile(
                    sftp,
                    phpDeployPaths.reportingLocal,
                    phpDeployPaths.reportingRemote
                  );
                  await uploadFile(
                    sftp,
                    phpDeployPaths.archiveItemsLocal,
                    phpDeployPaths.archiveItemsRemote
                  );
                  await uploadFile(
                    sftp,
                    phpDeployPaths.indexRouterLocal,
                    phpDeployPaths.indexRouterRemote
                  );

                  console.log('✅ PHP entrypoints deployed\n');
                  phpDeploySuccess = true;

                  // PHASE 2: Frontend
                  console.log('🔷 PHASE 2: Deploying frontend assets...\n');
                  const remoteAssetsDir = `${remoteReleasesPublic}/${version}/assets`;
                  await uploadDirectory(sftp, './dist/assets', remoteAssetsDir);
                  console.log('✅ Frontend assets deployed\n');

                  await uploadFile(
                    sftp,
                    './dist/index.php',
                    `${remoteReleasesPublic}/${version}/index.php`
                  );
                  console.log('✅ Versioned index.php deployed\n');

                  console.log(
                    `🎉 Deployment completed successfully! [version=${version}]`
                  );
                  await commitAndTagVersion(version);

                  conn.end();
                  resolve(null);
                } catch (error) {
                  console.error(
                    `\n❌ [version=${version}] Error during deployment:`,
                    error && error.message
                  );

                  if (!phpDeploySuccess) {
                    console.error(
                      `💥 [version=${version}] PHP deployment failed - rolling back version changes\n`
                    );
                    await rollbackVersion();
                  } else {
                    console.error(
                      `⚠️  [version=${version}] Frontend deployment failed, but PHP is deployed\n`
                    );
                    console.error(
                      '💡 You may need to manually fix the frontend deployment.\n'
                    );
                  }

                  conn.end();
                  reject(error);
                }
              });
            })
            .on('data', (data) => {
              console.log('📤 STDOUT:', data.toString().trim());
            })
            .stderr.on('data', (data) => {
              console.log('⚠️  STDERR:', data.toString().trim());
            });
        });
      })
      .on('error', async (err) => {
        console.error('\n❌ Connection error:', err.message);
        console.error(
          '🔐 Authentication method:',
          privateKey ? 'SSH Key' : 'Password'
        );
        if (privateKey) {
          if (err.message.includes('passphrase')) {
            console.error(
              '\n🔒 Your SSH key is encrypted but no passphrase was provided.'
            );
            console.error('\n💡 Add the passphrase to your .env file:');
            console.error('   SSH_KEY_PASSPHRASE=your_passphrase_here');
          } else {
            console.error(
              '\n💡 To fix this, upload your public key to SiteGround:'
            );
            console.error('   1. Get your public key: cat ~/.ssh/id_rsa.pub');
            console.error(
              '   2. Add it to SiteGround via their control panel (SSH Keys section)'
            );
            console.error(
              '   3. Or upload it: ssh-copy-id -i ~/.ssh/id_rsa.pub -p',
              sshConfig.port,
              `${sshConfig.username}@${sshConfig.host}`
            );
          }
        } else {
          console.error(
            '\n💡 Password authentication is failing. The server may require SSH key authentication.'
          );
          console.error(
            '   Set SITEGROUND_AUTH_KEY in .env to use a dedicated SSH key.'
          );
        }

        await rollbackVersion();
        reject(err);
      })
      .connect(sshConfig);
  });
}

// -----------------------------
// Entry point
// -----------------------------

async function main() {
  if (isRollbackMode) {
    const targetVersion = extraArgs[0];
    if (!targetVersion) {
      console.error(
        '❌ rollback mode requires a target version: node deploy.js rollback <version>'
      );
      process.exit(1);
    }
    await rollbackRemoteVersion(targetVersion);
    return;
  }

  const deployVersion = await updateVersion();
  console.log(`🚀 Preparing deployment for version: ${deployVersion}`);

  await runBuild(deployVersion);
  await prepareVersionedIndex(deployVersion);
  await performDeploy(deployVersion);
  await cleanupRemoteVersions();
}

main().catch((err) => {
  console.error('❌ Deployment failed:', err && err.message);
  process.exit(1);
});
