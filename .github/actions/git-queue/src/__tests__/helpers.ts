import * as cp from 'child_process';
import simpleGit, {SimpleGit, CleanOptions} from 'simple-git';
import {createTempDir} from 'jest-fixtures';
import * as fs from 'fs';
import * as openpgp from './openpgp';
import * as gpg from './gpg';

export async function createTempEmptyDir(): Promise<string> {
  const tempGitDirPath = await createTempDir();
  return tempGitDirPath;
}

export async function createTempGnuPGHomeDir(): Promise<string> {
  const tempGnuPGHomeDir = await createTempDir();

  // Fingerprint of the GPG key we use to sign commit in tests
  const fingerprint = 'BD98B3F42545FF93EFF55F7F3F39AA1432CA6AD7';

  const gpgPrivateKey = fs.readFileSync('__tests__/fixtures/test-key-committer.pgp', {
    encoding: 'utf8',
    flag: 'r'
  });

  const passphrase = fs.readFileSync('__tests__/fixtures/test-key-committer.pass', {
    encoding: 'utf8',
    flag: 'r'
  });

  const privateKey = await openpgp.readPrivateKey(gpgPrivateKey);
  console.log(`Fingerprint primary key: ${privateKey.fingerprint}`);

  process.env.GNUPGHOME = tempGnuPGHomeDir;

  console.log('Importing key ...');
  await gpg.importKey(gpgPrivateKey, tempGnuPGHomeDir).then(stdout => {
    console.log(stdout);
  });

  for (let keygrip of await gpg.getKeygrips(fingerprint, tempGnuPGHomeDir)) {
    console.log(`Presetting passphrase for ${keygrip}`);
    await gpg.presetPassphrase(keygrip, passphrase).then(stdout => {
      console.log(stdout);
    });
  }

  return tempGnuPGHomeDir;
}

export async function newSimpleGit(baseDir: string, initializeGit: boolean = false): Promise<SimpleGit> {
  const git = simpleGit(baseDir);
  if (initializeGit) {
    await git.init();
  }
  return git;
}

export async function createInitializedTempGitDir() {
  const gitRepoDir = await createTempEmptyDir();
  const git = await newSimpleGit(gitRepoDir, true);
  return gitRepoDir;
}

export function dummyPayload() {
  return JSON.stringify({
    field: 'value'
  });
}

export function gitLogForLatestCommit(gitRepoDir: string): string {
  const output = cp
    .execFileSync('git', ['log', '--show-signature', '-n1'], {
      cwd: gitRepoDir
    })
    .toString();
  return output;
}
