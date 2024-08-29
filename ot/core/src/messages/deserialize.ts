import { AcknowledgeMessage } from "./AcknowledgeMessage";
import { DeleteOperationMessage } from "./DeleteOperationMessage";
import { InsertOperationMessage } from "./InsertOperationMessage";
import { AnyMessage, MessageType } from "./messages";
import { SelectOperationMessage } from "./SelectOperationMessage";
import { SnapshotMessage } from "./SnapshotMessage";

const isMessageType = (type: string): type is MessageType => {
  return Object.values(MessageType).includes(type as MessageType);
};

const messages = {
  [MessageType.Snapshot]: SnapshotMessage,
  [MessageType.Acknowledge]: AcknowledgeMessage,
  [MessageType.InsertOperation]: InsertOperationMessage,
  [MessageType.DeleteOperation]: DeleteOperationMessage,
  [MessageType.SelectOperation]: SelectOperationMessage,
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
