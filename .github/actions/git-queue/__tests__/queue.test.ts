import {Queue} from '../src/queue';
import simpleGit, {SimpleGit, CleanOptions} from 'simple-git';
import {createTempDir} from 'jest-fixtures';

async function createTmpDir(): Promise<string> {
  const tempGitDirPath = await createTempDir();
  return tempGitDirPath;
}

async function newSimpleGit(baseDir: string): Promise<SimpleGit> {
  const git = simpleGit(baseDir);
  await git.init();
  return git;
}

describe('Queue', () => {
  it('should dispatch a new job', async () => {
    const git = await newSimpleGit(await createTmpDir());

    const payload = JSON.stringify({
      field: 'value'
    });

    let queue = await Queue.initialize('THIS QUEUE', git);

    const signCommit = false;

    await queue.dispatch(payload, signCommit);

    const nextJob = queue.getNextJob();

    expect(nextJob.payload()).toBe(payload);
  });
});
