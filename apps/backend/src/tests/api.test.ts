import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/tb81tube_test?schema=public";
process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough";
process.env.TOKEN_ENCRYPTION_KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
process.env.APP_ORIGIN = "http://localhost:8081";
process.env.CORS_ORIGINS = "http://localhost:8081";
process.env.API_BASE_URL = "http://localhost:4000";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
process.env.GOOGLE_REDIRECT_URI = "http://localhost:4000/api/v1/connections/youtube/callback";
process.env.YOUTUBE_API_KEY = "test-youtube-api-key";

const prismaMock = vi.hoisted(() => ({
  connectedAccount: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn()
  },
  contentItem: {
    upsert: vi.fn()
  },
  favorite: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn()
  },
  playlist: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  playlistItem: {
    upsert: vi.fn(),
    deleteMany: vi.fn()
  },
  searchHistory: {
    create: vi.fn()
  },
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    delete: vi.fn()
  },
  watchHistory: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn()
  }
}));

vi.mock("../config/prisma.js", () => ({
  prisma: prismaMock
}));

const { app } = await import("../app.js");

function authToken(userId = "user_1") {
  return jwt.sign({ sub: userId, email: "ada@example.com" }, process.env.JWT_SECRET!, {
    expiresIn: "1h"
  });
}

function authHeader(userId = "user_1") {
  return `Bearer ${authToken(userId)}`;
}

function contentPayload() {
  return {
    platform: "YOUTUBE",
    externalContentId: "video_1",
    title: "Official YouTube video",
    description: "A test video from the official API.",
    thumbnailUrl: "https://img.youtube.com/vi/video_1/mqdefault.jpg",
    creatorName: "TB81Tube",
    duration: 300,
    contentType: "VIDEO",
    sourceUrl: "https://www.youtube.com/watch?v=video_1",
    playbackType: "EMBEDDED_PLAYER"
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("backend API", () => {
  it("registers a new user", async () => {
    prismaMock.user.create.mockResolvedValue({
      id: "user_1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      profileImage: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      connectedAccounts: []
    });

    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "Password123!"
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user).toMatchObject({
      id: "user_1",
      email: "ada@example.com",
      youtubeConnected: false
    });
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  it("logs in an existing user", async () => {
    const passwordHash = await bcrypt.hash("Password123!", 12);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "ada@example.com",
      passwordHash
    });
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      id: "user_1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      profileImage: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      connectedAccounts: [{ id: "connection_1" }]
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "ada@example.com",
      password: "Password123!"
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.youtubeConnected).toBe(true);
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  it("blocks protected route access without a token", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Missing auth token.");
  });

  it("creates a local playlist for an authenticated user", async () => {
    prismaMock.playlist.create.mockResolvedValue({
      id: "playlist_1",
      userId: "user_1",
      name: "Road trip",
      description: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z")
    });

    const response = await request(app)
      .post("/api/v1/playlists")
      .set("Authorization", authHeader())
      .send({ name: "Road trip" });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.playlist.name).toBe("Road trip");
    expect(prismaMock.playlist.create).toHaveBeenCalledWith({
      data: {
        userId: "user_1",
        name: "Road trip",
        description: null
      }
    });
  });

  it("creates a favorite after upserting the content item", async () => {
    const contentItem = {
      id: "content_1",
      ...contentPayload(),
      duration: 300,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z")
    };
    prismaMock.contentItem.upsert.mockResolvedValue(contentItem);
    prismaMock.favorite.upsert.mockResolvedValue({
      id: "favorite_1",
      userId: "user_1",
      contentItemId: "content_1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      contentItem
    });

    const response = await request(app)
      .post("/api/v1/favorites")
      .set("Authorization", authHeader())
      .send(contentPayload());

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.favorite.contentItem.id).toBe("content_1");
    expect(prismaMock.contentItem.upsert).toHaveBeenCalled();
    expect(prismaMock.favorite.upsert).toHaveBeenCalled();
  });

  it("validates search query input", async () => {
    const response = await request(app).get("/api/v1/search").set("Authorization", authHeader());

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid request.");
    expect(prismaMock.searchHistory.create).not.toHaveBeenCalled();
  });

  it("validates connected account platform input", async () => {
    const response = await request(app)
      .delete("/api/v1/connections/platform/NOT_A_PLATFORM")
      .set("Authorization", authHeader());

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid request.");
    expect(prismaMock.connectedAccount.delete).not.toHaveBeenCalled();
  });
});
