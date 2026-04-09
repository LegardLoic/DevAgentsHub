import type { ApiError } from '@devagentshub/types';

import { webEnv } from './env';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

const buildHeaders = (headers?: HeadersInit): HeadersInit => ({
  Accept: 'application/json',
  ...(headers ?? {}),
});

export const apiFetch = async <TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> => {
  const response = await fetch(`${webEnv.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(init.headers),
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        data: TResponse;
      }
    | ApiError
    | null;

  if (!response.ok) {
    const errorPayload = payload as ApiError | null;

    throw new ApiClientError(
      errorPayload?.error?.message ?? 'Request failed',
      response.status,
      errorPayload?.error?.details,
    );
  }

  return (payload as { data: TResponse }).data;
};

export const postJson = async <TResponse, TBody>(path: string, body: TBody): Promise<TResponse> =>
  apiFetch<TResponse>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

