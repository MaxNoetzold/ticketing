import mongoose from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { PaymentCreatedListener } from "../payment-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { PaymentCreatedEvent } from "@udemy-test/common";

const setup = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  // Create an instance of the listener
  const listener = new PaymentCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: PaymentCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    stripeId: "asldkfj",
  };

  // Create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it("updates the order status to complete", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedOrder = await Order.findById(data.orderId);

  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
