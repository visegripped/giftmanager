import fetchData from '../utilities/fetchData';
import { responseInterface } from '../types/types';

export interface GiftRecommendation {
  name: string;
  description: string;
  category?: string;
  reason?: string;
}

export interface GiftRecommendationsResponse {
  success?: GiftRecommendation[];
  error?: string;
  warn?: string;
}

/**
 * Fetch AI-generated gift recommendations for a user
 * @param theiruserid The user ID to get recommendations for
 * @param limit Number of recommendations to return (default 10)
 * @returns Promise with recommendations or error
 */
export const getGiftRecommendations = async (
  theiruserid: string | number,
  limit: number = 10
): Promise<GiftRecommendationsResponse> => {
  const response = await fetchData({
    task: 'getGiftRecommendations',
    theiruserid: theiruserid,
    limit: limit.toString(),
  } as any);

  if (!response) {
    return { error: 'Failed to fetch recommendations' };
  }

  const data = response as responseInterface & {
    success?: GiftRecommendation[];
  };

  if (data.error) {
    return { error: data.error };
  }

  if (data.warn) {
    return { warn: data.warn };
  }

  if (data.success && Array.isArray(data.success)) {
    return { success: data.success };
  }

  return { error: 'Invalid response format' };
};

export default getGiftRecommendations;
