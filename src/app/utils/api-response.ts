import type { Response } from "express";

export class ApiResponse {
  static ok<T>(res: Response, message = "ok", data?: T) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, message = "created", data?: T) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent<T>(res: Response) {
    return res.status(204).send();
  }
}
