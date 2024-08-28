import { InsertOperation } from "../operations/InsertOperation";
import { StringOperation } from "../operations/StringOperation";
import { Logger } from "../logger/Logger";
import { DeleteOperation } from "../lib";

export function stringTransform(
  existing: StringOperation,
  transforming: StringOperation,
  logger: Logger,
) {
  console.log({ existing, transforming });
  if (
    existing instanceof InsertOperation &&
    transforming instanceof InsertOperation
  ) {
    if (existing.position <= transforming.position) {
      const t = transforming.clone();
      t.moveRight();

      return { transforming: t, existing };
    } else {
      const e = existing.clone();

      e.moveRight();

      return { transforming, existing: e };
    }
  } else if (
    existing instanceof DeleteOperation &&
    transforming instanceof DeleteOperation
  ) {
    logger.log("\ntransforming delete-delete");

    if (existing.position <= transforming.position) {
      const t = transforming.clone();
      logger.log("moving left to account for removed text");
      t.moveLeft();

      return { transforming: t, existing };
    } else {
      const e = transforming.clone();
      logger.log("moving right to account for removed text");
      e.moveRight();

      return { transforming, existing: e };
    }
  }

  return { transforming, existing };

  //
  // if (
  //   existing instanceof InsertOperation &&
  //   transforming instanceof DeleteOperation
  // ) {
  //   logger.log("\ntransforming delete-delete");
  //
  //   if (existing.position <= transforming.position) {
  //     logger.log("moving left to account for removed text");
  //     transforming.moveLeft();
  //
  //     return { transforming, existing };
  //   } else {
  //     logger.log("no change");
  //   }
  // }
  //
  // if (
  //   existing instanceof DeleteOperation &&
  //   transforming instanceof InsertOperation
  // ) {
  //   logger.log("\ntransforming insert-delete");
  //   if (existing.position < transforming.position) {
  //     logger.log("moving left to account for removed text");
  //     transforming.moveLeft();
  //
  //     return { transforming, existing };
  //   } else {
  //     logger.log("no change");
  //   }
  // }
  //
}
