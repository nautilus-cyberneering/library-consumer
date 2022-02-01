import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import {expect, test} from '@jest/globals';
import {dummyPayload, gitLogForLatestCommit, createInitializedTempGitDir, createInitializedTempGnuPGHomeDir} from '../src/__tests__/helpers';
import {testConfiguration} from '../src/__tests__/config';

function executeAction(env) {
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'main.js');
  const options: cp.ExecFileSyncOptions = {
    env: env
  };
  return cp.execFileSync(np, [ip], options).toString();
}

function createJob() {
  process.env['INPUT_ACTION'] = 'create-job';
  process.env['INPUT_JOB_PAYLOAD'] = dummyPayload();
  executeAction(process.env);
}

describe('GitHub Action', () => {
  let gitRepoDir: string;

  beforeEach(async () => {
    process.env['INPUT_QUEUE_NAME'] = 'QUEUE-NAME';
    process.env['INPUT_GIT_REPO_DIR'] = await createInitializedTempGitDir();
    gitRepoDir = process.env['INPUT_GIT_REPO_DIR'];
  });

  it('should create a new job', async () => {
    process.env['INPUT_ACTION'] = 'create-job';
    process.env['INPUT_JOB_PAYLOAD'] = dummyPayload();

    const output = executeAction(process.env);

    expect(output.includes('::set-output name=job_created::true')).toBe(true);
    expect(output.includes('::set-output name=job_commit::')).toBe(true);
  });

  it('should get the next job', async () => {
    createJob();

    process.env['INPUT_ACTION'] = 'next-job';

    const output = executeAction(process.env);

    expect(output.includes('::set-output name=job_commit::')).toBe(true);
    expect(output.includes(`::set-output name=job_payload::${dummyPayload()}`)).toBe(true);
  });

  it('should mark the pending job as done', async () => {
    createJob();

    process.env['INPUT_ACTION'] = 'mark-job-as-done';

    const output = executeAction(process.env);

    expect(output.includes('::set-output name=job_created::true')).toBe(true);
    expect(output.includes('::set-output name=job_commit::')).toBe(true);
  });

  it('should allow to overwrite commit author', async () => {
    process.env['INPUT_ACTION'] = 'create-job';
    process.env['INPUT_JOB_PAYLOAD'] = dummyPayload();
    process.env['INPUT_GIT_COMMIT_AUTHOR'] = 'A committer <committer@example.com>';

    executeAction(process.env);

    const gitLogOutput = gitLogForLatestCommit(gitRepoDir);

    expect(gitLogOutput.includes('Author: A committer <committer@example.com>')).toBe(true);
  });

  it('should allow to overwrite commit signing key', async () => {
    const gnuPGHomeDir = await createInitializedTempGnuPGHomeDir();
    const signingKeyFingerprint = testConfiguration().gpg_signing_key.fingerprint;

    process.env['INPUT_ACTION'] = 'create-job';
    process.env['INPUT_JOB_PAYLOAD'] = dummyPayload();
    process.env['INPUT_GIT_COMMIT_GPG_SIGN'] = signingKeyFingerprint;

    const env = {...process.env};

    env.GNUPGHOME = gnuPGHomeDir;

    executeAction(env);

    const gitLogOutput = gitLogForLatestCommit(gitRepoDir);

    expect(gitLogOutput.includes(`gpg:                using RSA key ${signingKeyFingerprint}`)).toBe(true);
  });

  it('should allow to disable commit signing for a given commit', async () => {
    process.env['INPUT_ACTION'] = 'create-job';
    process.env['INPUT_JOB_PAYLOAD'] = dummyPayload();
    process.env['INPUT_GIT_COMMIT_NO_GPG_SIGN'] = 'true';

    executeAction(process.env);

    const gitLogOutput = gitLogForLatestCommit(gitRepoDir);

    expect(!gitLogOutput.includes('gpg: Signature')).toBe(true);
  });
});
