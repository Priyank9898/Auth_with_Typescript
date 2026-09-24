import type { Request, Response } from "express";
import { signupPayloadModel, signinPayloadModel } from "./auth.models.js";
import { db } from "../../db/db.index.js";
import { userTable } from "../../db/db.schema.js";
import { eq } from "drizzle-orm";
import { randomBytes, createHmac } from "node:crypto";
import { ApiError } from "../utils/api-error-response.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt-utils.js";

class AuthenticationController {
  public async handleSignup(req: Request, res: Response) {
    const validationResult = await signupPayloadModel.safeParseAsync(req.body);

    if (validationResult.error)
      throw ApiError.badRequest(
        "Body validation failed",
        validationResult.error.issues,
      );

    const { firstName, lastName, email, password } = validationResult.data;

    const userEmailResult = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (userEmailResult.length > 0)
      throw ApiError.unauthorized("Duplicate entry", `${email} already exist`);

    const salt = randomBytes(32).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");

    const [result] = await db
      .insert(userTable)
      .values({
        firstName,
        lastName,
        email,
        password: hash,
        salt,
      })
      .returning({
        id: userTable.id,
      });

    return ApiResponse.created(res, "User has been created successfully", {
      id: result?.id,
    });
  }

  public async handleSignin(req: Request, res: Response) {
    const validationResult = await signinPayloadModel.safeParseAsync(req.body);
    if (validationResult.error)
      throw ApiError.unauthorized(
        "Validation failed",
        validationResult.error.issues,
      );

    const { email, password } = validationResult.data;

    // Email comparison
    const userCheck = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (userCheck.length === 0)
      throw ApiError.unauthorized("Email or Password incorrect");

    const user = userCheck[0]!;

    const hashPassword = createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");

    // Password comparison
    if (hashPassword !== user.password)
      throw ApiError.unauthorized("Email or password incorrect");

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.ok(res, "Logged in successfully", accessToken);
  }

  public async handleProfile(req: Request, res: Response) {
    const { id } = req.user;

    const userResult = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id));

    return ApiResponse.ok(res, "User Profile", {
      firstName: userResult[0]?.firstName,
      lastName: userResult[0]?.lastName,
      email: userResult[0]?.email,
    });
  }
}

export default AuthenticationController;
