import { ApiErrorResponse } from './error-response.swagger';

/**
 * Documents a 409 Conflict (ConflictException).
 */
export function ConflictSwagger(
  message = 'Resource already exists',
  description = 'Resource already exists',
  path?: string,
) {
  return ApiErrorResponse({
    status: 409,
    error: 'Conflict',
    description,
    message,
    path,
  });
}
