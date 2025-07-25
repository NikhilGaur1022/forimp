import React from 'react';

interface Achievement {
  id: string;
  title: string;
  description?: string;
  date_achieved?: string;
}

interface ProfileAchievementsProps {
  achievements: Achievement[];
}

const ProfileAchievements: React.FC<ProfileAchievementsProps> = ({ achievements }) => {
  if (!achievements || achievements.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
      <div className="space-y-3">
        {achievements.slice(0, 5).map((achievement) => (
          <div key={achievement.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              🏆
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {achievement.title}
              </h4>
              {achievement.description && (
                <p className="text-gray-600 text-xs mt-1">
                  {achievement.description}
                </p>
              )}
              {achievement.date_achieved && (
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(achievement.date_achieved).getFullYear()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProfileAchievements;
