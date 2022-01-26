import {DefaultLogFields, SimpleGit, CheckRepoActions, GitResponseError} from 'simple-git';
import {Commit} from './commit';
import {ReadCreateJobMessage, StoredMessage, readNullMessage, messageFactoryFromCommit, createJobCommitSubject, markJobAsDoneCommitSubject} from './stored-message';

export class Queue {
  name: string;
  gitRepoDir: string;
  git: SimpleGit;
  storedMessages: ReadonlyArray<StoredMessage>;

  private constructor(name: string, gitRepoDir: string, git: SimpleGit) {
    this.name = name;
    this.gitRepoDir = gitRepoDir;
    this.git = git;
    this.storedMessages = [];
  }

  static async create(name: string, gitRepoDir: string, git: SimpleGit): Promise<Queue> {
    let queue = new Queue(name, gitRepoDir, git);
    await queue.loadMessagesFromGit();
    return queue;
  }

  async loadMessagesFromGit() {
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw Error(`Invalid git dir: ${this.gitRepoDir}`);
    }

    const status = await this.git.status();
    const currentBranch = status.current;

    try {
      const gitLog = await this.git.log();
      const commits = gitLog.all.filter(commit => this.commitBelongsToQueue(commit));
      this.storedMessages = commits.map(commit => messageFactoryFromCommit(commit));
    } catch (err) {
      if ((err as GitResponseError).message.includes(`fatal: your current branch '${currentBranch}' does not have any commits yet`)) {
        // no commits yet
      } else {
        throw err;
      }
    }
  }

  commitBelongsToQueue(commit: DefaultLogFields) {
    return commit.message.endsWith(this.name) ? true : false;
  }

  getMessages(): ReadonlyArray<StoredMessage> {
    return this.storedMessages;
  }

  getLatestMessage(): StoredMessage {
    return this.isEmpty() ? readNullMessage() : this.storedMessages[0];
  }

  isEmpty(): boolean {
    return this.storedMessages.length == 0;
  }

  getNextJob(): StoredMessage {
    const latestMessage = this.getLatestMessage();
    return latestMessage instanceof ReadCreateJobMessage ? latestMessage : readNullMessage();
  }

  guardThatThereIsNoPendingJobs() {
    if (!this.getNextJob().isEmpty()) {
      throw new Error(`Can't create a new job. There is already a pending job in commit: ${this.getNextJob().commitHash()}`);
    }
  }

  guardThatThereIsAPendingJob() {
    if (this.getNextJob().isEmpty()) {
      throw new Error(`Can't mark job as done. There isn't any pending job`);
    }
  }

  async commitAndPush(message: string[], signingKey: string = ''): Promise<Commit> {
    const commit = await this.commit(message, signingKey);
    this.push();
    return commit;
  }

  async commit(message: string[], signingKey: string = ''): Promise<Commit> {
    const commitResult = await this.git.commit(message, this.commitOptions(signingKey));
    await this.loadMessagesFromGit();
    return new Commit(commitResult.commit);
  }

  async push() {
    if ((await this.git.remote([])) != '') {
      this.git.push();
    }
  }

  commitOptions(signingKey: string = '') {
    return {
      '--allow-empty': null,
      ...(signingKey == '' && {'--no-gpg-sign': null}),
      ...(signingKey != '' && {
        '--gpg-sign': signingKey
      })
    };
  }

  async dispatch(payload: string, signingKey: string = ''): Promise<Commit> {
    this.guardThatThereIsNoPendingJobs();

    const message = [`${createJobCommitSubject(this.name)}`, `${payload}`];

    const commit = await this.commitAndPush(message, signingKey);

    return commit;
  }

  async markJobAsDone(payload: string, signingKey: string = '') {
    this.guardThatThereIsAPendingJob();

    const message = [`${markJobAsDoneCommitSubject(this.name)}`, `${payload}`];

    const commit = await this.commitAndPush(message, signingKey);

    return commit;
  }
}
