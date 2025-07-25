import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileReviewsListProps {
  profileId: string;
}

const ProfileReviewsList: React.FC<ProfileReviewsListProps> = ({ profileId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profile_ratings')
        .select('*, rater:rater_id(full_name, avatar_url)')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (!error) setReviews(data || []);
      setLoading(false);
    };
    fetchReviews();
  }, [profileId]);

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;
  if (!reviews.length) return <div className="text-center py-4 text-gray-500">No reviews yet.</div>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 min-w-[120px]">
            {review.rater?.avatar_url ? (
              <img src={review.rater.avatar_url} alt={review.rater.full_name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                {review.rater?.full_name?.charAt(0) || '?'}
              </div>
            )}
            <span className="font-semibold text-gray-900">{review.rater?.full_name || 'User'}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={star <= review.rating ? '#facc15' : 'none'} />
              ))}
              <span className="ml-2 text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <div className="text-gray-800 text-sm mb-1">{review.comment}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileReviewsList;
