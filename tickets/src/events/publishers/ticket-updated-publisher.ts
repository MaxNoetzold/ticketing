import { Publisher, Subjects, TicketUpdatedEvent } from "@udemy-test/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
