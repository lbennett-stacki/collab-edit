import { AcknowledgeMessage } from "./AcknowledgeMessage";
import { DeleteOperationMessage } from "./DeleteOperationMessage";
import { InsertOperationMessage } from "./InsertOperationMessage";
import { SnapshotMessage } from "./SnapshotMessage";

export enum MessageType {
  Snapshot = "snapshot",
  Acknowledge = "acknowledge",
  InsertOperation = "insert",
  DeleteOperation = "delete",
  SelectOperation = "select",
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
