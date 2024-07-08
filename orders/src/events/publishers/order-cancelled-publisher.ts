import { OrderCancelledEvent, Publisher, Subjects } from "@udemy-test/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
