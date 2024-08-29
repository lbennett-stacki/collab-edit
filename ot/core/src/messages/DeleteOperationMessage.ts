import { PendingOperation } from "../operations/PendingOperation";
import { assert } from "../validation/assert";
import { Message, MessageType } from "./messages";

export class DeleteOperationMessage extends Message {
  constructor(public readonly operation: PendingOperation) {
    super(MessageType.DeleteOperation);
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  static deserialize(data: string): DeleteOperationMessage {
    const pojo = JSON.parse(data);

    assert(pojo.type).is(MessageType.DeleteOperation);
    assert(pojo.operation).isObject();

    const operation = PendingOperation.deserialize(
      JSON.stringify(pojo.operation),
    );

    return new DeleteOperationMessage(operation);
  }

  static isType(message: Message): message is DeleteOperationMessage {
    return (
      message instanceof DeleteOperationMessage ||
      message.type === MessageType.DeleteOperation
    );
  }
}
