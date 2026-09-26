import { db } from "../../common/db/db.index.js";
import { userTable } from "../../common/db/db.schema.js";
import type { RegisterPayload } from "./dto/register-dto.js";
import { eq } from "drizzle-orm";
import { ApiError } from "../../common/utils/api-error-response.js";
import { createHmac, randomBytes } from "node:crypto";
import { JwtUtils } from "../../common/utils/jwt-utils.js";
import crypto from "crypto";
import type { LoginPayload } from "./dto/login-dto.js";
import { sendVerificationMail } from "../../common/services/email.service.js";

const passGenerator = (password: string, existingSalt?: string) => {
  const salt = existingSalt ?? randomBytes(32).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  return { salt, hashedPassword };
};

const hash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export class AuthService {
  static async register(data: RegisterPayload) {
    const { firstName, lastName, email, password } = data;

    // If user exists
    const userCheck = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (userCheck.length > 0) throw ApiError.conflict("User already exist");

    const { salt, hashedPassword } = passGenerator(password);
    const { rawToken, hashedToken } = JwtUtils.generateResetToken();

    // DB insertion
    await db.insert(userTable).values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      salt,
      verificationToken: hashedToken,
    });

    try {
      await sendVerificationMail(email, rawToken);
    } catch (err) {
      console.error(`Failed to send Email for :${email}`);
    }

    return;
  }

  static async login(data: LoginPayload) {
    const { email, password } = data;

    const emailExist = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (emailExist.length === 0)
      throw ApiError.unauthorized("Check email or password");

    // Fetches user detail
    const user = emailExist[0];
    if (!user) throw ApiError.unauthorized("Failed to fetch data");

    const hashedInputPassword = passGenerator(password, user.salt);

    // compare password
    if (user.password !== hashedInputPassword.hashedPassword)
      throw ApiError.unauthorized("Check email or password");

    // Check for email verification
    if (!user.emailVerified)
      throw ApiError.unauthorized("Kindly verify your email");

    const accessToken = JwtUtils.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = JwtUtils.generateRefreshToken({
      id: user.id,
    });

    const hashedRefreshToken = hash(refreshToken);

    // Updating DB
    await db
      .update(userTable)
      .set({ refreshToken: hashedRefreshToken })
      .where(eq(userTable.id, user.id));

    return { accessToken, refreshToken };
  }

  static async verifyEmail(token: string) {
    if (!token) throw ApiError.notFound("Missing token for email verification");

    const hashedToken = hash(token);

    const tokenDbLookUp = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.verificationToken, hashedToken));

    if (tokenDbLookUp.length === 0)
      throw ApiError.unauthorized("Token verification failed for VT");

    const user = tokenDbLookUp[0];
    if (!user) throw ApiError.unauthorized("User not found");

    await db
      .update(userTable)
      .set({
        verificationToken: null,
        emailVerified: true,
      })
      .where(eq(userTable.id, user.id));

    return;
  }

  static async refresh(token: string) {
    /**
     * once the accessToken time validity expires
     * A request will come with REFRESH token
     * validate refreshToken --> Can extract user ID of that TOKEN
     * db lookup and check if any user with that ID exist
     * if it exist then generate a new Refresh and Access Token
     * return Access and Refresh Token
     */

    // When express token's validity runs out
    if (!token) throw ApiError.notFound("Refresh not found");

    const decode = JwtUtils.verifyRefreshToken(token); // userID
    if (!decode) throw ApiError.unauthorized("Mismatch in ID");

    const dbLookUp = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, decode.id));

    const user = dbLookUp[0];
    if (!user) throw ApiError.unauthorized("User does not exist");

    const newAccessToken = JwtUtils.generateAccessToken({
      id: user.id,
      role: user.role,
    });
    const newRefreshToken = JwtUtils.generateRefreshToken({
      id: user.id,
    });
    const hashedRefreshToken = hash(newRefreshToken);

    // Update in DB
    await db
      .update(userTable)
      .set({
        refreshToken: hashedRefreshToken,
      })
      .where(eq(userTable.id, user.id));

    return { newAccessToken, newRefreshToken };
  }
}
