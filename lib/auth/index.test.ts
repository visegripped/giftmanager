import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getGoogleOAuthClientId, isValidGoogleAccessToken } from './index';

describe('getGoogleOAuthClientId', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers GOOGLE_OAUTH_CLIENT_ID', () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', ' server-client-id ');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'public-client-id');
    expect(getGoogleOAuthClientId()).toBe('server-client-id');
  });

  it('falls back to NEXT_PUBLIC_GOOGLE_CLIENT_ID', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', ' public-client-id ');
    expect(getGoogleOAuthClientId()).toBe('public-client-id');
  });
});

describe('isValidGoogleAccessToken', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'expected-client-id');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('accepts aud match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ aud: 'expected-client-id' }),
      })
    );

    await expect(isValidGoogleAccessToken('token')).resolves.toBe(true);
  });

  it('accepts azp match when aud differs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          aud: 'other-audience',
          azp: 'expected-client-id',
        }),
      })
    );

    await expect(isValidGoogleAccessToken('token')).resolves.toBe(true);
  });

  it('rejects when no audience fields match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ aud: 'wrong-client-id' }),
      })
    );

    await expect(isValidGoogleAccessToken('token')).resolves.toBe(false);
  });

  it('rejects when client id env is missing', async () => {
    vi.unstubAllEnvs();
    await expect(isValidGoogleAccessToken('token')).resolves.toBe(false);
  });
});
