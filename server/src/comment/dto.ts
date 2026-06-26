import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  photoId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text: string;
}
