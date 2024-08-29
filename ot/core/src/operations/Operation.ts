import { ToString } from "../types/ToString";
import { DeleteOperation } from "./DeleteOperation";
import { InsertOperation } from "./InsertOperation";
import { SelectOperation } from "./SelectOperation";

export abstract class Operation implements ToString {
  constructor(public readonly type: string) {}
}

export enum OperationType {
  InsertOperation = "insert",
  DeleteOperation = "delete",
  SelectOperation = "select",
}

export const isOperationType = (type: string): type is OperationType => {
  return Object.values(OperationType).includes(type as OperationType);
};

export type AnyOperation = InsertOperation | DeleteOperation | SelectOperation;
