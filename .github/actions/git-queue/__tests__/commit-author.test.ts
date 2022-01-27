import {CommitAuthor} from '../src/commit-author';

describe('CommitAuthor', () => {
  it('should have a name and email', () => {
    const gitUser = new CommitAuthor('A committer', 'committer@example.com');

    expect(gitUser.name).toBe('A committer');
    expect(gitUser.email).toBe('committer@example.com');
  });

  it('should cast to string using the git commit --author option format', () => {
    const gitUser = new CommitAuthor('A committer', 'committer@example.com');

    expect(gitUser.toString()).toBe('A committer <committer@example.com>');
  });
});
