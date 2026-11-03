import type { ContactDto, PresenceStatus } from "@app/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsMongoId, IsString, Length } from "class-validator";

const STATUSES: PresenceStatus[] = ["online", "away", "busy", "offline"];

export class UpdateStatusDto {
  @ApiProperty({ enum: STATUSES })
  @IsIn(STATUSES, { message: "Invalid status" })
  status!: PresenceStatus;
}

export class StatusResponseDto {
  @ApiProperty({ enum: STATUSES })
  status!: PresenceStatus;
}

export class UserIdParamDto {
  @IsMongoId()
  userId!: string;
}

export class UsernameParamDto {
  @IsString()
  @Length(1, 64)
  username!: string;
}

export class ContactResponseDto implements ContactDto {
  @ApiProperty({ example: "sam" }) name!: string;
  @ApiProperty({ description: "Avatar path, empty when none" }) image!: string;
}

export class ContactsResponseDto {
  @ApiProperty({ type: [ContactResponseDto] })
  contacts!: ContactResponseDto[];
}
