import { appConfig, type AppConfig } from "@app/common";
import { SigningKeyRepository } from "@app/db";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  importJWK,
  jwtVerify,
  SignJWT,
  type CryptoKey,
  type JSONWebKeySet,
  type JWK,
  type JWTPayload,
} from "jose";

const ALG = "EdDSA";

// Signs and verifies access tokens with a key pair kept in Mongo, so restarts and replicas share it
@Injectable()
export class KeysService implements OnModuleInit {
  private kid!: string;
  private privateKey!: CryptoKey;
  private publicKeys!: ReturnType<typeof createLocalJWKSet>;

  constructor(
    private readonly keys: SigningKeyRepository,
    @Inject(appConfig.KEY) private readonly config: AppConfig,
  ) {}

  async onModuleInit() {
    if (!(await this.keys.findLatest())) await this.createKey();
    const latest = (await this.keys.findLatest())!;
    this.kid = latest.kid;
    this.privateKey = (await importJWK(latest.privateJwk as JWK, ALG)) as CryptoKey;
    this.publicKeys = createLocalJWKSet(await this.jwks());
  }

  private async createKey() {
    const { publicKey, privateKey } = await generateKeyPair(ALG, { extractable: true });
    await this.keys.create({
      kid: randomUUID(),
      alg: ALG,
      publicJwk: { ...(await exportJWK(publicKey)) },
      privateJwk: { ...(await exportJWK(privateKey)) },
    });
  }

  // Every stored public key, so tokens signed by an older key still verify
  async jwks(): Promise<JSONWebKeySet> {
    const keys = await this.keys.findAll();
    return { keys: keys.map((key) => ({ ...(key.publicJwk as JWK), kid: key.kid, alg: key.alg, use: "sig" })) };
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

  // Throws when the token is invalid, expired or not issued by this server
  async verify<T extends object>(token: string): Promise<JWTPayload & T> {
    const { payload } = await jwtVerify<T>(token, this.publicKeys, {
      issuer: this.config.publicUrl,
      audience: this.config.audience,
    });
    return payload;
  }
}
