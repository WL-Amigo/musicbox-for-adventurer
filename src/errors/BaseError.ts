// from https://future-architect.github.io/typescript-guide/exception.html#error
export class BaseError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}
