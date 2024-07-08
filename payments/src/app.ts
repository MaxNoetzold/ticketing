import express from "express";
// Library to handle async errors with automatic next() call
import "express-async-errors";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@udemy-test/common";
import { createChargeRouter } from "./routes/new";

const app = express();
// Trust the ingress-nginx proxy
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    // Disable encryption bc JWT is already encrypted
    signed: false,
    // Only use cookies over HTTPS
    secure: false,
  })
);
app.use(currentUser);

// Routes
app.use(createChargeRouter);

// custom not found error
app.all("*", () => {
  throw new NotFoundError();
});

// middleware with 4 props is always an error handler
app.use(errorHandler);

export { app };
