import { StringOperation } from "./StringOperation";

export class DeleteOperation extends StringOperation {
  constructor(cursorPosition: number) {
    super("delete", cursorPosition);
  }

  operate(content: string): string {
    return StringOperation.splice(content, this.position, 1);
  }

  clone(): DeleteOperation {
    return new DeleteOperation(this.position);
  }

  toString(): string {
    return `
delete(@ ${this.position})
    `.trim();
  }
}
