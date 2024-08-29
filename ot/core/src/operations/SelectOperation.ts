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

  operate(): Selection {
    return new Selection(this.position, this.end, this.clientId, this.color);
  }

  moveLeft(): this {
    this.position--;
    this.end--;
    return this;
  }

  moveRight(): this {
    this.position++;
    this.end++;
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
