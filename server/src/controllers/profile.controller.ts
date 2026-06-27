import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { fromNodeHeaders } from "better-auth/node";
import type { AppAuth } from "../auth/index.js";
import type {
  ApiErrorResponse,
  OkResponse,
  ProfileAvatarResponse,
  ProfileStatusResponse,
} from "../types/api.js";
import { avatarPublicPath, type AvatarService } from "../services/avatar.service.js";
import { streamObjectToResponse } from "../services/objectStorage.service.js";
import { userPresenceService } from "../services/userPresence.service.js";
import { presenceService } from "../services/presence.service.js";
import type { PresenceStatus } from "../models/UserPresence.js";
import { HttpError } from "../utils/httpError.js";

const GENERAL_ROOM = "general";
const VALID_STATUSES: PresenceStatus[] = ["online", "away", "busy", "offline"];

const broadcastPresence = async (io: Server, room: string) => {
  const base = presenceService.getPresence(room);
  const statuses = await userPresenceService.getStatuses(base.users);
  io.to(room).emit("presence", { room, ...presenceService.getPresence(room, statuses) });
};

export const createProfileController = (auth: AppAuth, avatarService: AvatarService, io: Server) => {
  return {
    uploadAvatar: async (req: Request, res: Response<ProfileAvatarResponse | ApiErrorResponse>) => {
      try {
        if (!req.file || !req.user) {
          throw new HttpError(400, "No image uploaded");
        }

        const userId = req.user.id;
        await avatarService.saveAvatar(userId, req.file);

        const image = avatarPublicPath(userId);

        await auth.api.updateUser({
          body: { image },
          headers: fromNodeHeaders(req.headers),
        });

        res.json({ image });
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw error;
      }
    },

    getAvatarByUserId: async (req: Request, res: Response) => {
      try {
        const userId = req.params.userId as string;
        const key = await avatarService.findAvatarKey(userId);
        if (!key) {
          throw new HttpError(404, "Avatar not found");
        }
        await streamObjectToResponse(res, key, { inline: true });
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw error;
      }
    },

    getAvatarByUsername: async (req: Request, res: Response) => {
      try {
        const username = decodeURIComponent(req.params.username as string);
        const key = await avatarService.getUserAvatarKey(username);
        if (!key) {
          throw new HttpError(404, "Avatar not found");
        }
        await streamObjectToResponse(res, key, { inline: true });
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw error;
      }
    },

    removeAvatar: async (req: Request, res: Response<OkResponse | ApiErrorResponse>) => {
      try {
        if (!req.user) {
          throw new HttpError(401, "Authentication required");
        }

        await avatarService.removeAvatar(req.user.id);
        await auth.api.updateUser({
          body: { image: "" },
          headers: fromNodeHeaders(req.headers),
        });

        res.json({ ok: true });
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw error;
      }
    },

    getStatus: async (req: Request, res: Response<ProfileStatusResponse | ApiErrorResponse>) => {
      try {
        if (!req.user) {
          throw new HttpError(401, "Authentication required");
        }
        const status = await userPresenceService.getStatus(req.user.username);
        res.json({ status });
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw error;
      }
    },

    updateStatus: async (req: Request, res: Response<ProfileStatusResponse | ApiErrorResponse>) => {
      try {
        if (!req.user) {
          throw new HttpError(401, "Authentication required");
        }

        const status = req.body?.status as PresenceStatus | undefined;
        if (!status || !VALID_STATUSES.includes(status)) {
          throw new HttpError(400, "Invalid status");
        }

        await userPresenceService.setStatus(req.user.username, status);
        await broadcastPresence(io, GENERAL_ROOM);

        res.json({ status });
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw error;
      }
    },
  };
};
