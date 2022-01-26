import {DefaultLogFields} from 'simple-git';
import {nullCommit} from './commit';

export class ReadMessage {
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

export class ReadNullMessage extends ReadMessage {}
export class ReadCreateJobMessage extends ReadMessage {}
export class ReadMarkJobAsDoneMessage extends ReadMessage {}

export function readNullMessage() {
  return new ReadNullMessage(nullCommit());
}
