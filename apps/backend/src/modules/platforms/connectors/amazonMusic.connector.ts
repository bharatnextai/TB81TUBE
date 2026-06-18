import { Platform } from "@prisma/client";
import { PlaceholderPlatformConnector } from "./placeholderPlatform.connector.js";

export const amazonMusicConnector = new PlaceholderPlatformConnector(Platform.AMAZON_MUSIC);
