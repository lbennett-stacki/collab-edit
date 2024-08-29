import { assert } from "../validation/assert";
import { Message, MessageType } from "./messages";

export class SnapshotMessage extends Message {
  constructor(
    public clientId: string,
    public color: string,
    public revision: number,
    public snapshot: string,
  ) {
    super(MessageType.Snapshot);
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  static deserialize(data: string): SnapshotMessage {
    const pojo = JSON.parse(data);

    assert(pojo.type).is(MessageType.Snapshot);
    assert(pojo.clientId).isString();
    assert(pojo.color).isString();
    assert(pojo.snapshot).isString();
    assert(pojo.revision).isNumber();

    return new SnapshotMessage(
      pojo.clientId,
      pojo.color,
      pojo.revision,
      pojo.snapshot,
    );
  }

  static isType(message: Message): message is SnapshotMessage {
    return (
      message instanceof SnapshotMessage ||
      message.type === MessageType.Snapshot
    );
  }
}
