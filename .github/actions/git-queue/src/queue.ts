import {DefaultLogFields, ListLogLine, SimpleGit} from 'simple-git';
import * as git from './git';

class Message {
  commit: DefaultLogFields;

  constructor(commit: DefaultLogFields) {
    this.commit = commit;
  }

  commit_hash() {
    return this.commit.hash;
  }

  payload() {
    return this.commit.body;
  }
}

class CreateJobMessage extends Message {}
class MarkJobAsDoneMessage extends Message {}

export class Queue {
  name: string;
  commits: ReadonlyArray<DefaultLogFields>;
  messages: ReadonlyArray<Message>;

  constructor(name: string, gitLog: ReadonlyArray<DefaultLogFields>) {
    this.name = name;
    this.commits = gitLog.filter(commit => this.commitBelongsToQueue(commit));
    this.messages = this.commits.map(commit => this.messageFactory(commit));
  }

  commitBelongsToQueue(commit: DefaultLogFields) {
    return this.isCreateJobCommit(commit) || this.isMarkJobAsDoneCommit(commit) ? true : false;
  }

  messageFactory(commit: DefaultLogFields) {
    if (this.isCreateJobCommit(commit)) {
      return new CreateJobMessage(commit);
    }

    if (this.isMarkJobAsDoneCommit(commit)) {
      return new MarkJobAsDoneMessage(commit);
    }

    throw new Error(`Invalid queue commit: ${commit.hash}`);
  }

  isCreateJobCommit(commit: DefaultLogFields) {
    const creteJobCommitSubject = `CLAIM LOCK: JOB: ${this.name}`;
    if (commit.message == creteJobCommitSubject) {
      return true;
    }
    return false;
  }

  isMarkJobAsDoneCommit(commit: DefaultLogFields) {
    const markJobAsDoneCommitSubject = `RELEASE LOCK: JOB DONE: ${this.name}`;
    if (commit.message == markJobAsDoneCommitSubject) {
      return true;
    }
    return false;
  }

  getCommits() {
    return this.commits;
  }

  getMessages() {
    return this.messages;
  }

  getLatestMessage() {
    return this.isEmpty() ? null : this.messages[0];
  }

  isEmpty() {
    return this.messages.length == 0;
  }

  getNextJob() {
    if (this.isEmpty()) {
      return null;
    }

    const latestMsg = this.getLatestMessage();

    if (latestMsg == null) {
      return null;
    }

    if (latestMsg instanceof MarkJobAsDoneMessage) {
      return null;
    }

    return latestMsg;
  }
}
