import { ArrayNotEmpty, IsArray, IsIn, IsString } from 'class-validator';

import { REACTION_TYPES } from './reaction.constants';

export class ToggleReactionDto {
  @IsString()
  photoId: string;

  @IsIn(REACTION_TYPES)
  type: string;
}

export class SummaryDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  photoIds: string[];
}
