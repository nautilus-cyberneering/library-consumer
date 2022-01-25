import * as core from '@actions/core';
import * as context from './context';
import {Queue} from './queue';
import simpleGit, {SimpleGit, CleanOptions} from 'simple-git';

async function run(): Promise<void> {
  try {
    let inputs: context.Inputs = await context.getInputs();

    const gitRepoDir = inputs.gitRepoDir ? inputs.gitRepoDir : process.cwd();
    const git: SimpleGit = simpleGit(gitRepoDir);

    await core.group(`Inputs`, async () => {
      core.info(`Queue name: ${inputs.queueName}`);
      core.info(`Git repository directory: ${gitRepoDir}`);
    });

    let queue = await Queue.create(inputs.queueName, gitRepoDir, git);

    switch (inputs.action) {
      case 'create-job':
        const createJobCommit = await queue.dispatch(inputs.jobPayload, false);

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', true);
          context.setOutput('job_commit', createJobCommit.hash);
        });

        break;
      case 'next-job':
        const nextJob = queue.getNextJob();

        if (!nextJob.isEmpty()) {
          await core.group(`Setting outputs`, async () => {
            context.setOutput('job_commit', nextJob.commit_hash());
            context.setOutput('job_payload', nextJob.payload());
          });
        }

        break;

      case 'mark-job-as-done':
        const markJobAsDoneCommit = await queue.markJobAsDone(inputs.jobPayload, false);

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', true);
          context.setOutput('job_commit', markJobAsDoneCommit.hash);
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
