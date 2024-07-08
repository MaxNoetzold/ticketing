import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@udemy-test/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: PaymentCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Complete, version: order.version + 1 });
    await order.save();

    // We don't need to publish an event here because an order wont be updated
    // as soon as the OrderStatus is Complete

    msg.ack();
  }
}
