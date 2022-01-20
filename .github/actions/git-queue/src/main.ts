import * as core from '@actions/core';
import * as context from './context';
import * as git from './git';

async function run(): Promise<void> {
  try {
    let inputs: context.Inputs = await context.getInputs();
    
    if (inputs.queue) {
      core.info(`queue: ${inputs.queue}`);
    }

    switch (inputs.action) {
      case 'create-job':

        const output = await git.revList()
        core.info(output);

        // TODO:
        // Implement get-active-lock.sh script.
        // Use https://github.com/nodegit/nodegit?

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job-created', true);
          context.setOutput('job-commit', 'commit');
        });
        break;
      case 'next-job':
        // TODO
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
