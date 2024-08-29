import { ToString } from "../types/ToString";
import { DeleteOperation } from "./DeleteOperation";
import { InsertOperation } from "./InsertOperation";
import { Operation } from "./Operation";

export class OperationsVector extends Array<Operation> implements ToString {
  clear() {
    this.length = 0;
  }

  slice(start?: number, end?: number): OperationsVector {
    const slice = super.slice(start, end);

    const vector = new OperationsVector();

    for (const op of slice) {
      vector.push(op);
    }

    return vector;
  }

  toString(): string {
    if (this.length === 0) {
      return "empty";
    }

    return this.map((operation, index) => {
      let args = "";
      if (operation instanceof InsertOperation) {
        args = `${operation.value} @ ${operation.position}`;
      } else if (operation instanceof DeleteOperation) {
        args = `@ ${operation.position}`;
      }

      const toString = `${index}. ${operation.type}(${args})`;

      return toString;
    }, []).join("\n");
  }
}
