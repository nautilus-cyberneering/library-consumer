import {Email} from '../src/email';

describe('Email', () => {
  it('should validate an email address', () => {
    const t = () => {
      new Email('abc_NO_AT_example.com');
    };
    expect(t).toThrow(Error);
  });
});
