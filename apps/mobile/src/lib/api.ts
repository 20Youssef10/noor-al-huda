import Constants from 'expo-constants';
import { z } from 'zod';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
};

export const apiBaseUrl = extra.apiBaseUrl ?? '';

function joinUrl(path: string): string {
  if (!apiBaseUrl) {
    throw new Error('API base URL is not configured.');
  }

  return new URL(path.replace(/^\//, ''), `${apiBaseUrl.replace(/\/$/, '')}/`).toString();
}

export async function jsonRequest<T>(
  path: string,
  schema?: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(joinUrl(path), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  const payload = await response.json();
  return schema ? schema.parse(payload) : (payload as T);
}
