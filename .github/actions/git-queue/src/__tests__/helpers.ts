import * as cp from 'child_process';
import simpleGit, {SimpleGit, CleanOptions} from 'simple-git';
import {createTempDir} from 'jest-fixtures';

export async function createTmpDir(): Promise<string> {
  const tempGitDirPath = await createTempDir();
  return tempGitDirPath;
}

export async function newSimpleGit(baseDir: string): Promise<SimpleGit> {
  const git = simpleGit(baseDir);
  return git;
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
