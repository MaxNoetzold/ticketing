import express from "express";
// Library to handle async errors with automatic next() call
import "express-async-errors";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/singin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { currentUser, errorHandler, NotFoundError } from "@udemy-test/common";

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

app.use(signupRouter);
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);

// custom not found error
app.all("*", () => {
  throw new NotFoundError();
});

// middleware with 4 props is always an error handler
app.use(errorHandler);

export { app };
