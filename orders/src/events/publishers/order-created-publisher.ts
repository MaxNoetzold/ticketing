import { Publisher, OrderCreatedEvent, Subjects } from "@udemy-test/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
