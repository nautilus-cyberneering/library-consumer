import {DefaultLogFields} from 'simple-git';
import {nullCommit} from './commit';

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
