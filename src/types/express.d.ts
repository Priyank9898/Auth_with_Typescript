import { User } from "../types/user"; // if you have a User type

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
