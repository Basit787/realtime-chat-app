import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";

// better-auth's users, read-only here: better-auth writes them through its Prisma adapter
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findIdByName(username: string): Promise<string | null> {
    const user = await this.prisma.user.findFirst({
      where: { name: { equals: username, mode: "insensitive" } },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  async listNamesAndImages(): Promise<{ name: string; image: string }[]> {
    const users = await this.prisma.user.findMany({ select: { name: true, image: true } });
    return users.filter((u) => !!u.name).map((u) => ({ name: u.name, image: u.image ?? "" }));
  }
}
