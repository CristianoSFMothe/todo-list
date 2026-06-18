import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a3bb189e-8bf9-3888-9912-ace4e6543002' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'johndoe@email.com' })
  email!: string;

  @ApiPropertyOptional({
    description: 'Tasks owned by the user (only returned on the profile route)',
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Buy groceries',
        description: 'Milk, eggs and bread',
        status: 'PENDING',
      },
    ],
  })
  tasks?: {
    id: string;
    title: string;
    description: string | null;
    status: string;
  }[];
}
