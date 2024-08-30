export class Selection {
  constructor(
    public readonly start: number,
    public readonly end: number,
    public readonly clientId: string,
    public readonly color: string,
    public readonly first = start,
    public readonly last = end,
    public readonly isRange = start !== end,
  ) {
    const [low, high] = start <= end ? [start, end] : [end, start];

    this.first = low;
    this.last = high;
  }
}

export type ClientSelections = Record<string, Selection>;
