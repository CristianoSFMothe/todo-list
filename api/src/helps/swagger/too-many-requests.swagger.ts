import { ApiErrorResponse } from './error-response.swagger';

/**
 * Documents a 429 Too Many Requests (rate limit enforced by ThrottlerGuard).
 */
export function TooManyRequestsSwagger(
  message = 'ThrottlerException: Too Many Requests',
  description = 'Rate limit exceeded',
  path?: string,
) {
  return ApiErrorResponse({
    status: 429,
    error: 'Too Many Requests',
    description,
    message,
    path,
  });
}
