import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ProfileHeader from '../components/profile/ProfileHeader';
import ReputationBadge from '../components/profile/ReputationBadge';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileAbout from '../components/profile/ProfileAbout';
import RecentActivity from './RecentActivity';
import ProfileContact from '../components/profile/ProfileContact';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileQuickStats from '../components/profile/ProfileQuickStats';
import ProfileResearchInterests from '../components/profile/ProfileResearchInterests';
import ProfileArticles from '../components/profile/ProfileArticles';
import ProfileAchievements from '../components/profile/ProfileAchievements';
import ProfileCourses from '../components/profile/ProfileCourses';
import ProfileEducation from '../components/profile/ProfileEducation';
import ProfileMetaStats from '../components/profile/ProfileMetaStats';
import ProfileReviewForm from '../components/profile/ProfileReviewForm';
import ProfileReviewsList from '../components/profile/ProfileReviewsList';
import { useHasReviewed } from '../components/profile/useHasReviewed';

/**
 * Unified Profile Page
 * - Used for /profile, /dashboard, /professors/:id
 * - Shows edit controls and sidebar for own profile
 * - Shows public view for others
 */
const ProfileUnifiedPage = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isOwnProfile = !paramId || paramId === user?.id;
  const profileId = isOwnProfile ? user?.id : paramId;
  const hasReviewed = useHasReviewed(profileId, user?.id);

  // Profile data state
  const [profile, setProfile] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [discussionsCount, setDiscussionsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [threads, setThreads] = useState<any[]>([]);
  const [achievementsCount, setAchievementsCount] = useState(0);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    // Fetch profile and related data, including composite reputation
    Promise.all([
      supabase.from('profiles').select('*').eq('id', profileId).single(),
      supabase.from('profile_composite_reputation').select('*').eq('profile_id', profileId).single(),
      supabase.from('articles').select('*').eq('user_id', profileId).eq('is_approved', true).order('created_at', { ascending: false }),
      supabase.from('professor_achievements').select('*').eq('user_id', profileId),
      supabase.from('courses').select('*').eq('user_id', profileId),
      supabase.from('threads').select('id, title, category, created_at').eq('author_id', profileId),
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', profileId),
      supabase.from('professor_achievements').select('id', { count: 'exact', head: true }).eq('user_id', profileId),
    ]).then(([
      profileRes, repRes, articlesRes, achievementsRes, coursesRes,
      discussionsRes, commentsRes, achievementsCountRes
    ]) => {
      if (profileRes.error) setError('Profile not found');
      setProfile(profileRes.data);
      setStats(repRes?.data || {});
      setArticles(articlesRes.data || []);
      setAchievements(achievementsRes.data || []);
      setCourses(coursesRes.data || []);
      setThreads(discussionsRes.data || []);
      setDiscussionsCount((discussionsRes.data || []).length);
      setCommentsCount(commentsRes?.count || 0);
      setAchievementsCount(achievementsCountRes?.count || 0);
      setLoading(false);
    });
  }, [profileId, showEdit]);

  // Save profile edits
  const handleSaveProfile = async (data: any) => {
    // Normalize research_interests and certifications for Postgres array
    let research_interests = data.research_interests;
    if (Array.isArray(research_interests)) {
      if (research_interests.length === 0 || (research_interests.length === 1 && !research_interests[0])) {
        research_interests = null;
      }
    } else if (!research_interests) {
      research_interests = null;
    }

    let certifications = data.certifications;
    if (Array.isArray(certifications)) {
      if (certifications.length === 0 || (certifications.length === 1 && !certifications[0])) {
        certifications = null;
      }
    } else if (!certifications) {
      certifications = null;
    }

    const { error } = await supabase.from('profiles').upsert({
      ...data,
      id: profileId,
      research_interests,
      certifications,
    });
    if (error) throw new Error(error.message);
    setProfile({ ...data, research_interests, certifications });
  };

  if (loading) return <div className="pt-20 text-center">Loading profile...</div>;
  if (error || !profile) return <div className="pt-20 text-center text-red-600">{error || 'Profile not found'}</div>;

  return (
    <div className="min-h-screen bg-neutral-50 font-inter">
      {showEdit && (
        <ProfileEditModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-9">
          <ProfileHeader
            profile={{
              ...profile,
              reputationBadge:
                typeof stats?.reputation === 'number' ? (
                  <span className="inline-block align-middle ml-2"><ReputationBadge reputation={stats.reputation} /></span>
                ) : null,
            }}
            isOwnProfile={isOwnProfile}
            onEdit={() => setShowEdit(true)}
          />
          <ProfileMetaStats
            years_of_experience={profile.years_of_experience}
            publications_count={profile.publications_count}
            courses_taught={profile.courses_taught}
            application_count={profile.application_count}
            is_verified={profile.is_verified}
            is_seller={profile.is_seller}
            seller_status={profile.seller_status}
            verification_status={profile.verification_status}
            location={profile.location}
          />
          {isOwnProfile && (
            <ProfileQuickStats
              articlesCount={articles.length}
              discussionsCount={discussionsCount}
              commentsCount={commentsCount}
              achievementsCount={achievementsCount}
            />
          )}
          {/* Recent Activity Section (replaces My Discussions) */}
          {isOwnProfile && profileId && (
            <RecentActivity userId={profileId} />
          )}

          {/* Review Section: Only show for public profile (not own) and if not already reviewed */}
          {!isOwnProfile && profileId && user?.id && user?.id !== profileId && !hasReviewed && (
            <div className="mb-8">
              <ProfileReviewForm profileId={profileId} raterId={user.id} />
            </div>
          )}
          {/* Reviews List: Show for all profiles */}
          {profileId && (
            <div className="mb-8">
              <ProfileReviewsList profileId={profileId} />
            </div>
          )}

          <ProfileAbout bio={profile.bio} />
          <ProfileEducation education={profile.education} certifications={profile.certifications} />
          <ProfileResearchInterests interests={profile.research_interests} label="Professional Interests" />
          <ProfileArticles articles={articles} profileId={profileId!} />
          <ProfileCourses courses={courses} />
          <ProfileAchievements achievements={achievements} />
        </div>
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {isOwnProfile && <ProfileSidebar />}
          <ProfileContact email={profile.email} website_url={profile.website_url} phone={profile.phone} />
        </div>
      </div>
    </div>
  );
};

export default ProfileUnifiedPage;