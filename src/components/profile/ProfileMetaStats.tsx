import React from 'react';

interface ProfileMetaStatsProps {
  years_of_experience?: number;
  publications_count?: number;
  courses_taught?: number;
  application_count?: number;
  is_verified?: boolean;
  is_seller?: boolean;
  seller_status?: string;
  verification_status?: string;
  location?: string;
}

const ProfileMetaStats: React.FC<ProfileMetaStatsProps> = ({
  years_of_experience,
  publications_count,
  courses_taught,
  application_count,
  is_verified,
  is_seller,
  seller_status,
  verification_status,
  location,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {years_of_experience !== undefined && (
        <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-800 text-sm font-medium">
          <span>🦷</span>
          <span>{years_of_experience} yrs exp</span>
        </div>
      )}
      {location && (
        <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-800 text-sm font-medium">
          <span>📍</span>
          <span>{location}</span>
        </div>
      )}
      {publications_count !== undefined && (
        <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full text-purple-800 text-sm font-medium">
          <span>📄</span>
          <span>{publications_count} publications</span>
        </div>
      )}
      {courses_taught !== undefined && (
        <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full text-orange-800 text-sm font-medium">
          <span>🎓</span>
          <span>{courses_taught} courses</span>
        </div>
      )}
      {application_count !== undefined && (
        <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-gray-800 text-sm font-medium">
          <span>📝</span>
          <span>{application_count} applications</span>
        </div>
      )}
      {/* Verified tag removed as per new design. Verified tick now shown next to name in header. */}
      {is_seller && (
        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full text-yellow-900 text-sm font-medium">
          <span>🛒</span>
          <span>Seller{seller_status ? ` (${seller_status})` : ''}</span>
        </div>
      )}
      {/* Removed verification status tag as per new design. */}
    </div>
  );
};

export default ProfileMetaStats;
