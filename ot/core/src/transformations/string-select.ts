import { InsertOperation } from "../operations/InsertOperation";
import { StringOperation } from "../operations/StringOperation";
import { SelectOperation } from "../operations/SelectOperation";
import { DeleteOperation } from "../operations/DeleteOperation";

export function stringSelectTransform(
  concurrent: StringOperation,
  transforming: StringOperation,
) {
  if (
    concurrent instanceof SelectOperation &&
    transforming instanceof SelectOperation
  ) {
    return { transforming, concurrent };
  } else if (
    concurrent instanceof SelectOperation &&
    transforming instanceof InsertOperation
  ) {
    if (concurrent.position <= transforming.position) {
      return { transforming, concurrent };
    } else {
      return { transforming, concurrent: concurrent.clone().moveRight() };
    }
  } else if (
    concurrent instanceof SelectOperation &&
    transforming instanceof DeleteOperation
  ) {
    if (concurrent.position <= transforming.position) {
      return { transforming, concurrent };
    } else {
      return { transforming, concurrent: concurrent.clone().moveLeft() };
    }
  } else if (
    concurrent instanceof InsertOperation &&
    transforming instanceof SelectOperation
  ) {
    if (concurrent.position <= transforming.position) {
      return { transforming: transforming.clone().moveRight(), concurrent };
    } else {
      return { transforming, concurrent };
    }
  } else if (
    concurrent instanceof DeleteOperation &&
    transforming instanceof SelectOperation
  ) {
    if (concurrent.position <= transforming.position) {
      return { transforming: transforming.clone().moveLeft(), concurrent };
    } else {
      return { transforming, concurrent };
    }
  }

  return { transforming, concurrent };
}
