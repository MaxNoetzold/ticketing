import { Publisher, Subjects, TicketCreatedEvent } from "@udemy-test/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
