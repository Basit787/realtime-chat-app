import { Test, type TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service.js";
import { UserRepository, MessageRepository, CallHistoryRepository, ChatGroupRepository } from "@app/db";
import { StorageService } from "@app/storage";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("UsersService", () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: {} },
        { provide: MessageRepository, useValue: {} },
        { provide: CallHistoryRepository, useValue: {} },
        { provide: ChatGroupRepository, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(usersService).toBeDefined();
  });
});
