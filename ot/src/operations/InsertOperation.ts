import { StringOperation } from "./StringOperation";

export class InsertOperation extends StringOperation {
  constructor(
    position: number,
    public readonly value: string,
  ) {
    super("insert", position);
  }

  operate(content: string): string {
    return StringOperation.splice(content, this.position, 0, this.value);
  }

  clone(): InsertOperation {
    return new InsertOperation(this.position, this.value);
  }

  toString(): string {
    return `
 insert(${this.value} @ ${this.position})
    `.trim();
  }
}
