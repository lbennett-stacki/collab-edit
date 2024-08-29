import { Operation } from "../operations/Operation";
import { StringOperation } from "../operations/StringOperation";
import { stringTransform } from "./string";

export function transform(concurrent: Operation, transforming: Operation) {
  if (
    concurrent instanceof StringOperation &&
    transforming instanceof StringOperation
  ) {
    const transformed = stringTransform(concurrent, transforming);

    return transformed;
  }

  throw new Error("unsupported operation types");
}
