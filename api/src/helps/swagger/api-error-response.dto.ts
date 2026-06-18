import { ApiProperty } from '@nestjs/swagger';

/**
 * Reusable schema describing the error body produced by the global
 * HttpExceptionFilter. Referenced by the Api*Swagger helpers so the OpenAPI
 * spec has a single named component instead of repeated inline schemas.
 */
export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({
    description: 'Human readable message or list of validation messages',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'property teste should not exist',
  })
  message!: string | string[];

  @ApiProperty({ example: '/users' })
  path!: string;

  @ApiProperty({ example: '2026-06-18T00:52:26.821Z' })
  timestamp!: string;
}
