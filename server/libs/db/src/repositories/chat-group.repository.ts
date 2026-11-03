import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class ChatGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ChatGroupCreateInput) {
    return this.prisma.chatGroup.create({ data });
  }

  findById(id: string) {
    return this.prisma.chatGroup.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.ChatGroupUpdateInput) {
    return this.prisma.chatGroup.update({ where: { id }, data });
  }

  // Most recently updated first
  findForMember(username: string) {
    return this.prisma.chatGroup.findMany({ where: { members: { has: username } }, orderBy: { updatedAt: "desc" } });
  }

  findMembers(groupId: string) {
    return this.prisma.chatGroup.findUnique({ where: { id: groupId }, select: { members: true } });
  }

  findNameAndMembers(groupId: string) {
    return this.prisma.chatGroup.findUnique({ where: { id: groupId }, select: { name: true, members: true } });
  }

  findMemberLists(username: string) {
    return this.prisma.chatGroup.findMany({ where: { members: { has: username } }, select: { members: true } });
  }
}
