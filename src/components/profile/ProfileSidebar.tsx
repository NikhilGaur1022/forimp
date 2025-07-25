import React from 'react';

const ProfileSidebar: React.FC = () => (
  <aside className="hidden lg:block col-span-3">
    <div className="sticky top-32">
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h3 className="font-bold text-lg text-blue-900 mb-5 tracking-wide flex items-center gap-2">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-blue-500"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z" fill="currentColor"/></svg>
          My Dashboard
        </h3>
        <ul className="space-y-2">
          <li><a href="/my-articles" className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 transition font-medium"><span>📝</span> My Articles</a></li>
          <li><a href="/saved-items" className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 transition font-medium"><span>🔖</span> Saved Items</a></li>
          <li><a href="/my-discussions" className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 transition font-medium"><span>💬</span> My Discussions</a></li>
          <li><a href="/dashboard/job-listings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 transition font-medium"><span>📋</span> My Job Listings</a></li>
          <li><a href="/dashboard/job-applications" className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 transition font-medium"><span>📨</span> My Job Applications</a></li>
        </ul>
      </div>
    </div>
  </aside>
);

export default ProfileSidebar;
