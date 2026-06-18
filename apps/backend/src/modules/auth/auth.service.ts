import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

type UserForResponse = {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
};

function toPublicUser(user: UserForResponse) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage
  };
}

function signToken(userId: string) {
  const expiresIn = env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn
  });
}

export async function registerUser(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    });

    return {
      user: toPublicUser(user),
      token: signToken(user.id)
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "Email is already registered");
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user: toPublicUser(user),
    token: signToken(user.id)
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return toPublicUser(user);
}
