import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiErrorResponseDto } from './api-error-response.dto';

interface ApiErrorResponseParams {
  status: number;
  error: string;
  description: string;
  message: string | string[];
  path?: string;
}

/**
 * Builds an @ApiResponse documenting an error in the exact shape produced by
 * the global HttpExceptionFilter. The schema is referenced from the shared
 * ApiErrorResponseDto component, with a per-route example.
 */
export function ApiErrorResponse({
  status,
  error,
  description,
  message,
  path = '/',
}: ApiErrorResponseParams) {
  return applyDecorators(
    ApiExtraModels(ApiErrorResponseDto),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [{ $ref: getSchemaPath(ApiErrorResponseDto) }],
        example: {
          statusCode: status,
          error,
          message,
          path,
          timestamp: '2026-06-18T00:52:26.821Z',
        },
      },
    }),
  );
}
