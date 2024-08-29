import { assert } from "../validation/assert";
import { OperationType } from "./Operation";
import { StringOperation } from "./StringOperation";

export class DeleteOperation extends StringOperation {
  constructor(position: number) {
    super(OperationType.DeleteOperation, position);
  }

  operate(content: string): string {
    return StringOperation.splice(content, this.position, 1);
  }

  toString(): string {
    return `
delete(@ ${this.position})
    `.trim();
  }

  clone(): DeleteOperation {
    return new DeleteOperation(this.position);
  }

  static deserialize(data: string | object): DeleteOperation {
    const pojo = typeof data === "string" ? JSON.parse(data) : data;

    assert(pojo.type).is(OperationType.DeleteOperation);
    assert(pojo.position).isNumber();

    return new DeleteOperation(pojo.position);
  }
}
