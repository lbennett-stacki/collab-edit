import { Selection } from "../cursor/Selection";
import { assert } from "../validation/assert";
import { OperationType } from "./Operation";
import { StringOperation } from "./StringOperation";

export class SelectOperation extends StringOperation {
  constructor(
    position: number,
    public end: number,
    public clientId: string,
    public color: string,
  ) {
    super(OperationType.SelectOperation, position);
  }

  get start() {
    return this.position;
  }

  get first() {
    return this.position <= this.end ? this.position : this.end;
  }

  set first(value: number) {
    if (this.position <= this.end) {
      this.position = value;
    } else {
      this.end = value;
    }
  }

  get last() {
    return this.position <= this.end ? this.end : this.position;
  }

  set last(value: number) {
    if (this.position <= this.end) {
      this.end = value;
    } else {
      this.position = value;
    }
  }

  operate(): Selection {
    return new Selection(this.position, this.end, this.clientId, this.color);
  }

  moveLeft(steps = 1): this {
    this.moveFirstRight(steps);
    this.moveLastRight(steps);
    return this;
  }

  moveStartLeft(steps = 1): this {
    this.position -= steps;
    return this;
  }

  moveEndLeft(steps = 1): this {
    this.end -= steps;
    return this;
  }

  moveFirstLeft(steps = 1): this {
    this.first -= steps;
    return this;
  }

  moveLastLeft(steps = 1): this {
    this.last -= steps;
    return this;
  }

  moveRight(steps = 1): this {
    this.moveFirstRight(steps);
    this.moveLastRight(steps);
    return this;
  }

  moveStartRight(steps = 1): this {
    this.position += steps;
    return this;
  }

  moveEndRight(steps = 1): this {
    this.end += steps;
    return this;
  }

  moveFirstRight(steps = 1): this {
    this.first += steps;
    return this;
  }

  moveLastRight(steps = 1): this {
    this.last += steps;
    return this;
  }

  toString(): string {
    return `
select(${this.clientId}@${this.position}:${this.end})
    `.trim();
  }

  clone(): SelectOperation {
    return new SelectOperation(
      this.position,
      this.end,
      this.clientId,
      this.color,
    );
  }

  static deserialize(data: string | object): SelectOperation {
    const pojo = typeof data === "string" ? JSON.parse(data) : data;

    assert(pojo.type).is(OperationType.SelectOperation);
    assert(pojo.position).isNumber();
    assert(pojo.end).isNumber();
    assert(pojo.clientId).isString();
    assert(pojo.color).isString();

    return new SelectOperation(
      pojo.position,
      pojo.end,
      pojo.clientId,
      pojo.color,
    );
  }
}
