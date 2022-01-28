import * as os from 'os';
import * as context from '../src/context';
import {dummyPayload} from '../src/__tests__/helpers';

describe('setOutput', () => {
  beforeEach(() => {
    process.stdout.write = jest.fn();
  });

  it('setOutput produces the correct command', () => {
    context.setOutput('some output', 'some value');
    assertWriteCalls([`::set-output name=some output::some value${os.EOL}`]);
  });

  it('setOutput handles bools', () => {
    context.setOutput('some output', false);
    assertWriteCalls([`::set-output name=some output::false${os.EOL}`]);
  });

  it('setOutput handles numbers', () => {
    context.setOutput('some output', 1.01);
    assertWriteCalls([`::set-output name=some output::1.01${os.EOL}`]);
  });
});

describe('getInputs', () => {
  it('should parse the inputs', async () => {
    process.env['INPUT_QUEUE_NAME'] = 'queue name';
    process.env['INPUT_ACTION'] = 'create-job';
    process.env['INPUT_JOB_PAYLOAD'] = dummyPayload();
    process.env['INPUT_GIT_REPO_DIR'] = '/home/';
    process.env['INPUT_GIT_COMMIT_AUTHOR'] = 'A committer <committer@example.com>';
    process.env['INPUT_GIT_COMMIT_SIGNING_KEY'] = '3F39AA1432CA6AD7';

    const inputs = await context.getInputs();

    expect(inputs.queueName).toBe('queue name');
    expect(inputs.action).toBe('create-job');
    expect(inputs.jobPayload).toBe(dummyPayload());
    expect(inputs.gitRepoDir).toBe('/home/');
    expect(inputs.gitCommitAuthor).toBe('A committer <committer@example.com>');
    expect(inputs.gitCommitSigningKey).toBe('3F39AA1432CA6AD7');
  });
});

// Assert that process.stdout.write calls called only with the given arguments.
function assertWriteCalls(calls: string[]): void {
  expect(process.stdout.write).toHaveBeenCalledTimes(calls.length);
  for (let i = 0; i < calls.length; i++) {
    expect(process.stdout.write).toHaveBeenNthCalledWith(i + 1, calls[i]);
  }
}
