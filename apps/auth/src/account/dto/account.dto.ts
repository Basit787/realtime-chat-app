import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class UserIdParamDto {
  @IsMongoId()
  userId!: string;
}

export class ImageResponseDto {
  @ApiProperty({ example: "http://localhost:3001/api/avatars/6650f1c2a1b2c3d4e5f60708?v=1729071234567" })
  image!: string;
}

export class OkResponseDto {
  @ApiProperty({ example: true })
  ok!: true;
}
