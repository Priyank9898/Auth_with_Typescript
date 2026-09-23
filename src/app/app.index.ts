import express from "express";
import type { Express } from "express";

import { authRouter } from "./auth/auth.route.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";

// This function must return something that matches the shape of an express object
export function createExpressApplication(): Express {
  const app = express();

  //Middleware
  app.use(express.json());
  app.use(authenticationMiddleware());

  //Routes
  app.get("/", (req, res) => {
    return res.json({
      msg: "Testing route",
    });
  });

  // app --- any request comes form "/auth" use authRouter
  app.use("/auth", authRouter);

  return app;
}
