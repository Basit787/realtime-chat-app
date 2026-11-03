import { parseDmRoom, type ContactDto } from "@app/common";
import { StorageService } from "@app/storage";
import { CallHistoryRepository, ChatGroupRepository, MessageRepository, UserRepository } from "@app/db";
import { Injectable } from "@nestjs/common";

const AVATAR_PREFIX = "avatars/";

// Avatar lookups (MinIO, uploaded through the auth service) and contacts
@Injectable()
export class UsersService {
  constructor(
    private readonly users: UserRepository,
    private readonly messages: MessageRepository,
    private readonly calls: CallHistoryRepository,
    private readonly groups: ChatGroupRepository,
    private readonly storage: StorageService,
  ) {}

  findAvatarKey(userId: string) {
    return this.storage.bucket.findFirstKey(AVATAR_PREFIX, userId);
  }

  async findAvatarKeyByUsername(username: string) {
    const userId = await this.users.findIdByName(username);
    return userId ? this.findAvatarKey(userId) : null;
  }

  // Everyone the user has talked to, called or shares a group with, plus every other account
  async getContacts(username: string): Promise<ContactDto[]> {
    const peers = new Set<string>();
    const [dmRooms, calls, groups, accounts] = await Promise.all([
      this.messages.findDmRooms(),
      this.calls.findParticipantsFor(username),
      this.groups.findMemberLists(username),
      this.users.listNamesAndImages(),
    ]);

    for (const { room } of dmRooms) {
      const participants = parseDmRoom(room);
      if (participants?.includes(username)) peers.add(participants[0] === username ? participants[1] : participants[0]);
    }
    for (const call of calls) peers.add(call.caller === username ? call.callee : call.caller);
    for (const group of groups) group.members.forEach((member) => peers.add(member));
    const imageByName = new Map(accounts.map((account) => [account.name, account.image]));
    for (const name of imageByName.keys()) peers.add(name);

    peers.delete(username);
    return [...peers].sort((a, b) => a.localeCompare(b)).map((name) => ({ name, image: imageByName.get(name) ?? "" }));
  }
}
