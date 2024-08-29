import { PendingOperation } from "../operations/PendingOperation";
import { assert } from "../validation/assert";
import { Message, MessageType } from "./messages";

export class InsertOperationMessage extends Message {
  constructor(public readonly operation: PendingOperation) {
    super(MessageType.InsertOperation);
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  static deserialize(data: string): InsertOperationMessage {
    const pojo = JSON.parse(data);

    assert(pojo.type).is(MessageType.InsertOperation);
    assert(pojo.operation).isObject();

    const operation = PendingOperation.deserialize(
      JSON.stringify(pojo.operation),
    );

    return new InsertOperationMessage(operation);
  }

  static isType(message: Message): message is InsertOperationMessage {
    return (
      message instanceof InsertOperationMessage ||
      message.type === MessageType.InsertOperation
    );
  }
}
