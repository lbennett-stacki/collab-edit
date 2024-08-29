import { Message, MessageType } from "./messages";

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
