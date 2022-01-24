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

    let queue = await Queue.create('QUEUE NAME', git);

    const signCommit = false;

    await queue.dispatch(payload, signCommit);

    const nextJob = queue.getNextJob();

    expect(nextJob.payload()).toBe(payload);
  });

  it('should mark a job as done', async () => {
    const git = await newSimpleGit(await createTmpDir());

    const payload = JSON.stringify({
      field: 'value'
    });

    let queue = await Queue.create('QUEUE NAME', git);

    const signCommit = false;

    await queue.dispatch(payload, signCommit);
    await queue.markJobAsDone(payload, signCommit);

    const nextJob = queue.getNextJob();

    expect(nextJob.isEmpty()).toBe(true);
  });
});
