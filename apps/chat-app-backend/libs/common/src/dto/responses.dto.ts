import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OkResponseDto {
  @ApiProperty({ example: true })
  ok!: true;
}

export class ErrorResponseDto {
  @ApiProperty({ example: "Authentication required" })
  error!: string;

  @ApiPropertyOptional({ example: { name: ["name must be shorter than or equal to 64 characters"] } })
  details?: Record<string, string[]>;
}

export class ImageResponseDto {
  @ApiProperty({ example: "/api/profile/avatars/6650f1c2a1b2c3d4e5f60708?v=1729071234567" })
  image!: string;
}
