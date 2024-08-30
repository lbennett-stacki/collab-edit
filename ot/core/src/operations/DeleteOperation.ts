import { assert } from "../validation/assert";
import { OperationType } from "./Operation";
import { StringOperation } from "./StringOperation";

export class DeleteOperation extends StringOperation {
  constructor(
    position: number,
    public length: number,
  ) {
    super(OperationType.DeleteOperation, position);
    this.length = length <= 0 ? 1 : length;
  }

  operate(content: string): string {
    return StringOperation.splice(
      content,
      this.length > 1 ? this.position + 1 : this.position,
      this.length,
      "",
    );
  }

  toString(): string {
    return `
delete(@ ${this.position})
    `.trim();
  }

  clone(): DeleteOperation {
    return new DeleteOperation(this.position, this.length);
  }

  static deserialize(data: string | object): DeleteOperation {
    const pojo = typeof data === "string" ? JSON.parse(data) : data;

    assert(pojo.type).is(OperationType.DeleteOperation);
    assert(pojo.position).isNumber();
    assert(pojo.length).isNumber();

    return new DeleteOperation(pojo.position, pojo.length);
  }
}
