import { ApiPropertyOptional } from '@nestjs/swagger';

import { TaskSummaryDto } from './task-summary.dto';
import { UserResponseDto } from './user-response.dto';

export class UserProfileResponseDto extends UserResponseDto {
  @ApiPropertyOptional({
    type: [TaskSummaryDto],
    description: 'Tasks owned by the user',
  })
  tasks?: TaskSummaryDto[];
}
