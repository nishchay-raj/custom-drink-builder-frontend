'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppContext, Feedback } from '@/context/app-context';
import { Star } from 'lucide-react';

export const ManagerFeedback: React.FC = () => {
  const { orders } = useAppContext();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/feedback/all`, {
          withCredentials: true,
        });

        const data = response.data;
        setFeedbacks(Array.isArray(data) ? data : data.feedbacks ?? []);
      } catch (err) {
        setError(axios.isAxiosError(err) ? err.message : 'Failed to load feedback');
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filterRating && f.rating !== filterRating) return false;
    return true;
  });

  const sortedFeedbacks = [...filteredFeedbacks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getFeedbackName = (name: string) => {
    return feedbacks.find(o => o.name === name)?.name || '—';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0';

  const ratingDistribution = {
    5: feedbacks.filter(f => f.rating === 5).length,
    4: feedbacks.filter(f => f.rating === 4).length,
    3: feedbacks.filter(f => f.rating === 3).length,
    2: feedbacks.filter(f => f.rating === 2).length,
    1: feedbacks.filter(f => f.rating === 1).length,
  };

  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Customer Feedback</h2>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{feedbacks.length}</span>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-accent mb-2">{avgRating}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < Math.round(parseFloat(avgRating)) ? 'fill-accent text-accent' : 'text-muted'}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Average Rating from {feedbacks.length} reviews</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-accent text-accent" />
                  ))}
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: feedbacks.length > 0 ? `${(ratingDistribution[rating as keyof typeof ratingDistribution] / feedbacks.length) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
                <span className="font-semibold text-foreground min-w-6 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              filterRating === null
                ? 'bg-accent text-white'
                : 'bg-muted text-foreground hover:bg-secondary'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating)}
              className={`px-4 py-2 rounded-lg transition text-sm flex items-center gap-1 ${
                filterRating === rating
                  ? 'bg-accent text-white'
                  : 'bg-muted text-foreground hover:bg-secondary'
              }`}
            >
              {rating} <Star size={14} className="fill-current" />
            </button>
          ))}
        </div>

        {/* category filters removed — not used for drinks */}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center border border-border">
            <p className="text-muted-foreground">Loading feedback...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-8 text-center border border-border">
            <p className="text-red-500">{error}</p>
          </div>
        ) : sortedFeedbacks.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-border">
            <p className="text-muted-foreground">No feedback found</p>
          </div>
        ) : (
          sortedFeedbacks.map(feedback => (
            <div key={feedback.id} className="bg-white rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{getFeedbackName(feedback.name)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(feedback.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < feedback.rating ? 'fill-accent text-accent' : 'text-muted'}
                      />
                    ))}
                  </div>
                  {/* category display removed */}
                </div>
              </div>
              <p className="text-foreground leading-relaxed">{feedback.feedback}</p>
            </div>
          ))
        )}
      <div className="min-h-screen pb-5"></div>
      </div>
    </div>
  );
};
