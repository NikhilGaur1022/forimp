import React from 'react';

interface ProfileEducationProps {
  education?: string;
  certifications?: string;
}

const ProfileEducation: React.FC<ProfileEducationProps> = ({ education, certifications }) => {
  if (!education && !certifications) return null;
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Education & Certifications</h2>
      <div className="bg-green-50 rounded-lg p-6 space-y-3">
        {education && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Education</h4>
            <p className="text-gray-700">{education}</p>
          </div>
        )}
        {certifications && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Certifications</h4>
            <p className="text-gray-700">{certifications}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileEducation;
