import * as cp from 'child_process';
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

    await queue.createJob(payload);

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

    await queue.createJob(payload);
    await queue.markJobAsDone(payload);

    const nextJob = queue.getNextJob();

    expect(nextJob.isEmpty()).toBe(true);
  });

  it('should allow to sign commits', async () => {
    const gitRepoDir = await createTmpDir();
    const git = await newSimpleGit(gitRepoDir);

    await git.init();

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git);

    const payload = JSON.stringify({
      field: 'value'
    });

    const signingKey = '88966A5B8C01BD04F3DA440427304EDD6079B81C';

    await queue.createJob(payload, signingKey);

    const output = cp.execFileSync('git', ['log', '--show-signature', '-n1']).toString();

    expect(output.includes('gpg:                using RSA key 1250353E4F6CEADD74555FA058508C7950C7B7A2')).toBe(true);
  });
});
