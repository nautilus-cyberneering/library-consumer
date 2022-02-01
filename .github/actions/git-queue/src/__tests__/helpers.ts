import * as cp from 'child_process';
import simpleGit, {SimpleGit} from 'simple-git';
import {createTempDir} from 'jest-fixtures';
import * as fs from 'fs';
import * as openpgp from './openpgp';
import * as gpg from './gpg';

export async function createTempEmptyDir(): Promise<string> {
  const tempGitDirPath = await createTempDir();
  return tempGitDirPath;
}

export async function createInitializedTempGnuPGHomeDir(debug: boolean = false): Promise<string> {
  const tempGnuPGHomeDir = await createTempDir();

  if (debug) {
    console.log(`GnuPG homedir: ${tempGnuPGHomeDir}`);
  }

  // Fingerprint of the GPG key we use to sign commit in tests
  const fingerprint = 'BD98B3F42545FF93EFF55F7F3F39AA1432CA6AD7';
  const keygrip = '00CB9308AE0B6DE018C5ADBAB29BA7899D6062BE';

  const gpgPrivateKey = fs.readFileSync('__tests__/fixtures/test-key-committer.pgp', {
    encoding: 'utf8',
    flag: 'r'
  });

  const passphrase = fs.readFileSync('__tests__/fixtures/test-key-committer.pass', {
    encoding: 'utf8',
    flag: 'r'
  });

  await gpg.overwriteAgentConfiguration(gpg.agentConfig, tempGnuPGHomeDir);

  const privateKey = await openpgp.readPrivateKey(gpgPrivateKey);
  if (debug) {
    console.log(`Fingerprint primary key: ${privateKey.fingerprint}`);
  }

  process.env.GNUPGHOME = tempGnuPGHomeDir;

  if (debug) {
    console.log('Importing key ...');
  }

  await gpg.importKey(gpgPrivateKey, tempGnuPGHomeDir).then(stdout => {
    if (debug) {
      console.log(stdout);
    }
  });

  if (debug) {
    console.log(`Presetting passphrase for ${keygrip}`);
  }
  await gpg.presetPassphrase(keygrip, passphrase, tempGnuPGHomeDir).then(stdout => {
    if (debug) {
      console.log(stdout);
    }
  });

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
