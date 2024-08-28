import { Document } from "../document/Document";
import { ClientDocument } from "../client/ClientDocument";
import { Logger } from "../logger/Logger";
import { PendingOperation } from "../operations/PendingOperation";
import { OperationsVector } from "../operations/OperationsVector";

export class ServerDocument extends Document {
  constructor(
    content = "",
    private readonly logger = new Logger(),
    public readonly operationHistory = new OperationsVector(),
  ) {
    super(content);
  }

  fork(logger?: Logger): ServerDocument {
    return new ServerDocument(this.content, logger);
  }

  forkClient(logger?: Logger): ClientDocument {
    return new ClientDocument(this.revision, this.content, logger);
  }

  merge(operation: PendingOperation) {
    let transformed = operation.operation;

    if (operation.revision < 0) {
      throw new Error("Operation version must be greater than 0");
    }

    if (operation.revision > this.revision) {
      throw new Error(
        `
Operation is too far in the future for server merge.
Current version is ${this.revision}, operation version is ${operation.revision}
        `.trim(),
      );
    }

    const concurrent = this.operationHistory.slice(operation.revision);

    this.logger.log("got concurrent slice for server transforms", {
      concurrent,
      history: this.operationHistory,
    });

    for (const existing of concurrent) {
      const result = this.transform(existing, transformed, this.logger);
      transformed = result.transforming;
    }

    this.operate(transformed);
    this.operationHistory.push(transformed);

    return transformed;
  }

  get revision(): number {
    return this.operationHistory.length;
  }

  toString(): string {
    return `
${this.revision}#ServerDocument(${this.content})
  History:
    ${this.operationHistory.toString()}
    `.trim();
  }
}
