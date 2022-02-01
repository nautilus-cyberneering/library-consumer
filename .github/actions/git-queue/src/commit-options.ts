import {CommitAuthor} from './commit-author';
import {SigningKeyId} from './signing-key-id';

export class CommitOptions {
  commitAuthor: CommitAuthor;
  signingKeyId: SigningKeyId;
  noGpgSig: boolean;

  constructor(commitAuthor: CommitAuthor, signingKeyId: SigningKeyId, noGpgSig: boolean) {
    this.commitAuthor = commitAuthor;
    this.signingKeyId = signingKeyId;
    this.noGpgSig = noGpgSig;
  }

  forSimpleGit() {
    return {
      '--allow-empty': null,
      ...(!this.commitAuthor.isEmpty() && {'--author': `"${this.commitAuthor.toString()}"`}),
      ...(!this.signingKeyId.isEmpty() && {
        '--gpg-sign': this.signingKeyId.toString()
      }),
      ...(this.noGpgSig && {'--no-gpg-sign': null})
    };
  }

  toString(): string {
    const allowEmpty = '--allow-empty';
    const commitAuthor = this.commitAuthor.isEmpty() ? '' : `--author="${this.commitAuthor.toString()}"`;
    const signingKeyId = this.signingKeyId.isEmpty() ? '' : `--gpg-sign=${this.signingKeyId.toString()}`;
    const noGpgSig = this.noGpgSig ? '--no-gpg-sign' : '';
    return `${allowEmpty} ${commitAuthor} ${signingKeyId} ${noGpgSig}`;
  }
}
