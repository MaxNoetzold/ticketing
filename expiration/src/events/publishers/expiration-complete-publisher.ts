import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@udemy-test/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
