import {Queue} from '../src/queue';
import {createTmpDir, newSimpleGit} from '../src/__helpers__/helpers';

describe('Queue', () => {
  it('should dispatch a new job', async () => {
    const gitRepoDir = await createTmpDir();
    const git = await newSimpleGit(gitRepoDir);

    await git.init();

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git);

    const payload = JSON.stringify({
      field: 'value'
    });
    const signCommit = false;

    await queue.dispatch(payload, signCommit);

    const nextJob = queue.getNextJob();

    expect(nextJob.payload()).toBe(payload);
  });

  it('should mark a job as done', async () => {
    const gitRepoDir = await createTmpDir();
    const git = await newSimpleGit(gitRepoDir);

    await git.init();

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git);

    const payload = JSON.stringify({
      field: 'value'
    });
    const signCommit = false;

    await queue.dispatch(payload, signCommit);
    await queue.markJobAsDone(payload, signCommit);

    const nextJob = queue.getNextJob();

    expect(nextJob.isEmpty()).toBe(true);
  });
});
