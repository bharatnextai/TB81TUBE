import { Platform } from "@prisma/client";
import { PlaceholderPlatformConnector } from "./placeholderPlatform.connector.js";

export const spotifyConnector = new PlaceholderPlatformConnector(Platform.SPOTIFY);
