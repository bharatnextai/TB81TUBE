import { Platform } from "@prisma/client";
import type { PlatformConnector } from "./platformConnector.js";
import { airtelWynkConnector } from "./airtelWynk.connector.js";
import { amazonMusicConnector } from "./amazonMusic.connector.js";
import { jioSaavnConnector } from "./jioSaavn.connector.js";
import { spotifyConnector } from "./spotify.connector.js";
import { youtubeConnector } from "./youtube.connector.js";

const connectors: Record<Platform, PlatformConnector> = {
  [Platform.YOUTUBE]: youtubeConnector,
  [Platform.JIOSAAVN]: jioSaavnConnector,
  [Platform.AMAZON_MUSIC]: amazonMusicConnector,
  [Platform.AIRTEL_WYNK]: airtelWynkConnector,
  [Platform.SPOTIFY]: spotifyConnector
};

export function getPlatformConnector(platform: Platform) {
  return connectors[platform];
}

export { youtubeConnector };
