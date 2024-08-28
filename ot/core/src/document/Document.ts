import { Logger } from "../logger/Logger";
import { Operation } from "../operations/Operation";
import { transform } from "../transformations";

export abstract class Document {
  constructor(protected content = "") {}

  public abstract fork(): Document;
  public abstract toString(): string;

  get snapshot(): string {
    return this.content;
  }

  protected operate(operation: Operation): void {
    this.content = operation.operate(this.content);
  }

  protected transform(
    existing: Operation,
    transforming: Operation,
    logger: Logger,
  ) {
    const transformed = transform(existing, transforming, logger);

    return transformed;
  }
}
