import { Listener, Subjects, TicketUpdatedEvent } from "@udemy-test/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: TicketUpdatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      // this will lead to nats server to resend the event
      // and then it will probably be in order
      // because the missing event will be processed
      throw new Error("Ticket not found");
    }

    const { title, price, version } = data;
    ticket.set({ title, price, version });
    await ticket.save();

    msg.ack();
  }
}
