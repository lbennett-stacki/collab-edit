import { Operation } from "../operations/Operation";
import { StringOperation } from "../operations/StringOperation";
import { stringTransform } from "./string";
import { Logger } from "../logger/Logger";

export function transform(
  existing: Operation,
  transforming: Operation,
  logger: Logger,
) {
  if (
    existing instanceof StringOperation &&
    transforming instanceof StringOperation
  ) {
    return stringTransform(existing, transforming, logger);
  }

  throw new Error("unsupported operation types");
}
