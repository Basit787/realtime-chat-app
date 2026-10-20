import { Test, type TestingModule } from "@nestjs/testing";
import { KeysService } from "../keys/keys.service.js";
import { SessionService } from "./session.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("SessionService", () => {
  let instance: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService, { provide: KeysService, useValue: {} }],
    }).compile();

    instance = module.get<SessionService>(SessionService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
