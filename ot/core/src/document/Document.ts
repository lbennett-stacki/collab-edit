import { ClientSelections } from "../cursor/Selection";
import { AnyOperation, Operation } from "../operations/Operation";
import { SelectOperation } from "../operations/SelectOperation";
import { transform } from "../transformations";

export abstract class Document {
  constructor(
    protected content = "",
    public selections: ClientSelections = {},
  ) {}

  get snapshot(): string {
    return this.content;
  }

  protected operate(operation: AnyOperation): void {
    if (operation instanceof SelectOperation) {
      this.selections[operation.clientId] = operation.operate();
    } else {
      this.content = operation.operate(this.content);
    }
  }

  protected transform(concurrent: Operation, transforming: Operation) {
    const transformed = transform(concurrent, transforming);

    return transformed;
  }
}
