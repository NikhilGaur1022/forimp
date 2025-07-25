import React from 'react';

interface ProfileStatsProps {
  stats?: any;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  if (!stats) return null;
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="text-2xl font-bold text-gray-900">{stats.articles_published || 0}</div>
          <div className="text-sm text-gray-600">Articles Published</div>
        </div>
        <div className="text-center bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="text-2xl font-bold text-gray-900">{stats.total_citations || 0}</div>
          <div className="text-sm text-gray-600">Total Citations</div>
        </div>
        <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div className="text-2xl font-bold text-gray-900">{stats.courses_count || 0}</div>
          <div className="text-sm text-gray-600">Courses</div>
        </div>
        <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
          <div className="text-2xl font-bold text-gray-900">{stats.students_taught || 0}</div>
          <div className="text-sm text-gray-600">Students Taught</div>
        </div>
      </div>
    </section>
  );
};

export default ProfileStats;
