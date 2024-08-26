export interface ToString {
  toString(): string;
}

export abstract class Operation implements ToString {
  constructor(public readonly type: string) {}

  abstract operate(content: string): string;
  abstract clone(): Operation;
}
