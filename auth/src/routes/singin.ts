import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { Password } from "../services/password";
import { validateRequest, BadRequestError } from "@udemy-test/common";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordIsValid = await Password.compare(user.password, password);
    if (!passwordIsValid) {
      throw new BadRequestError("Invalid credentials");
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      // use the ! to tell TS that we are sure that JWT_KEY is defined
      process.env.JWT_KEY!
    );

    // Store JWT on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(user);
  }
);

export { router as signinRouter };
