import { Operation, OperationType } from "./Operation";

export abstract class StringOperation extends Operation {
  constructor(
    public readonly type: OperationType,
    public position: number,
  ) {
    super(type);
  }

  moveRight(steps = 1): this {
    this.position += steps;

    return this;
  }

  moveLeft(steps = 1): this {
    this.position += steps;

    return this;
  }

  static splice(
    content: string,
    start: number,
    end: number,
    insertion: string,
  ): string {
    const before = content.slice(0, start);
    const after = content.slice(start + end);

    return [before, insertion, after].join("");
  }
}
