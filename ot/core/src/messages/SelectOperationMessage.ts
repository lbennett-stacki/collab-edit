import { PendingOperation } from "../operations/PendingOperation";
import { assert } from "../validation/assert";
import { Message, MessageType } from "./messages";

export class SelectOperationMessage extends Message {
  constructor(public readonly operation: PendingOperation) {
    super(MessageType.SelectOperation);
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  static deserialize(data: string): SelectOperationMessage {
    const pojo = JSON.parse(data);

    assert(pojo.type).is(MessageType.SelectOperation);
    assert(pojo.operation).isObject();

    const operation = PendingOperation.deserialize(
      JSON.stringify(pojo.operation),
    );

    return new SelectOperationMessage(operation);
  }

  static isType(message: Message): message is SelectOperationMessage {
    return (
      message instanceof SelectOperationMessage ||
      message.type === MessageType.SelectOperation
    );
  }
}
