import { createHmac } from 'crypto';

export type AuthProvider = 'google' | 'facebook';

export async function isValidGoogleAccessToken(
  token: string
): Promise<boolean> {
  const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!token || !googleClientId) {
    return false;
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`
  );
  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { aud?: string };
  return result.aud === googleClientId;
}

export async function isValidFacebookAccessToken(
  token: string
): Promise<boolean> {
  const fbAppSecret = process.env.FB_APP_SECRET;
  if (!token) {
    return false;
  }

  const params = new URLSearchParams({ access_token: token, fields: 'id' });
  if (fbAppSecret) {
    const proof = createHmac('sha256', fbAppSecret).update(token).digest('hex');
    params.set('appsecret_proof', proof);
  }

  const response = await fetch(
    `https://graph.facebook.com/me?${params.toString()}`
  );
  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { id?: string; error?: unknown };
  return Boolean(result.id) && !result.error;
}

export async function isValidAccessToken(
  token: string,
  provider: AuthProvider
): Promise<boolean> {
  if (!token || !provider) {
    return false;
  }
  if (provider === 'google') {
    return isValidGoogleAccessToken(token);
  }
  if (provider === 'facebook') {
    return isValidFacebookAccessToken(token);
  }
  return false;
}

export function getAuthFromRequest(request: Request): {
  token: string;
  provider: AuthProvider;
} | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const provider =
      (request.headers.get('x-auth-provider') as AuthProvider) || 'google';
    return { token: authHeader.slice(7), provider };
  }
  return null;
}

export async function getFacebookProfile(accessToken: string) {
  const fbAppSecret = process.env.FB_APP_SECRET;
  if (!fbAppSecret) {
    return {
      error:
        'Facebook App Secret not configured. Please set FB_APP_SECRET environment variable.',
    };
  }
  if (!accessToken) {
    return { error: 'Access token is required.' };
  }

  const appsecretProof = createHmac('sha256', fbAppSecret)
    .update(accessToken)
    .digest('hex');

  const params = new URLSearchParams({
    access_token: accessToken,
    appsecret_proof: appsecretProof,
    fields: 'id,name,email,picture.width(200).height(200),first_name,last_name',
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/me?${params.toString()}`
  );
  const result = await response.json();

  if (result.error) {
    return {
      error: `Facebook API error: ${result.error.message ?? 'Unknown error'}`,
    };
  }
  if (result.id) {
    return { success: [result] };
  }
  return { error: 'Unexpected response from Facebook Graph API.' };
}
