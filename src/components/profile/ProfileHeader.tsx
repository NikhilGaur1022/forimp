import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile, onEdit }) => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 rounded-2xl mb-8 shadow-lg">
      <div className="px-4 sm:px-8 flex flex-col lg:flex-row items-center gap-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white/20 p-2 rounded-3xl shadow-md">
            <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-3xl font-bold text-gray-600">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
          {profile.is_featured && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow">
              FEATURED
            </div>
          )}
        </div>
        {/* Info + Reputation */}
        <div className="flex-1 flex flex-col items-center lg:items-start justify-center min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 w-full justify-center lg:justify-start">
            <span className="flex items-center">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-0 inline-block break-words text-center lg:text-left max-w-full" style={{wordBreak:'break-word'}}>{profile.full_name}</h1>
              {profile.is_verified && (
                <CheckCircle className="h-6 w-6 ml-2 text-blue-400" aria-label="Verified User" />
              )}
            </span>
            {profile.reputationBadge}
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 mb-4 w-full max-w-2xl">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1 w-full">
            <span className="text-lg text-white/90 font-medium break-words text-center lg:text-left max-w-full" style={{wordBreak:'break-word'}}>{profile.position || profile.specialty}</span>
            <span className="hidden sm:inline-block text-white/50 font-medium">|</span>
            <span className="text-lg text-white/90 font-medium break-words text-center lg:text-left max-w-full" style={{wordBreak:'break-word'}}>{profile.institution || profile.university || profile.clinic_name}</span>
              {profile.professor_since && (
                <span className="text-white/90">• Professor since {new Date(profile.professor_since).getFullYear()}</span>
              )}
            </div>
          </div>
          <div className="inline-block bg-white/20 px-4 py-2 rounded-lg mb-2 max-w-full break-words" style={{wordBreak:'break-word'}}>
            <span className="font-semibold">Specialization: </span>
            <span>{profile.specialty}</span>
          </div>
          {isOwnProfile && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-white/30 text-white rounded-lg font-semibold hover:bg-white/40 transition-colors mt-2"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
