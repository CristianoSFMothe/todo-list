import { ApiErrorResponse } from './error-response.swagger';

/**
 * Documents a 401 Unauthorized (missing/invalid JWT, enforced by JwtAuthGuard).
 */
export function UnauthorizedSwagger(
  message = 'Unauthorized',
  description = 'Missing or invalid access token',
  path?: string,
) {
  return ApiErrorResponse({
    status: 401,
    error: 'Unauthorized',
    description,
    message,
    path,
  });
}
