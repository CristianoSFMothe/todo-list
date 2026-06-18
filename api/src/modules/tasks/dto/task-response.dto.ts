import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserSummaryDto } from '@/modules/users/dto/user-summary.dto';

export class TaskResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id!: string;

  @ApiProperty({ example: 'Buy groceries' })
  title!: string;

  @ApiProperty({ example: 'Milk, eggs and bread', nullable: true })
  description!: string | null;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
  })
  status!: string;

  @ApiProperty({ example: 'a3bb189e-8bf9-3888-9912-ace4e6543002' })
  userId!: string;

  @ApiPropertyOptional({ type: UserSummaryDto })
  user?: UserSummaryDto;
}
