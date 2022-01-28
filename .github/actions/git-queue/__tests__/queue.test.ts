import {CommitAuthor} from '../src/commit-author';
import {CommitOptions} from '../src/commit-options';
import {Queue} from '../src/queue';
import {SigningKeyId} from '../src/signing-key-id';
import {createTmpDir, dummyPayload, gitLogForLatestCommit, newSimpleGit} from '../src/__helpers__/helpers';

function commitOptionsForTests(signCommits: boolean = false) {
  let signingKeyId = new SigningKeyId('');

  if (signCommits) {
    signingKeyId = new SigningKeyId('3F39AA1432CA6AD7');
  }

  const commitAuthor = CommitAuthor.fromNameAndEmail('A committer', 'committer@example.com');

  return new CommitOptions(commitAuthor, signingKeyId);
}

describe('Queue', () => {
  it('should dispatch a new job', async () => {
    const gitRepoDir = await createTmpDir();
    const git = await newSimpleGit(gitRepoDir);

    await git.init();

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git);

    await queue.createJob(dummyPayload(), commitOptionsForTests());

    const nextJob = queue.getNextJob();

    expect(nextJob.payload()).toBe(dummyPayload());
  });

  it('should mark a job as done', async () => {
    const gitRepoDir = await createTmpDir();
    const git = await newSimpleGit(gitRepoDir);

    await git.init();

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git);

    await queue.createJob(dummyPayload(), commitOptionsForTests());
    await queue.markJobAsDone(dummyPayload(), commitOptionsForTests());

    const nextJob = queue.getNextJob();

    expect(nextJob.isEmpty()).toBe(true);
  });

  it('should allow to esterify the commit author', async () => {
    const gitRepoDir = await createTmpDir();
    const git = await newSimpleGit(gitRepoDir);

    await git.init();

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git);

    await queue.createJob(dummyPayload(), commitOptionsForTests(true));

    const output = gitLogForLatestCommit(gitRepoDir);

    expect(output.includes('Author: A committer <committer@example.com>')).toBe(true);
  });

  it('should allow to sign commits', async () => {
    const gitRepoDir = await createTmpDir();
    const git = await newSimpleGit(gitRepoDir);

    await git.init();

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git);

    await queue.createJob(dummyPayload(), commitOptionsForTests(true));

    const output = gitLogForLatestCommit(gitRepoDir);

    expect(output.includes('gpg:                using RSA key BD98B3F42545FF93EFF55F7F3F39AA1432CA6AD7')).toBe(true);
  });
});
