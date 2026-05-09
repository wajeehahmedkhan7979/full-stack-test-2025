import { IsString, MinLength, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1, { message: 'Message content cannot be empty' })
  @MaxLength(10000, { message: 'Message content is too long' })
  content: string;
}
