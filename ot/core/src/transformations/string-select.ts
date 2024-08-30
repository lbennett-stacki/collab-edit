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
    const c = concurrent.clone();
    if (concurrent.start > transforming.position) {
      c.moveStartRight(transforming.length);
    }
    if (concurrent.end > transforming.position) {
      c.moveEndRight(transforming.length);
    }
    return { transforming, concurrent: c };
  } else if (
    concurrent instanceof SelectOperation &&
    transforming instanceof DeleteOperation
  ) {
    const c = concurrent.clone();
    if (concurrent.start > transforming.position) {
      c.moveStartLeft(transforming.length);
    }
    if (concurrent.end > transforming.position) {
      c.moveEndLeft(transforming.length);
    }
    return { transforming, concurrent: c };
  } else if (
    concurrent instanceof InsertOperation &&
    transforming instanceof SelectOperation
  ) {
    const t = transforming.clone();
    if (concurrent.position <= transforming.start) {
      t.moveStartRight(concurrent.length);
    }
    if (concurrent.position <= transforming.end) {
      t.moveEndRight(concurrent.length);
    }
    return { transforming: t, concurrent };
  } else if (
    concurrent instanceof DeleteOperation &&
    transforming instanceof SelectOperation
  ) {
    const t = transforming.clone();
    // These are < instead of <= because of how select ranges work
    if (concurrent.position < transforming.start) {
      t.moveStartLeft(concurrent.length);
    }

    if (concurrent.position < transforming.end) {
      t.moveEndLeft(concurrent.length);
    }

    return { transforming: t, concurrent };
  }

  return null;
}
