import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class SigningKeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.SigningKeyCreateInput) {
    return this.prisma.signingKey.create({ data });
  }

  findAll() {
    return this.prisma.signingKey.findMany({ orderBy: { createdAt: "desc" } });
  }

  findLatest() {
    return this.prisma.signingKey.findFirst({ orderBy: { createdAt: "desc" } });
  }
}
