import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

interface ApiErrorResponseParams {
  status: number;
  error: string;
  description: string;
  message: string | string[];
  path?: string;
}

/**
 * Builds an @ApiResponse documenting an error in the exact shape produced by
 * the global HttpExceptionFilter: { statusCode, error, message, path, timestamp }.
 */
export function ApiErrorResponse({
  status,
  error,
  description,
  message,
  path = '/',
}: ApiErrorResponseParams) {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: status },
          error: { type: 'string', example: error },
          message: {
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } },
            ],
            example: message,
          },
          path: { type: 'string', example: path },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-18T00:52:26.821Z',
          },
        },
      },
    }),
  );
}
