import { Client } from 'ssh2';
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, relative, posix as pathPosix } from 'path';
import { homedir } from 'os';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_VENDOR_ROOT = join(process.cwd(), 'php', 'vendor');

async function collectLocalVendorManifest() {
  const manifest = {};

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const st = await stat(fullPath);
        const relPath = relative(LOCAL_VENDOR_ROOT, fullPath).replace(
          /\\/g,
          '/'
        );
        manifest[relPath] = {
          size: st.size,
          mtimeMs: st.mtimeMs,
        };
      }
    }
  }

  await walk(LOCAL_VENDOR_ROOT);
  return manifest;
}

async function getRemoteVendorManifest(sftp, remoteManifestPath) {
  try {
    const data = await new Promise((resolve, reject) => {
      sftp.readFile(remoteManifestPath, (err, buf) => {
        if (err) {
          return reject(err);
        }
        resolve(buf);
      });
    });
    return JSON.parse(data.toString('utf-8'));
  } catch {
    return {};
  }
}

async function ensureRemoteDir(sftp, remoteDir, createdDirs) {
  if (createdDirs.has(remoteDir)) return;
  const parts = remoteDir.split('/').filter(Boolean);
  let current = '';
  for (const part of parts) {
    current += `/${part}`;
    if (createdDirs.has(current)) continue;
    // Try to create; ignore if it already exists
    await new Promise((resolve) => {
      sftp.mkdir(current, { mode: 0o755 }, () => {
        resolve(null);
      });
    });
    createdDirs.add(current);
  }
}

async function uploadChangedFiles(
  sftp,
  localManifest,
  remoteManifest,
  remoteVendorRoot
) {
  const createdDirs = new Set();
  const changedFiles = [];

  for (const [relPath, meta] of Object.entries(localManifest)) {
    const remoteMeta = remoteManifest[relPath];
    if (
      !remoteMeta ||
      remoteMeta.size !== meta.size ||
      Math.abs(remoteMeta.mtimeMs - meta.mtimeMs) > 1000
    ) {
      changedFiles.push(relPath);
    }
  }

  if (changedFiles.length === 0) {
    console.log(
      '✅ Vendor directory is already up to date on server (no changes detected).'
    );
    return;
  }

  console.log(`📦 Uploading ${changedFiles.length} changed vendor file(s)...`);

  for (const relPath of changedFiles) {
    const localPath = join(LOCAL_VENDOR_ROOT, relPath);
    const remotePath = pathPosix.join(remoteVendorRoot, relPath);
    const remoteDir = remotePath.substring(0, remotePath.lastIndexOf('/'));

    await ensureRemoteDir(sftp, remoteDir, createdDirs);

    await new Promise((resolve, reject) => {
      const fileName = relPath;
      console.log(`  📄 Uploading: ${fileName}`);
      sftp.fastPut(localPath, remotePath, (err) => {
        if (err) {
          console.error(`  ❌ Failed: ${fileName}`, err.message);
          reject(err);
        } else {
          console.log(`  ✓ ${fileName}`);
          resolve(null);
        }
      });
    });
  }
}

async function main() {
  console.log('📁 Building local vendor manifest from php/vendor...');
  const localManifest = await collectLocalVendorManifest();

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

  // Default vendor root to sibling of domain root under /www to match ../vendor/autoload.php usage
  const remoteRoot = `/home/${envUsername}`;
  const remoteVendorRoot =
    process.env.SITEGROUND_VENDOR_ROOT || `${remoteRoot}/www/vendor`;
  const remoteManifestPath = `${remoteVendorRoot}/.vendor-manifest.json`;

  console.log(
    `🚀 Connecting to ${sshConfig.host}:${sshConfig.port} to upload vendor...`
  );

  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('✅ SSH client :: ready');

        conn.sftp(async (err, sftp) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            // Ensure vendor root exists
            await ensureRemoteDir(sftp, remoteVendorRoot, new Set());

            console.log('📄 Fetching remote vendor manifest (if any)...');
            const remoteManifest = await getRemoteVendorManifest(
              sftp,
              remoteManifestPath
            );

            await uploadChangedFiles(
              sftp,
              localManifest,
              remoteManifest,
              remoteVendorRoot
            );

            // Write updated manifest
            const manifestJson = JSON.stringify(localManifest, null, 2);
            await new Promise((res, rej) => {
              sftp.writeFile(
                remoteManifestPath,
                Buffer.from(manifestJson, 'utf-8'),
                (writeErr) => {
                  if (writeErr) {
                    console.error(
                      '⚠️  Warning: Failed to write remote vendor manifest:',
                      writeErr.message
                    );
                    res(null);
                  } else {
                    console.log('✅ Updated remote vendor manifest');
                    res(null);
                  }
                }
              );
            });

            conn.end();
            resolve(null);
          } catch (e) {
            conn.end();
            reject(e);
          }
        });
      })
      .on('error', (err) => {
        console.error('\n❌ Vendor upload connection error:', err.message);
        console.error(
          '🔐 Authentication method:',
          privateKey ? 'SSH Key' : 'Password'
        );
        reject(err);
      })
      .connect(sshConfig);
  });

  console.log('🎉 Vendor upload completed.');
}

main().catch((err) => {
  console.error('❌ Vendor upload failed:', err && err.message);
  process.exit(1);
});
