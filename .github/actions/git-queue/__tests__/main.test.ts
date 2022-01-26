import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import {expect, test} from '@jest/globals';
import {createTmpDir, newSimpleGit} from '../src/__helpers__/helpers';

function executeAction(env) {
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'main.js');
  const options: cp.ExecFileSyncOptions = {
    env: env
  };
  return cp.execFileSync(np, [ip], options).toString();
}

function dummyPayload() {
  return JSON.stringify({
    field: 'value'
  });
}

async function newInitializedTmpGitDir() {
  const gitRepoDir = await createTmpDir();
  const git = await newSimpleGit(gitRepoDir);
  await git.init();
  return gitRepoDir;
}

function createJob() {
  process.env['INPUT_ACTION'] = 'create-job';
  process.env['INPUT_JOB_PAYLOAD'] = dummyPayload();
  executeAction(process.env);
}

describe('GitHub Action', () => {
  let gitRepoDir: String;

  beforeEach(async () => {
    process.env['INPUT_QUEUE_NAME'] = 'QUEUE-NAME';
    process.env['INPUT_GIT_REPO_DIR'] = await newInitializedTmpGitDir();
    gitRepoDir = process.env['INPUT_GIT_REPO_DIR'];
    // console.log(`New git tmp dir ${gitRepoDir}`);
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
    expect(output.includes('::set-output name=job_payload::{"field":"value"}')).toBe(true);
  });

  it('should mark the pending job as done', async () => {
    createJob();

    process.env['INPUT_ACTION'] = 'mark-job-as-done';

    const output = executeAction(process.env);

    expect(output.includes('::set-output name=job_created::true')).toBe(true);
    expect(output.includes('::set-output name=job_commit::')).toBe(true);
  });
});
