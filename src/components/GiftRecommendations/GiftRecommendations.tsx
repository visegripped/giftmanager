import React, { useState, useContext } from 'react';
import './GiftRecommendations.css';
import Button from '../Button/Button';
import {
  getGiftRecommendations,
  GiftRecommendation,
} from '../../services/aiRecommendations';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import postReport from '../../utilities/postReport';
import fetchData from '../../utilities/fetchData';
import { responseInterface } from '../../types/types';

export interface GiftRecommendationsProps {
  theiruserid: string | number;
  onAddRecommendation?: (
    name: string,
    description: string,
    link?: string
  ) => void;
}

/**
 * Component for displaying AI-generated gift recommendations
 */
export const GiftRecommendations = React.memo(
  (props: GiftRecommendationsProps) => {
    const { theiruserid, onAddRecommendation } = props;
    const { addNotification } = useContext(
      NotificationsContext
    ) as NotificationContextProps;

    const [recommendations, setRecommendations] = useState<
      GiftRecommendation[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRecommendations, setShowRecommendations] = useState(false);

    const handleGetRecommendations = async () => {
      setLoading(true);
      setError(null);
      setShowRecommendations(true);

      try {
        const response = await getGiftRecommendations(theiruserid, 10);

        if (response.error) {
          setError(response.error);
          postReport({
            type: 'error',
            report: 'Failed to get AI gift recommendations',
            body: {
              error: response.error,
              file: 'GiftRecommendations',
              origin: 'aiRecommendations',
            },
          });
          addNotification({
            message: `Unable to get recommendations: ${response.error}`,
            type: 'error',
          });
        } else if (response.warn) {
          setError(response.warn);
          addNotification({
            message: response.warn,
            type: 'warn',
          });
        } else if (response.success) {
          setRecommendations(response.success);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        postReport({
          type: 'error',
          report: 'Exception getting AI gift recommendations',
          body: {
            error: errorMessage,
            file: 'GiftRecommendations',
            origin: 'aiRecommendations',
          },
        });
      } finally {
        setLoading(false);
      }
    };

    const handleAddRecommendation = (recommendation: GiftRecommendation) => {
      if (onAddRecommendation) {
        onAddRecommendation(
          recommendation.name,
          recommendation.description,
          ''
        );
        addNotification({
          message: `Added "${recommendation.name}" to the list`,
          type: 'success',
        });
      } else {
        // Fallback: use fetchData directly
        const response = fetchData({
          task: 'addItemToTheirList',
          theiruserid: theiruserid,
          name: recommendation.name,
          description: recommendation.description,
          link: '',
          groupid: '1',
        } as any);

        response &&
          response.then((data: responseInterface) => {
            if (data.error) {
              postReport({
                type: 'error',
                report: 'Failed to add recommendation to list',
                body: {
                  error: data.error,
                  file: 'GiftRecommendations',
                  origin: 'apiResponse',
                },
              });
              addNotification({
                message: `Failed to add item: ${data.error}`,
                type: 'error',
              });
            } else {
              addNotification({
                message: `Added "${recommendation.name}" to the list`,
                type: 'success',
              });
            }
          });
      }
    };

    if (!showRecommendations) {
      return (
        <div className="gift-recommendations">
          <Button
            icon="plus"
            label="Get AI Gift Recommendations"
            onButtonClick={handleGetRecommendations}
            title="Get personalized gift suggestions based on their wishlist history"
          />
        </div>
      );
    }

    return (
      <div className="gift-recommendations">
        <div className="gift-recommendations-header">
          <h3>AI Gift Recommendations</h3>
          <Button
            icon="plus"
            label="Refresh Recommendations"
            onButtonClick={handleGetRecommendations}
            title="Get new recommendations"
          />
        </div>

        {loading && <div className="loading">Loading recommendations...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && !error && recommendations.length > 0 && (
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-header">
                  <h4>{rec.name}</h4>
                  {rec.category && (
                    <span className="recommendation-category">
                      {rec.category}
                    </span>
                  )}
                </div>
                <p className="recommendation-description">{rec.description}</p>
                {rec.reason && (
                  <p className="recommendation-reason">
                    <em>Why: {rec.reason}</em>
                  </p>
                )}
                <Button
                  icon="plus"
                  label="Add to List"
                  size="small"
                  onButtonClick={() => handleAddRecommendation(rec)}
                  title={`Add "${rec.name}" to the gift list`}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <div className="no-recommendations">
            No recommendations available. Try refreshing.
          </div>
        )}
      </div>
    );
  }
);

GiftRecommendations.displayName = 'GiftRecommendations';

export default GiftRecommendations;
