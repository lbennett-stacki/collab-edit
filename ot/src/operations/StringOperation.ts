import { Operation } from "./Operation";

export abstract class StringOperation extends Operation {
  constructor(
    public readonly type: "insert" | "delete",
    private cursorPosition: number,
  ) {
    super(type);
  }

  abstract operate(content: string): string;

  moveRight(): void {
    this.cursorPosition++;
  }

  moveLeft(): void {
    this.cursorPosition--;
  }

  get position() {
    return this.cursorPosition;
  }

  static splice(
    content: string,
    start: number,
    end: number,
    insertion = "",
  ): string {
    const before = content.slice(0, start);
    const after = content.slice(start + end);

    return [before, insertion, after].join("");
  }
}
