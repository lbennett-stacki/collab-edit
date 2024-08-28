import { ToString } from "../types/ToString";
import { assert } from "../validation/assert";
import { deserializeOperation } from "./deserialize";
import { Operation } from "./Operation";

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

  static deserialize(data: string): PendingOperation {
    const pojo = JSON.parse(data);

    assert(pojo.revision).isNumber();
    assert(pojo.operation).isObject();

    const operation = deserializeOperation(pojo.operation);

    return new PendingOperation(operation, pojo.revision);
  }
}
