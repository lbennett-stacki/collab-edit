import {
  AcknowledgeMessage,
  AnyMessage,
  DeleteOperationMessage,
  InsertOperationMessage,
  MessageType,
  SnapshotMessage,
} from "./messages";

const isMessageType = (type: string): type is MessageType => {
  return Object.values(MessageType).includes(type as MessageType);
};

const messages = {
  [MessageType.Snapshot]: SnapshotMessage,
  [MessageType.Acknowledge]: AcknowledgeMessage,
  [MessageType.InsertOperation]: InsertOperationMessage,
  [MessageType.DeleteOperation]: DeleteOperationMessage,
} satisfies Record<MessageType, unknown>;

export function deserializeMessage(data: string): AnyMessage {
  const messagePojo = JSON.parse(data);

  const type = messagePojo.type;
  if (!isMessageType(type)) {
    throw new Error("Unknown message type");
  }

  const Message = messages[type];

  if (!Message) {
    throw new Error("Unknown message type");
  }

  const message = Message.deserialize(data);

  return message;
}
