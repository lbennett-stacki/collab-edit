import { assert } from "../validation/assert";
import { OperationType } from "./Operation";
import { StringOperation } from "./StringOperation";

export class InsertOperation extends StringOperation {
  constructor(
    position: number,
    public readonly value: string,
  ) {
    super(OperationType.InsertOperation, position);
  }

  operate(content: string): string {
    return StringOperation.splice(content, this.position, 0, this.value);
  }

  toString(): string {
    return `
 insert(${this.value} @ ${this.position})
    `.trim();
  }

  clone(): InsertOperation {
    return new InsertOperation(this.position, this.value);
  }

  static deserialize(data: string | object): InsertOperation {
    const pojo = typeof data === "string" ? JSON.parse(data) : data;

    assert(pojo.type).is(OperationType.InsertOperation);
    assert(pojo.position).isNumber();
    assert(pojo.value).isString();

    return new InsertOperation(pojo.position, pojo.value);
  }
}
