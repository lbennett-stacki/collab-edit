import { Operation } from "../operations/Operation";
import { StringOperation } from "../operations/StringOperation";
import { stringTransform } from "./string";
import { Logger } from "../logger/Logger";

export interface TransformResult<O extends Operation> {
  existing: O;
  transforming: O;
}

export function transform(
  existing: Operation,
  transforming: Operation,
  logger: Logger,
): TransformResult<Operation> {
  if (
    existing instanceof StringOperation &&
    transforming instanceof StringOperation
  ) {
    return stringTransform(existing, transforming, logger);
  }

  throw new Error("unsupported operation types");
}
