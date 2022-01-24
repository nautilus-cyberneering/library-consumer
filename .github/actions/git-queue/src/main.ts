import * as core from '@actions/core';
import * as context from './context';
import {Queue} from './queue';
import {git} from './git';

async function run(): Promise<void> {
  try {
    let inputs: context.Inputs = await context.getInputs();

    if (inputs.queueName) {
      core.info(`queue: ${inputs.queueName}`);
    }

    let queue = await Queue.initialize(inputs.queueName, git);

    switch (inputs.action) {
      case 'create-job':
        const commit = await queue.dispatch(inputs.jobPayload, false);

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', true);          
          context.setOutput('job_commit', commit.hash);
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
        // TODO
        break;
      default:
        core.error('Invalid action');
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
