import { readFile, writeFile, chmod, unlink } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const SOURCE_FILE = 'delete-this-file.txt';
const PRIVATE_KEY_NAME = 'giftmanager_siteground_id_ed25519';

async function main() {
  const sourcePath = join(process.cwd(), SOURCE_FILE);

  let contents;
  try {
    contents = await readFile(sourcePath, 'utf-8');
  } catch (err) {
    console.error(`❌ Could not read ${SOURCE_FILE}:`, err && err.message);
    process.exit(1);
  }

  // Extract private key block by simple string search to be robust against formatting
  const beginMarker = '-----BEGIN OPENSSH PRIVATE KEY-----';
  const endMarker = '-----END OPENSSH PRIVATE KEY-----';
  const beginIdx = contents.indexOf(beginMarker);
  const endIdx = contents.indexOf(endMarker);

  if (beginIdx === -1 || endIdx === -1) {
    console.error(
      '❌ Could not find an OPENSSH private key block in delete-this-file.txt.'
    );
    process.exit(1);
  }

  const privateKey = `${contents
    .substring(beginIdx, endIdx + endMarker.length)
    .trim()}\n`;

  // Extract public key line that starts with `public key:`
  const lines = contents.split(/\r?\n/);
  const publicLine = lines.find((line) =>
    line.toLowerCase().startsWith('public key:')
  );

  if (!publicLine) {
    console.error(
      '❌ Could not find a line starting with "public key:" in delete-this-file.txt.'
    );
    process.exit(1);
  }

  const publicKey = publicLine.replace(/^[Pp]ublic key:\s*/, '').trim() + '\n';

  const sshDir = join(homedir(), '.ssh');
  const privateKeyPath = join(sshDir, PRIVATE_KEY_NAME);
  const publicKeyPath = `${privateKeyPath}.pub`;

  try {
    await writeFile(privateKeyPath, privateKey, { flag: 'wx' });
    await chmod(privateKeyPath, 0o600);
    await writeFile(publicKeyPath, publicKey, { flag: 'wx' });
  } catch (err) {
    console.error(
      `❌ Failed to write SSH keys. Make sure ${privateKeyPath} does not already exist.`,
      err && err.message
    );
    process.exit(1);
  }

  try {
    await unlink(sourcePath);
  } catch (err) {
    console.error(
      `⚠️  Wrote keys but failed to delete ${SOURCE_FILE}. Please delete it manually.`,
      err && err.message
    );
  }

  console.log('✅ SiteGround SSH keys have been written to:');
  console.log(`   Private: ${privateKeyPath}`);
  console.log(`   Public : ${publicKeyPath}`);
  console.log('');
  console.log('➡️  Add this to your .env file:');
  console.log(`   SITEGROUND_AUTH_KEY=${privateKeyPath}`);
}

main().catch((err) => {
  console.error('❌ Failed to set up SiteGround SSH keys:', err && err.message);
  process.exit(1);
});
