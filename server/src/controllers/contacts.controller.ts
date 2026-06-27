import type { Request, Response } from "express";
import type { Connection } from "mongoose";
import type { ApiErrorResponse, ContactsResponse } from "../types/api.js";
import { createContactsService } from "../services/contacts.service.js";
import { HttpError } from "../utils/httpError.js";

export const createContactsController = (connection: Connection) => {
  const contactsService = createContactsService(connection);

  return {
    listContacts: async (req: Request, res: Response<ContactsResponse | ApiErrorResponse>) => {
      try {
        if (!req.user) {
          throw new HttpError(401, "Unauthorized");
        }

        const contacts = await contactsService.getKnownContacts(req.user.username);
        res.json({ contacts });
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw error;
      }
    },
  };
};
