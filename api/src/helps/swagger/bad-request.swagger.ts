import { ApiErrorResponse } from './error-response.swagger';

/**
 * Documents a 400 Bad Request (validation / BadRequestException).
 * Pass the message(s) thrown by the route, e.g.
 * 'Both currentPassword and newPassword are required to update password'.
 */
export function BadRequestSwagger(
  message: string | string[] = ['property teste should not exist'],
  description = 'Invalid request data',
  path?: string,
) {
  return ApiErrorResponse({
    status: 400,
    error: 'Bad Request',
    description,
    message,
    path,
  });
}
