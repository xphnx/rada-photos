import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { toast } from 'sonner';

const extractMessage = (error: FetchBaseQueryError): string => {
  if (error.data && typeof error.data === 'object' && 'message' in error.data) {
    const data = error.data;

    if (Array.isArray(data.message)) {
        return data.message.join(', ');
    }

    if (data.message && typeof data.message === 'string') {
        return data.message;
    }
  }

  if ('error' in error && typeof error.error === 'string') {
    return error.error;
  }

  return 'Неизвестная ошибка'
}

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const endpointName = (action.meta?.arg as { endpointName: string })?.endpointName;

    if (endpointName !== 'getMe') {
      toast.error(extractMessage(action.payload as FetchBaseQueryError));
    }
  }

  return next(action);
};
