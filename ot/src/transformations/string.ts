// import { DeleteOperation } from "../operations/DeleteOperation";
import { InsertOperation } from "../operations/InsertOperation";
import { StringOperation } from "../operations/StringOperation";
import { Logger } from "../logger/Logger";
import { TransformResult } from ".";

export function stringTransform<O extends StringOperation>(
  existing: O,
  transforming: O,
  logger: Logger,
): TransformResult<O> {
  if (
    existing instanceof InsertOperation &&
    transforming instanceof InsertOperation
  ) {
    logger.log("transforming insert-insert", { transforming, existing });
    if (existing.position <= transforming.position) {
      const t = transforming.clone() as O; // TODO: fix types
      t.moveRight();
      logger.log("moving transforming right to account for added text", {
        transforming: t,
        existing,
      });

      return { transforming: t, existing };
    } else {
      logger.log("moving existing right to account for added text", {
        transforming,
        existing,
      });
      const e = existing.clone() as O;

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
  // if (
  //   existing instanceof DeleteOperation &&
  //   transforming instanceof DeleteOperation
  // ) {
  //   logger.log("\ntransforming delete-delete");
  //
  //   if (existing.position <= transforming.position) {
  //     logger.log("moving left to account for removed text");
  //     transforming.moveLeft();
  //
  //     return [transforming, existing];
  //   } else {
  //     logger.log("no change");
  //   }
  // }
}
