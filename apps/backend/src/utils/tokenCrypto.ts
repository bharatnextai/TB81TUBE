import crypto from "node:crypto";
import { env } from "../config/env.js";

const encryptedPrefix = "enc:v1";
const algorithm = "aes-256-gcm";

function parseEncryptionKey() {
  const rawKey = env.TOKEN_ENCRYPTION_KEY.trim();
  const key = /^[a-f0-9]{64}$/i.test(rawKey) ? Buffer.from(rawKey, "hex") : Buffer.from(rawKey, "base64");

  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }

  return key;
}

const encryptionKey = parseEncryptionKey();

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    encryptedPrefix,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(":");
}

export function decryptSecret(value: string) {
  if (!value.startsWith(`${encryptedPrefix}:`)) {
    return value;
  }

  const [, , iv, authTag, encrypted] = value.split(":");
  if (!iv || !authTag || !encrypted) {
    throw new Error("Encrypted token payload is malformed.");
  }

  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));

  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function encryptNullableSecret(value: string | null | undefined) {
  return value ? encryptSecret(value) : null;
}

export function decryptNullableSecret(value: string | null | undefined) {
  return value ? decryptSecret(value) : null;
}
