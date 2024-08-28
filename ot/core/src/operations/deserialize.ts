import { DeleteOperation } from "./DeleteOperation";
import { InsertOperation } from "./InsertOperation";
import { isOperationType, Operation, OperationType } from "./Operation";

const operations = {
  [OperationType.InsertOperation]: InsertOperation,
  [OperationType.DeleteOperation]: DeleteOperation,
} satisfies Record<OperationType, unknown>;

export function deserializeOperation(data: string | object): Operation {
  const operationPojo = typeof data === "string" ? JSON.parse(data) : data;

  const type = operationPojo.type;
  if (!isOperationType(type)) {
    throw new Error("Unknown operation type");
  }

  const Operation = operations[type];

  if (!Operation) {
    throw new Error("Unknown operation type");
  }

  const operation = Operation.deserialize(data);

  return operation;
}
