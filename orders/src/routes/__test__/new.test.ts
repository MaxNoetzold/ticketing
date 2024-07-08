import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "@udemy-test/common";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if an invalid ticketId is provided", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: "abc",
    })
    .expect(400);
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({})
    .expect(400);
});

it("return an error if the ticket does not exist", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("return an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "abcdef",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  let orders = await Order.find({ ticket });
  expect(orders.length).toEqual(0);

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  orders = await Order.find({ ticket });
  expect(orders.length).toEqual(1);
});

it("emits an order created event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
