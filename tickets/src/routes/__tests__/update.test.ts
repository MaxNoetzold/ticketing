import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

const createTicket = (cookie = global.signin()) => {
  return request(app).post("/api/tickets").set("Cookie", cookie).send({
    title: "title",
    price: 20,
  });
};

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "title",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .send({
      title: "title",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await createTicket();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "new title",
      price: 1000,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const response = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: -20,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin();
  const response = await createTicket(cookie);
  const updatedTicket = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 1000,
    })
    .expect(200);

  expect(updatedTicket.body.title).toEqual("new title");
  expect(updatedTicket.body.price).toEqual(1000);

  const ticketRespones = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketRespones.body.title).toEqual("new title");
  expect(ticketRespones.body.price).toEqual(1000);
});

it("publishes an event", async () => {
  const cookie = global.signin();
  const response = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 1000,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = global.signin();
  const response = await createTicket(cookie);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 1000,
    })
    .expect(400);
});
