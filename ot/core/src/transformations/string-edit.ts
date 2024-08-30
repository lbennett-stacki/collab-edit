import { InsertOperation } from "../operations/InsertOperation";
import { StringOperation } from "../operations/StringOperation";
import { DeleteOperation } from "../operations/DeleteOperation";

export function stringEditTransform(
  concurrent: StringOperation,
  transforming: StringOperation,
) {
  if (
    concurrent instanceof InsertOperation &&
    transforming instanceof InsertOperation
  ) {
    if (concurrent.position <= transforming.position) {
      return {
        transforming: transforming.clone().moveRight(concurrent.length),
        concurrent,
      };
    } else {
      return {
        transforming,
        concurrent: concurrent.clone().moveRight(transforming.length),
      };
    }
  } else if (
    concurrent instanceof DeleteOperation &&
    transforming instanceof DeleteOperation
  ) {
    if (concurrent.position <= transforming.position) {
      return {
        transforming: transforming.clone().moveLeft(concurrent.length),
        concurrent,
      };
    } else {
      return {
        transforming,
        concurrent: concurrent.clone().moveLeft(transforming.length),
      };
    }
  } else if (
    concurrent instanceof InsertOperation &&
    transforming instanceof DeleteOperation
  ) {
    if (concurrent.position <= transforming.position) {
      return {
        transforming: transforming.clone().moveRight(concurrent.length),
        concurrent,
      };
    } else {
      return {
        transforming,
        concurrent: concurrent.clone().moveLeft(transforming.length),
      };
    }
  } else if (
    concurrent instanceof DeleteOperation &&
    transforming instanceof InsertOperation
  ) {
    if (concurrent.position <= transforming.position) {
      return {
        transforming: transforming.clone().moveLeft(concurrent.length),
        concurrent,
      };
    } else {
      return {
        transforming,
        concurrent: concurrent.clone().moveRight(transforming.length),
      };
    }
  }

  return null;
}
