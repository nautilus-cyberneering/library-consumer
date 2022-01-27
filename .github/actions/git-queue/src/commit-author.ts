export class CommitAuthor {
  name: string;
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  public toString = (): string => {
    return `${this.name} <${this.email}>`;
  };
}
