import React from 'react';


interface ProfileQuickStatsProps {
  articlesCount: number;
  discussionsCount: number;
  commentsCount: number;
  achievementsCount: number;
}

const ProfileQuickStats: React.FC<ProfileQuickStatsProps> = ({ articlesCount, discussionsCount, commentsCount, achievementsCount }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{articlesCount}</div>
          <div className="text-xs text-gray-600">Articles</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{discussionsCount}</div>
          <div className="text-xs text-gray-600">Discussions</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">{commentsCount}</div>
          <div className="text-xs text-gray-600">Comments</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{achievementsCount}</div>
          <div className="text-xs text-gray-600">Achievements</div>
        </div>
      </div>
    </section>
  );
};

export default ProfileQuickStats;
