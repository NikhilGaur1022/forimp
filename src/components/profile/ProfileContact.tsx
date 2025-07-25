import React from 'react';
import { formatPhoneForDisplay } from './phoneFormatUtil';

interface ProfileContactProps {
  email?: string;
  website_url?: string;
  phone?: string;
}

const ProfileContact: React.FC<ProfileContactProps> = ({ email, website_url, phone }) => (
  <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg border border-purple-100 p-6 mb-8">
    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-purple-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>
      Contact Information
    </h3>
    <div className="space-y-3">
      {email && (
        <div className="flex items-center gap-3 text-gray-700">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 text-purple-600">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" fillOpacity=".12"/><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 4h16v16H4V4zm8 7l8-5H4l8 5zm0 2l-8-5v10h16V8l-8 5z" fill="currentColor"/></svg>
          </span>
          <span className="break-all">{email}</span>
        </div>
      )}
      {phone && (
        <div className="flex items-center gap-3 text-gray-700">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 text-purple-600">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" fill="currentColor"/></svg>
          </span>
          <span>{formatPhoneForDisplay(phone)}</span>
        </div>
      )}
      {website_url && (
        <div className="flex items-center gap-3 text-gray-700">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 text-purple-600">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-10a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" fill="currentColor"/></svg>
          </span>
          <a 
            href={website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 font-semibold shadow-sm hover:bg-purple-200 hover:text-purple-900 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            Personal Website
          </a>
        </div>
      )}
    </div>
  </div>
);

export default ProfileContact;
