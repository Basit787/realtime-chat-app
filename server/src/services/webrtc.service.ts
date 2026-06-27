import type { WebRTCConfigResponse } from "../types/api.js";
import { config } from "../config/index.js";

const getIceServers = (): WebRTCConfigResponse => {
  const host = config.turnHost;
  const port = config.turnPort;
  return {
    iceServers: [
      { urls: `stun:${host}:${port}` },
      {
        urls: `turn:${host}:${port}`,
        username: config.turnUser,
        credential: config.turnPassword,
      },
    ],
  };
};

export const webRTCService = { getIceServers };
