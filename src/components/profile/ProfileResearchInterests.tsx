import React from 'react';


interface ProfileResearchInterestsProps {
  interests?: string[];
  label?: string;
}

const ProfileResearchInterests: React.FC<ProfileResearchInterestsProps> = ({ interests, label }) => {
  if (!interests || interests.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{label || 'Research Interests'}</h2>
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex flex-wrap gap-3">
          {interests.map((interest, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfileResearchInterests;
