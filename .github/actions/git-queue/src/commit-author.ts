import {Email} from './email';

export class CommitAuthor {
  name: string;
  email: Email;

  constructor(name: string, email: Email) {
    this.name = name;
    this.email = email;
  }

  public toString = (): string => {
    return `${this.name} <${this.email}>`;
  };
}
