import React from 'react';

interface ProfileAboutProps {
  bio?: string;
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({ bio }) => (
  <section className="mb-8">
    <div className="relative bg-white rounded-2xl p-8 border border-purple-200 shadow-sm">
      <div className="absolute -left-1 top-6 h-12 w-1.5 rounded-full bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4 pl-4">About</h2>
      <div className="prose prose-lg max-w-none text-gray-700 pl-4">
        {bio ? <p>{bio}</p> : <p className="text-gray-400 italic">No biography available.</p>}
      </div>
    </div>
  </section>
);

export default ProfileAbout;
