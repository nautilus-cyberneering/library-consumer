import {CommitAuthor} from './commit-author';
import {SigningKeyId} from './signing-key-id';

export class CommitOptions {
  commitAuthor: CommitAuthor;
  signingKeyId: SigningKeyId;

  constructor(commitAuthor: CommitAuthor, signingKeyId: SigningKeyId) {
    this.commitAuthor = commitAuthor;
    this.signingKeyId = signingKeyId;
  }

  forSimpleGit() {
    return {
      '--allow-empty': null,
      '--author': `"${this.commitAuthor.toString()}"`,
      ...(this.signingKeyId.isEmpty() && {'--no-gpg-sign': null}),
      ...(!this.signingKeyId.isEmpty() && {
        '--gpg-sign': this.signingKeyId.toString()
      })
    };
  }
}
