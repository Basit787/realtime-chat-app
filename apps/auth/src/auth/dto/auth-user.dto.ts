import { ApiProperty } from "@nestjs/swagger";

export class AuthUserDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: "alex", description: "Username shown in every app" }) name!: string;
  @ApiProperty({ example: "alex@example.com" }) email!: string;
  @ApiProperty({ description: "Avatar path, empty when none" }) image!: string;
  @ApiProperty({ enum: ["user", "admin"] }) role!: "user" | "admin";
}
