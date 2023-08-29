import { IsDateString, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreatePublicationDto {
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  mediaId: number;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  postId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
