export class Email {
  email: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw Error(`Invalid email: ${email}`);
    }
    this.email = email;
  }

  private isValid(email: string) {
    return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(email);
  }

  public toString = (): string => {
    return this.email;
  };
}
