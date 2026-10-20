import { appConfig, type AppConfig } from "@app/common";
import { SigningKeyRepository } from "@app/db";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  exportJWK,
  generateKeyPair,
  importJWK,
  SignJWT,
  type CryptoKey,
  type JSONWebKeySet,
  type JWTPayload,
} from "jose";

const ALG = "EdDSA";

// Signs access tokens with a key pair kept in Mongo, so restarts and replicas share it
@Injectable()
export class KeysService implements OnModuleInit {
  private kid!: string;
  private privateKey!: CryptoKey;

  constructor(
    private readonly keys: SigningKeyRepository,
    @Inject(appConfig.KEY) private readonly config: AppConfig,
  ) {}

  async onModuleInit() {
    if (!(await this.keys.findLatest())) await this.createKey();
    const latest = (await this.keys.findLatest())!;
    this.kid = latest.kid;
    this.privateKey = (await importJWK(latest.privateJwk, ALG)) as CryptoKey;
  }

  private async createKey() {
    const { publicKey, privateKey } = await generateKeyPair(ALG, { extractable: true });
    await this.keys.create({
      kid: randomUUID(),
      alg: ALG,
      publicJwk: await exportJWK(publicKey),
      privateJwk: await exportJWK(privateKey),
    });
  }

  // Every stored public key, so tokens signed by an older key still verify
  async jwks(): Promise<JSONWebKeySet> {
    const keys = await this.keys.findAll();
    return { keys: keys.map((key) => ({ ...key.publicJwk, kid: key.kid, alg: key.alg, use: "sig" })) };
  }

  sign(subject: string, claims: JWTPayload): Promise<string> {
    return new SignJWT(claims)
      .setProtectedHeader({ alg: ALG, kid: this.kid })
      .setSubject(subject)
      .setIssuer(this.config.publicUrl)
      .setAudience(this.config.audience)
      .setIssuedAt()
      .setExpirationTime(this.config.accessTokenTtl)
      .sign(this.privateKey);
  }
}
