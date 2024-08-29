import { Document } from "../document/Document";
import { ClientDocument } from "../client/ClientDocument";
import { PendingOperation } from "../operations/PendingOperation";
import { OperationsVector } from "../operations/OperationsVector";
import { ToString } from "../types/ToString";
import { AnyOperation } from "../operations/Operation";
import { ClientSelections } from "../cursor/Selection";
import { SelectOperation } from "../operations/SelectOperation";

export class ServerDocument extends Document implements ToString {
  constructor(
    content?: string,
    selections?: ClientSelections,
    public readonly operationHistory = new OperationsVector(),
  ) {
    super(content, selections);
  }

  clearHistory(): void {
    this.operationHistory.clear();
  }

  fork(): ServerDocument {
    return new ServerDocument(this.content);
  }

  forkClient(clientId: string, color: string): ClientDocument {
    return new ClientDocument(clientId, color, this.revision, this.content);
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

    for (const op of concurrent) {
      const result = this.transform(op, transformed);
      transformed = result.transforming;
    }

    this.operate(transformed as AnyOperation);
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
