import type { LoginPayload } from "./dto/login-dto.js";
import type { RegisterPayload } from "./dto/register-dto.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import { AuthService } from "./auth.service.js";
import type { Request, Response } from "express";

export class AuthController {
  static async register(req: Request<{}, {}, RegisterPayload>, res: Response) {
    await AuthService.register(req.body);
    return ApiResponse.created(
      res,
      "Registration successful. Please verify your email",
    );
  }

  static async login(req: Request<{}, {}, LoginPayload>, res: Response) {
    const { refreshToken, accessToken } = await AuthService.login(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return ApiResponse.ok(res, "User logged in", {
      accessToken,
    });
  }

  static async emailVerification(
    req: Request<{ token: string }>,
    res: Response,
  ) {
    const { token } = req.params;
    await AuthService.verifyEmail(token);
    return ApiResponse.ok(res, "Email verification successful");
  }

  static async refresh(req: Request<{ token: string }>, res: Response) {
    const { newAccessToken, newRefreshToken } = await AuthService.refresh(
      req.cookies.refreshToken,
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.created(res, "New tokens loaded", newAccessToken);
  }
}
