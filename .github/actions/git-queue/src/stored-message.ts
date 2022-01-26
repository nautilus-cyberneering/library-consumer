import {DefaultLogFields} from 'simple-git';
import {nullCommit} from './commit';

const CREATE_JOB_SUBJECT_PREFIX = 'CLAIM LOCK: JOB: ';
const MARK_JOB_AS_DONE_SUBJECT_PREFIX = 'RELEASE LOCK: JOB DONE: ';

export class StoredMessage {
  commit: DefaultLogFields;

  constructor(commit: DefaultLogFields) {
    this.commit = commit;
  }

  commitHash(): String {
    return this.commit.hash;
  }

  payload(): String {
    return this.commit.body.trim();
  }

  isEmpty(): Boolean {
    return this instanceof ReadNullMessage;
  }
}

export class ReadNullMessage extends StoredMessage {}
export class ReadCreateJobMessage extends StoredMessage {}
export class ReadMarkJobAsDoneMessage extends StoredMessage {}

export function readNullMessage() {
  return new ReadNullMessage(nullCommit());
}

function isCreateJobCommit(commitMessage: string): boolean {
  return commitMessage.startsWith(CREATE_JOB_SUBJECT_PREFIX) ? true : false;
}

function isMarkJobAsDoneCommit(commitMessage: string): boolean {
  return commitMessage.startsWith(MARK_JOB_AS_DONE_SUBJECT_PREFIX) ? true : false;
}

export function messageFactoryFromCommit(commit: DefaultLogFields) {
  if (isCreateJobCommit(commit.message)) {
    return new ReadCreateJobMessage(commit);
  }

  if (isMarkJobAsDoneCommit(commit.message)) {
    return new ReadMarkJobAsDoneMessage(commit);
  }

  throw new Error(`Invalid queue message in commit: ${commit.hash}`);
}

export function createJobCommitSubject(queueName: string) {
  return `${CREATE_JOB_SUBJECT_PREFIX}${queueName}`;
}

export function markJobAsDoneCommitSubject(queueName: string) {
  return `${MARK_JOB_AS_DONE_SUBJECT_PREFIX}${queueName}`;
}
