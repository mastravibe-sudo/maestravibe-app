'use client';

export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
  });

  if (response.status === 401) {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/admin/login?reason=session-expired&returnTo=${encodeURIComponent(returnTo)}`);
    throw new Error('Your admin session has expired. Please sign in again.');
  }

  return response;
}