import { db } from "../../common/db/db.index.js";
import { userTable } from "../../common/db/db.schema.js";
import type { RegisterPayload } from "./dto/register-dto.js";
import { eq } from "drizzle-orm";
import { ApiError } from "../../common/utils/api-error-response.js";
import { createHmac, randomBytes } from "node:crypto";
import { JwtUtils } from "../../common/utils/jwt-utils.js";
import crypto from "crypto";
import type { LoginPayload } from "./dto/login-dto.js";

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
    const [user] = await db
      .insert(userTable)
      .values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        salt,
        verificationToken: hashedToken,
      })
      .returning({
        id: userTable.id,
      });

    if (!user) throw ApiError.internal("Failed to create user");

    return user;

    // TODO: Email service
  }

  static async login(data: LoginPayload) {
    const { email, password } = data;

    const checkEmailExist = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (checkEmailExist.length === 0)
      throw ApiError.unauthorized("Check email or password");

    const user = checkEmailExist[0];

    const userPassWordCheck = passGenerator(password, user?.salt);

    if (userPassWordCheck.hashedPassword !== user?.password)
      throw ApiError.unauthorized("Check email or password");

    const accessToken = JwtUtils.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = JwtUtils.generateRefreshToken({ id: user.id });
    const hashedRefreshToken = hash(refreshToken);

    await db
      .update(userTable)
      .set({
        refreshToken: hashedRefreshToken,
      })
      .where(eq(userTable.id, user.id));

    return { accessToken, refreshToken };
  }
}
