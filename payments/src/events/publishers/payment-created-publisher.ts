import { PaymentCreatedEvent, Publisher, Subjects } from "@udemy-test/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
