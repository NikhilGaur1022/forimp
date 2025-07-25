import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function useHasReviewed(profileId: string | undefined, userId: string | undefined) {
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  useEffect(() => {
    if (!profileId || !userId) {
      setHasReviewed(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('profile_ratings')
      .select('id')
      .eq('profile_id', profileId)
      .eq('rater_id', userId)
      .limit(1)
      .then(({ data, error }) => {
        if (!cancelled) setHasReviewed(!!(data && data.length));
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, userId]);
  return hasReviewed;
}
