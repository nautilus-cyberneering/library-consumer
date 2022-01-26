import * as core from '@actions/core';
import * as context from './context';
import {Queue} from './queue';
import simpleGit, {SimpleGit, CleanOptions} from 'simple-git';

async function run(): Promise<void> {
  try {
    let inputs: context.Inputs = await context.getInputs();
    const gitRepoDir = inputs.gitRepoDir ? inputs.gitRepoDir : process.cwd();
    const git: SimpleGit = simpleGit(gitRepoDir);

    let queue = await Queue.create(inputs.queueName, gitRepoDir, git);

    switch (inputs.action) {
      case 'create-job':
        const createJobCommit = await queue.createJob(inputs.jobPayload);

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', true);
          context.setOutput('job_commit', createJobCommit.hash);

          core.info(`job_created: true`);
          core.info(`job_commit: ${createJobCommit.hash}`);
        });

        break;
      case 'next-job':
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

      case 'mark-job-as-done':
        const markJobAsDoneCommit = await queue.markJobAsDone(inputs.jobPayload);

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', true);
          context.setOutput('job_commit', markJobAsDoneCommit.hash);

          core.info(`job_created: true`);
          core.info(`job_commit: ${markJobAsDoneCommit.hash}`);
        });

        break;
      default:
        core.error('Invalid action');
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
