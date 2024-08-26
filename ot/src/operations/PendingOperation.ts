import { Operation, ToString } from "./Operation";

export class PendingOperation implements ToString {
  constructor(
    public operation: Operation,
    public revision: number,
  ) {}

  toString(): string {
    return `
pending#${this.revision}<${this.operation.toString()}>
    `.trim();
  }

  clone(): PendingOperation {
    return new PendingOperation(this.operation.clone(), this.revision);
  }
}
