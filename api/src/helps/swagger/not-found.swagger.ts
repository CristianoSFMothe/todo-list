import { ApiErrorResponse } from './error-response.swagger';

/**
 * Documents a 404 Not Found (NotFoundException).
 */
export function NotFoundSwagger(
  message = 'Resource not found',
  description = 'Resource not found',
  path?: string,
) {
  return ApiErrorResponse({
    status: 404,
    error: 'Not Found',
    description,
    message,
    path,
  });
}
