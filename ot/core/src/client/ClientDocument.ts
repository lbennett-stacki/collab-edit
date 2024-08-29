import { Document } from "../document/Document";
import { InsertOperation } from "../operations/InsertOperation";
import { DeleteOperation } from "../operations/DeleteOperation";
import { AnyOperation, Operation } from "../operations/Operation";
import { PendingOperation } from "../operations/PendingOperation";
import { OperationsVector } from "../operations/OperationsVector";
import { SelectOperation } from "../operations/SelectOperation";
import { ClientSelections, Selection } from "../cursor/Selection";

export class ClientDocument extends Document {
  constructor(
    public id: string,
    public color: string,
    public revision = 0,
    content?: string,
    selections?: ClientSelections,
    public readonly queue = new OperationsVector(),
    private pending: PendingOperation | null = null,
  ) {
    super(content, selections);
  }

  get selection(): Selection | null {
    return this.selections[this.id] ?? null;
  }

  fork(clientId: string): ClientDocument {
    return new ClientDocument(
      clientId,
      this.color,
      this.revision,
      this.content,
    );
  }

  clone(): ClientDocument {
    return new ClientDocument(
      this.id,
      this.color,
      this.revision,
      this.content,
      this.selections,
      this.queue,
      this.pending,
    );
  }

  insert(value: string): InsertOperation {
    if (this.selection === null) {
      throw new Error("No selection");
    }

    const operation = new InsertOperation(this.selection.start, value);

    this.mergeLocal(operation);

    return operation;
  }

  delete(): DeleteOperation {
    if (!this.selection) {
      throw new Error("No selection");
    }

    const operation = new DeleteOperation(this.selection.start);

    this.mergeLocal(operation);

    return operation;
  }

  select(start: number, end: number): SelectOperation {
    const operation = new SelectOperation(start, end, this.id, this.color);

    this.mergeLocal(operation);

    return operation;
  }

  moveLeft(): SelectOperation {
    if (!this.selection) {
      throw new Error("No selection");
    }

    const operation = this.select(
      Math.max(this.selection.start - 1, 0),
      Math.max(this.selection.end - 1, 0),
    );

    return operation;
  }

  moveRight(): SelectOperation {
    if (!this.selection) {
      throw new Error("No selection");
    }

    const operation = this.select(
      this.selection.start + 1,
      this.selection.end + 1,
    );

    return operation;
  }

  confirm(): void {
    this.pending = null;

    this.setNextPending();
  }

  private setNextPending(): void {
    const next = this.queue.shift();

    if (!next) {
      return;
    }

    this.setPending(next);
  }

  merge(operation: Operation): Operation {
    let transformed = operation;

    if (this.pending) {
      const op = this.pending.operation;
      const result = this.transform(op, transformed);

      transformed = result.transforming;
      this.pending = new PendingOperation(
        result.concurrent,
        this.pending.revision,
      );
    }

    for (let i = 0; i < this.queue.length; i++) {
      const op = this.queue[i];
      const result = this.transform(op, transformed);
      transformed = result.transforming;
      this.queue[i] = result.concurrent;
    }

    this.operate(transformed as AnyOperation);

    this.revision += 1;

    for (const clientId in this.selections) {
      const selection = this.selections[clientId];
      const selectionAsOperation = new SelectOperation(
        selection.start,
        selection.end,
        selection.clientId,
        selection.color,
      );

      const result = this.transform(transformed, selectionAsOperation);

      if (result.transforming instanceof SelectOperation) {
        this.selections[clientId] = new Selection(
          result.transforming.position,
          result.transforming.end,
          clientId,
          selection.color,
        );
      }
    }

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

    this.operate(operation as AnyOperation);

    for (const clientId in this.selections) {
      const selection = this.selections[clientId];

      const selectionAsOperation = new SelectOperation(
        selection.start,
        selection.end,
        selection.clientId,
        selection.color,
      );

      const result = this.transform(operation, selectionAsOperation);

      if (result.transforming instanceof SelectOperation) {
        this.selections[clientId] = new Selection(
          result.transforming.position,
          result.transforming.end,
          clientId,
          selection.color,
        );
      }
    }
  }

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
