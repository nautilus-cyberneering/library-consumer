import * as core from '@actions/core';
import * as context from './context';
import {Queue} from './queue';
import simpleGit, {SimpleGit, CleanOptions} from 'simple-git';
import {CommitAuthor, emptyCommitAuthor} from './commit-author';
import {CommitOptions} from './commit-options';
import {emptySigningKeyId, SigningKeyId} from './signing-key-id';
import {Inputs} from './context';

const ACTION_CREATE_JOB = 'create-job';
const ACTION_NEXT_JOB = 'next-job';
const ACTION_MARK_JOB_AS_DONE = 'mark-job-as-done';

function actionOptions(): string {
  const options = [ACTION_CREATE_JOB, ACTION_NEXT_JOB, ACTION_MARK_JOB_AS_DONE];
  return options.toString();
}

async function getCommitAuthor(commitAuthor: string, git: SimpleGit): Promise<CommitAuthor> {
  if (commitAuthor) {
    return CommitAuthor.fromEmailAddressString(commitAuthor);
  }

  const userName = await getGitConfig('user.name', git);
  const userEmail = await getGitConfig('user.email', git);

  if (userName && userEmail) {
    return CommitAuthor.fromNameAndEmail(userName, userEmail);
  }

  return emptyCommitAuthor();
}

async function getSigningKeyId(signingKeyId: string, git: SimpleGit): Promise<SigningKeyId> {
  if (signingKeyId) {
    return new SigningKeyId(signingKeyId);
  }

  const signingkey = await getGitConfig('user.signingkey', git);

  if (signingkey) {
    return new SigningKeyId(signingKeyId);
  }

  return emptySigningKeyId();
}

async function getGitConfig(key: string, git: SimpleGit): Promise<string | null> {
  const localOption = await git.getConfig(key, 'local');
  if (localOption.value) return localOption.value;

  const globalOption = await git.getConfig(key, 'global');
  if (globalOption.value) return globalOption.value;

  const systemOption = await git.getConfig(key, 'system');
  if (systemOption.value) return systemOption.value;

  return null;
}

async function getCommitOptions(inputs: Inputs, git: SimpleGit): Promise<CommitOptions> {
  const commitAuthor = await getCommitAuthor(inputs.gitCommitAuthor, git);
  const commitSigningKeyId = await getSigningKeyId(inputs.gitCommitSigningKey, git);
  const commitOptions = new CommitOptions(commitAuthor, commitSigningKeyId);
  return commitOptions;
}

async function run(): Promise<void> {
  try {
    let inputs: context.Inputs = await context.getInputs();
    const gitRepoDir = inputs.gitRepoDir ? inputs.gitRepoDir : process.cwd();
    const git: SimpleGit = simpleGit(gitRepoDir);

    let queue = await Queue.create(inputs.queueName, gitRepoDir, git);

    const commitOptions = await getCommitOptions(inputs, git);

    switch (inputs.action) {
      case ACTION_CREATE_JOB:
        const createJobCommit = await queue.createJob(inputs.jobPayload, commitOptions);

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', true);
          context.setOutput('job_commit', createJobCommit.hash);

          core.info(`job_created: true`);
          core.info(`job_commit: ${createJobCommit.hash}`);
        });

        break;

      case ACTION_NEXT_JOB:
        const nextJob = queue.getNextJob();

        if (!nextJob.isEmpty()) {
          await core.group(`Setting outputs`, async () => {
            context.setOutput('job_commit', nextJob.commitHash());
            context.setOutput('job_payload', nextJob.payload());

            core.info(`job_commit: ${nextJob.commitHash()}`);
            core.info(`job_payload: ${nextJob.payload()}`);
          });
        }

        break;

      case ACTION_MARK_JOB_AS_DONE:
        const markJobAsDoneCommit = await queue.markJobAsDone(inputs.jobPayload, commitOptions);

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', true);
          context.setOutput('job_commit', markJobAsDoneCommit.hash);

          core.info(`job_created: true`);
          core.info(`job_commit: ${markJobAsDoneCommit.hash}`);
        });

        break;
      default:
        core.error(`Invalid action. Actions can only be: ${actionOptions}`);
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
