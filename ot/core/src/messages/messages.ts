import { PendingOperation } from "../operations/PendingOperation";
import { assert } from "../validation/assert";

export enum MessageType {
  Snapshot = "snapshot",
  Acknowledge = "acknowledge",
  InsertOperation = "insert",
  DeleteOperation = "delete",
}

export type AnyMessage =
  | SnapshotMessage
  | AcknowledgeMessage
  | InsertOperationMessage
  | DeleteOperationMessage;

export abstract class Message {
  constructor(public readonly type: MessageType) {}

  abstract serialize(): string;
}

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

export class SnapshotMessage extends Message {
  constructor(
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
    assert(pojo.snapshot).isString();
    assert(pojo.revision).isNumber();

    return new SnapshotMessage(pojo.revision, pojo.snapshot);
  }

  static isType(message: Message): message is SnapshotMessage {
    return (
      message instanceof SnapshotMessage ||
      message.type === MessageType.Snapshot
    );
  }
}

export class AcknowledgeMessage extends Message {
  constructor() {
    super(MessageType.Acknowledge);
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  static deserialize(data: string): AcknowledgeMessage {
    const pojo = JSON.parse(data);

    if (pojo.type !== MessageType.Acknowledge) {
      throw new Error("Invalid message type");
    }

    return new AcknowledgeMessage();
  }

  static isType(message: Message): message is AcknowledgeMessage {
    return (
      message instanceof AcknowledgeMessage ||
      message.type === MessageType.Acknowledge
    );
  }
}
