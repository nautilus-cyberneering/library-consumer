import {Queue} from '../src/queue';

describe('Queue', () => {
  it('should extract its own messages from a git log output', () => {
    const gitLog = [
      {
        hash: '064d7f8963bcfe0802b61d8770653ebdc7fe1447',
        date: '2022-01-18T11:47:55+00:00',
        message: 'CLAIM LOCK: JOB: THIS QUEUE',
        refs: '',
        body: '',
        author_name: 'github-actions[bot]',
        author_email: 'github-actions[bot]@users.noreply.github.com'
      },
      {
        hash: '064d7f8963bcfe0802b61d8770653ebdc7fe1447',
        date: '2022-01-18T11:47:55+00:00',
        message: 'CLAIM LOCK: JOB: ANOTHER QUEUE',
        refs: '',
        body: '',
        author_name: 'github-actions[bot]',
        author_email: 'github-actions[bot]@users.noreply.github.com'
      }
    ];

    let queue = new Queue('THIS QUEUE', gitLog);

    const expectedMessages = [
      {
        commit: {
          hash: '064d7f8963bcfe0802b61d8770653ebdc7fe1447',
          date: '2022-01-18T11:47:55+00:00',
          message: 'CLAIM LOCK: JOB: THIS QUEUE',
          refs: '',
          body: '',
          author_name: 'github-actions[bot]',
          author_email: 'github-actions[bot]@users.noreply.github.com'
        }
      }
    ];

    expect(queue.getMessages()).toEqual(expectedMessages);
  });

  it('should return the next job to process', () => {
    const gitLog = [
      {
        hash: '064d7f8963bcfe0802b61d8770653ebdc7fe1447',
        date: '2022-01-18T11:47:55+00:00',
        message: 'CLAIM LOCK: JOB: THIS QUEUE',
        refs: '',
        body: '',
        author_name: 'github-actions[bot]',
        author_email: 'github-actions[bot]@users.noreply.github.com'
      }
    ];

    let queue = new Queue('THIS QUEUE', gitLog);

    const expectedMessage = {
      commit: {
        hash: '064d7f8963bcfe0802b61d8770653ebdc7fe1447',
        date: '2022-01-18T11:47:55+00:00',
        message: 'CLAIM LOCK: JOB: THIS QUEUE',
        refs: '',
        body: '',
        author_name: 'github-actions[bot]',
        author_email: 'github-actions[bot]@users.noreply.github.com'
      }
    };

    expect(queue.getNextJob()).toEqual(expectedMessage);
  });
});
