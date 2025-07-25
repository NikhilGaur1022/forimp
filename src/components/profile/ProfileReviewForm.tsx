import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileReviewFormProps {
  profileId: string;
  raterId: string;
  onSubmit?: () => void;
}

const ProfileReviewForm: React.FC<ProfileReviewFormProps> = ({ profileId, raterId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!rating) {
      setError('Please select a rating.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('profile_ratings').insert({
      profile_id: profileId,
      rater_id: raterId,
      rating,
      comment,
    });
    if (error) {
      setError('Could not submit review.');
    } else {
      setSuccess(true);
      setComment('');
      setRating(0);
      if (onSubmit) onSubmit();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-lg font-bold mb-2 text-gray-900">Leave a Review</h3>
      <div className="flex items-center mb-4">
        {[1,2,3,4,5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-7 w-7 ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
              fill={star <= (hover || rating) ? '#facc15' : 'none'}
            />
          </button>
        ))}
      </div>
      <textarea
        className="w-full border border-gray-200 rounded-lg p-2 mb-3 text-sm focus:ring-2 focus:ring-dental-400"
        rows={3}
        placeholder="Write a comment (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={500}
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">Thank you for your review!</div>}
      <button
        type="submit"
        className="bg-dental-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-dental-700 transition-colors"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ProfileReviewForm;
