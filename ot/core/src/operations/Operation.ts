import { ToString } from "../types/ToString";

export abstract class Operation implements ToString {
  constructor(public readonly type: string) {}

  abstract operate(content: string): string;
}

export enum OperationType {
  InsertOperation = "insert",
  DeleteOperation = "delete",
}

export const isOperationType = (type: string): type is OperationType => {
  return Object.values(OperationType).includes(type as OperationType);
};
