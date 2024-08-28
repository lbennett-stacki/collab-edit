import { Document } from "../document/Document";
import { InsertOperation } from "../operations/InsertOperation";
import { DeleteOperation } from "../operations/DeleteOperation";
import { Operation } from "../operations/Operation";
import { Logger } from "../logger/Logger";
import { PendingOperation } from "../operations/PendingOperation";
import { OperationsVector } from "../operations/OperationsVector";

export class ClientDocument extends Document {
  constructor(
    public revision = 0,
    content = "",
    private readonly logger = new Logger(),
    public readonly queue = new OperationsVector(),
    private pending: PendingOperation | null = null,
  ) {
    super(content);
  }

  fork(): ClientDocument {
    return new ClientDocument(this.revision, this.content);
  }

  insert(position: number, value: string): InsertOperation {
    const operation = new InsertOperation(position, value);

    this.mergeLocal(operation);

    return operation;
  }

  delete(position: number): DeleteOperation {
    const operation = new DeleteOperation(position);

    this.mergeLocal(operation);

    return operation;
  }

  confirm(): void {
    this.pending = null;

    this.setNextPending();
  }

  private setNextPending(): void {
    const next = this.queue.shift();

    if (!next) {
      this.logger.log("Out of operations. Waiting for more...");
      return;
    }

    this.setPending(next);
  }

  merge(operation: Operation): Operation {
    let transformed = operation;

    this.logger.log("client merge occuring", {
      this: this,
      transforming: transformed,
    });

    if (this.pending) {
      const op = this.pending.operation;
      const result = this.transform(op, transformed, this.logger);

      transformed = result.transforming;
      this.pending = new PendingOperation(
        result.existing,
        this.pending.revision,
      );
    }

    for (let i = 0; i < this.queue.length; i++) {
      const op = this.queue[i];
      const result = this.transform(op, transformed, this.logger);
      transformed = result.transforming;
      this.queue[i] = result.existing;
    }

    this.operate(transformed);

    this.revision += 1;

    return transformed;
  }

  private setPending(operation: Operation): void {
    this.pending = new PendingOperation(operation, this.revision);
    this.revision += 1;
  }

  private mergeLocal(operation: Operation): void {
    if (!this.pending) {
      this.setPending(operation);
    } else {
      this.queue.push(operation);
    }

    this.operate(operation);
  }

  // TODO: not needed after dev
  get waitingFor(): PendingOperation | null {
    return this.pending;
  }

  toString(): string {
    return `
${this.revision}#ClientDocument(${this.content})
  Pending: ${this.pending}
  Queue:
    ${this.queue.toString()}
    `.trim();
  }
}
