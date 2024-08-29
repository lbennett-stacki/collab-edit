import { StringOperation } from "../operations/StringOperation";
import { stringSelectTransform } from "./string-select";
import { stringEditTransform } from "./string-edit";

export function stringTransform(
  concurrent: StringOperation,
  transforming: StringOperation,
) {
  const select = stringSelectTransform(concurrent, transforming);
  if (select !== null) {
    return select;
  }

  const edit = stringEditTransform(concurrent, transforming);
  if (edit !== null) {
    return edit;
  }

  return { transforming, concurrent };
}
