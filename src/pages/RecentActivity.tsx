import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Heart, ThumbsUp, FileText, BarChart2 } from 'lucide-react';

function formatElapsedTime(dateString: string) {
  const now = new Date();
  const then = new Date(dateString);
  const diff = (now.getTime() - then.getTime()) / 1000; // seconds
  if (diff < 60) return Math.floor(diff) + ' seconds ago';
  const minutes = diff / 60;
  if (minutes < 60) return Math.floor(minutes) + ' minutes ago';
  const hours = minutes / 60;
  if (hours < 24) return Math.floor(hours) + ' hours ago';
  const days = hours / 24;
  return Math.floor(days) + ' days ago';
}

const RecentActivity = ({ userId }: { userId: string }) => {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const fetchRecentActivity = async () => {
      const activity: any[] = [];
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      const { data: comments } = await supabase
        .from('posts')
        .select('id, content, thread_id, created_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      const { data: threads } = await supabase
        .from('threads')
        .select('id, title, created_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(2);
      const { data: likes } = await supabase
        .from('article_likes')
        .select('id, article_id, created_at, articles (title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      if (articles) activity.push(...articles.map(a => ({ type: 'article', text: `You published "${a.title}"`, time: a.created_at })));
      if (comments) activity.push(...comments.map(c => ({ type: 'comment', text: `You commented: "${c.content.slice(0, 40)}${c.content.length > 40 ? '...' : ''}"`, time: c.created_at })));
      if (threads) activity.push(...threads.map(t => ({ type: 'discussion', text: `You started a discussion: "${t.title}"`, time: t.created_at })));
      if (likes) activity.push(...likes.map(l => {
        const title = Array.isArray(l.articles) && l.articles.length > 0 ? l.articles[0].title : l.articles?.title || 'an article';
        return { type: 'like', text: `You liked "${title}"`, time: l.created_at };
      }));
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activity.slice(0, 5));
      setLoading(false);
    };
    fetchRecentActivity();
  }, [userId]);

  if (loading) return <div className="bg-white rounded-xl shadow p-6 text-center text-neutral-500">Loading recent activity...</div>;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
      {recentActivity.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center text-neutral-500">
          No recent activity. Start by publishing an article or joining a discussion!
        </div>
      ) : (
        <div className="space-y-2">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50">
              <div className="mt-1">
                {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-dental-500" />}
                {activity.type === 'like' && <Heart className="h-4 w-4 text-dental-500" />}
                {activity.type === 'thread_like' && <ThumbsUp className="h-4 w-4 text-dental-600" />}
                {activity.type === 'article' && <FileText className="h-4 w-4 text-dental-500" />}
                {activity.type === 'discussion' && <BarChart2 className="h-4 w-4 text-dental-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-700">{activity.text}</p>
                <p className="text-xs text-neutral-500 mt-1">{formatElapsedTime(activity.time)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentActivity;
