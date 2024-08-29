export class Selection {
  constructor(
    public start: number,
    public end: number,
    public clientId: string,
    public color: string,
  ) {}
}

export type ClientSelections = Record<string, Selection>;
