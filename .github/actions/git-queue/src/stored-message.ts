import {DefaultLogFields} from 'simple-git';
import {nullCommit} from './commit';

export const CREATE_JOB_SUBJECT_PREFIX = 'CLAIM LOCK: JOB: ';
export const MARK_JOB_AS_DONE_SUBJECT_PREFIX = 'RELEASE LOCK: JOB DONE: ';

export abstract class StoredMessage {
  commit: DefaultLogFields;

  constructor(commit: DefaultLogFields) {
    this.commit = commit;
  }

  commitHash(): string {
    return this.commit.hash;
  }

  payload(): string {
    return this.commit.body.trim();
  }

  isEmpty(): boolean {
    return this instanceof ReadNullMessage;
  }
}

export class ReadNullMessage extends StoredMessage {}
export class ReadCreateJobMessage extends StoredMessage {}
export class ReadMarkJobAsDoneMessage extends StoredMessage {}

export function readNullMessage() {
  return new ReadNullMessage(nullCommit());
}

export function messageFactoryFromCommit(commit: DefaultLogFields) {
  const commitSubject = commit.message;

  if (commitSubject.startsWith(CREATE_JOB_SUBJECT_PREFIX)) {
    return new ReadCreateJobMessage(commit);
  }

  if (commitSubject.startsWith(MARK_JOB_AS_DONE_SUBJECT_PREFIX)) {
    return new ReadMarkJobAsDoneMessage(commit);
  }

  throw new Error(`Queue message not found in commit: ${commit.hash}`);
}
