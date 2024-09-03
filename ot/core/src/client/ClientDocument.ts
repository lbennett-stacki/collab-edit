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

    let start = this.selection.first;

    if (this.selection.start !== this.selection.end) {
      start += 1;
    }

    const operation = new InsertOperation(start, value);

    this.mergeLocal(operation);

    return operation;
  }

  delete(): DeleteOperation {
    if (!this.selection) {
      throw new Error("No selection");
    }

    const start = this.selection.first - 1;
    const end = this.selection.last - 1;
    const length = end - start;

    const operation = new DeleteOperation(start, length);

    this.mergeLocal(operation);

    return operation;
  }

  select(start: number, end = start): SelectOperation {
    const operation = new SelectOperation(start, end, this.id, this.color);

    this.mergeLocal(operation);

    return operation;
  }

  moveLeft(steps = 1): SelectOperation {
    if (!this.selection) {
      throw new Error("No selection");
    }

    const operation = this.select(
      Math.max(this.selection.start - steps, 0),
      Math.max(this.selection.end - steps, 0),
    );

    return operation;
  }

  moveRight(steps = 1): SelectOperation {
    if (!this.selection) {
      throw new Error("No selection");
    }

    const operation = this.select(
      this.selection.start + steps,
      this.selection.end + steps,
    );

    return operation;
  }

  collapseSelection(): SelectOperation {
    if (!this.selection) {
      throw new Error("No selection");
    }

    const isStart = this.selection.last === this.selection.start;

    const position = isStart ? this.selection.start : this.selection.end;

    const operation = this.select(position, position);

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
      this.pending = new PendingOperation(result.concurrent, this.revision);
    }

    for (let i = 0; i < this.queue.length; i++) {
      const op = this.queue[i];
      const result = this.transform(op, transformed);
      transformed = result.transforming;
      this.queue[i] = result.concurrent;
    }

    this.operate(transformed as AnyOperation);

    this.revision += 1;

    this.updateClientCursors(operation);

    return transformed;
  }

  private updateClientCursors(operation: Operation): void {
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

  private setPending(operation: Operation): void {
    if (this.pending !== null) {
      throw new Error("Attempted to overwrite pending op");
    }

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

    this.updateClientCursors(operation);
  }

  get waitingFor(): PendingOperation | null {
    return this.pending;
  }

  toString(): string {
    return `
${this.revision}#ClientDocument[${this.id}](${this.content})
Pending:
${this.pending}
Queue:
${this.queue.toString()}
    `.trim();
  }
}
