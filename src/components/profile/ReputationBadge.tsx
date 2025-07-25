import React from 'react';
import { Star } from 'lucide-react';

interface ReputationBadgeProps {
  reputation: number;
}

const ReputationBadge: React.FC<ReputationBadgeProps> = ({ reputation }) => (
  <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold ml-2" title="Reputation">
    <Star className="w-4 h-4 text-yellow-500" />
    {reputation}
  </div>
);

export default ReputationBadge;
