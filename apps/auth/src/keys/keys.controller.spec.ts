import { Test, type TestingModule } from "@nestjs/testing";
import { KeysController } from "./keys.controller.js";
import { KeysService } from "./keys.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("KeysController", () => {
  let instance: KeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeysController],
      providers: [{ provide: KeysService, useValue: {} }],
    }).compile();

    instance = module.get<KeysController>(KeysController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
