import { Operation } from "./Operation";

interface Set<I> {
  add(operation: I): void;
  delete(operation: I): boolean;
  has(operation: I): boolean;
  unshift(): I;
  slice(version: number): Set<I>;
  size: number;
  [Symbol.iterator](): IterableIterator<I>;
}

export class OperationsSet implements Set<Operation> {
  constructor(private operations = new Map<number, Operation>()) {}

  add(operation: Operation) {
    if (this.has(operation)) {
      throw new Error("Operation already exists");
    }

    this.operations.set(operation.version, operation);

    return this;
  }

  delete(operation: Operation) {
    if (!this.has(operation)) {
      throw new Error("Operation does not exist");
    }

    const result = this.operations.delete(operation.version);

    return result;
  }

  has(operation: Operation) {
    const has = this.operations.has(operation.version);

    return has;
  }

  unshift() {
    const first = this.operations.values().next().value;

    if (!first) {
      throw new Error("No operations to unshift");
    }

    this.delete(first);

    return first;
  }

  get size() {
    return this.operations.size;
  }

  slice(version: number): OperationsSet {
    return Array.from(this.operations.values()).reduce((set, operation) => {
      if (operation.version >= version) {
        set.add(operation);
      }
      return set;
    }, new OperationsSet());
  }

  [Symbol.iterator]() {
    const values = this.operations.values();

    return values;
  }

  toString() {
    if (!this.operations.size) {
      return "empty";
    }

    return Array.from(this.operations.values())
      .map((operation) => operation.toString())
      .join("\nv\n");
  }
}
