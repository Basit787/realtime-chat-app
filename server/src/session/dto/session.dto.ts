import { ApiProperty } from "@nestjs/swagger";
import { AuthUserDto } from "../../auth/dto/auth-user.dto.js";

export class SessionResponseDto {
  @ApiProperty() authenticated!: boolean;
  @ApiProperty({ type: AuthUserDto, nullable: true }) user!: AuthUserDto | null;
}

export class TokenResponseDto {
  @ApiProperty({ description: "Short-lived JWT for the app APIs (Authorization: Bearer)" }) accessToken!: string;
  @ApiProperty({ description: "Expiry as epoch milliseconds" }) expiresAt!: number;
  @ApiProperty({ type: AuthUserDto }) user!: AuthUserDto;
}
