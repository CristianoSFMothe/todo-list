import { ApiProperty } from '@nestjs/swagger';

export class TaskSummaryDto {
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
}
