import express from "express";
// Library to handle async errors with automatic next() call
import "express-async-errors";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@udemy-test/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

const app = express();
// Trust the ingress-nginx proxy
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    // Disable encryption bc JWT is already encrypted
    signed: false,
    // Only use cookies over HTTPS
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

// Routes
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

// custom not found error
app.all("*", () => {
  throw new NotFoundError();
});

// middleware with 4 props is always an error handler
app.use(errorHandler);

export { app };
