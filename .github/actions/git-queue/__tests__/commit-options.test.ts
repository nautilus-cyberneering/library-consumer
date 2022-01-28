import {CommitAuthor} from '../src/commit-author';
import {CommitOptions} from '../src/commit-options';
import {EmailAddress} from '../src/email-address';
import {SigningKeyId} from '../src/signing-key-id';

describe('CommitOptions', () => {
  it('should always include --allow-empty option', () => {
    const commitAuthor = new CommitAuthor(new EmailAddress('A Committer <committer@example.com>'));
    const singingKeyId = new SigningKeyId('');

    const commitOptions = new CommitOptions(commitAuthor, singingKeyId);

    expect(commitOptions.forSimpleGit()).toMatchObject({'--allow-empty': null});
  });

  it('should allow to add a commit author', () => {
    const commitAuthor = new CommitAuthor(new EmailAddress('A Committer <committer@example.com>'));
    const singingKeyId = new SigningKeyId('');

    const commitOptions = new CommitOptions(commitAuthor, singingKeyId);

    expect(commitOptions.forSimpleGit()).toMatchObject({'--author': '"A Committer <committer@example.com>"'});
  });

  it('should allow to sign commits', () => {
    const commitAuthor = new CommitAuthor(new EmailAddress('A Committer <committer@example.com>'));
    const singingKeyId = new SigningKeyId('3F39AA1432CA6AD7');

    const commitOptions = new CommitOptions(commitAuthor, singingKeyId);

    expect(commitOptions.forSimpleGit()).toMatchObject({'--gpg-sign': '3F39AA1432CA6AD7'});
  });

  it('should allow not to sign commits', () => {
    const commitAuthor = new CommitAuthor(new EmailAddress('A Committer <committer@example.com>'));
    const singingKeyId = new SigningKeyId('');

    const commitOptions = new CommitOptions(commitAuthor, singingKeyId);

    expect(commitOptions.forSimpleGit()).toMatchObject({'--no-gpg-sign': null});
  });
});
