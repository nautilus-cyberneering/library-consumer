import {EmailAddress} from '../src/email-address';

describe('EmailAddress', () => {
  it('should accept email addresses with display name', () => {
    const emailAddress = new EmailAddress('A Committer <committer@example.com>');

    expect(emailAddress.getDisplayName()).toBe('A Committer');
    expect(emailAddress.getEmail()).toBe('committer@example.com');
  });

  it('should print the email address with display name', () => {
    const emailAddress = new EmailAddress('A Committer <committer@example.com>');

    expect(emailAddress.toString()).toBe('A Committer <committer@example.com>');
  });

  it('should validate a simple email address', () => {
    const t = () => {
      new EmailAddress('abc_NO_AT_example.com');
    };
    expect(t).toThrow(Error);
  });

  it('should validate a email address with display name', () => {
    const t = () => {
      new EmailAddress('A Committer <abc_NO_AT_example.com>');
    };
    expect(t).toThrow(Error);
  });
});
