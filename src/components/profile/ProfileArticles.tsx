import React from 'react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  created_at: string;
  views_count?: number;
  category?: string;
  image_url?: string;
  images?: string[];
}

interface ProfileArticlesProps {
  articles: Article[];
  profileId: string;
}

const ProfileArticles: React.FC<ProfileArticlesProps> = ({ articles, profileId }) => {
  if (!articles || articles.length === 0) return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Publications</h2>
      <p className="text-gray-500 italic">No published articles yet.</p>
    </section>
  );
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Publications</h2>
        {articles.length > 3 && (
          <a
            href={`/professors/${profileId}/articles`}
            className="text-dental-600 hover:text-dental-700 font-semibold"
          >
            View All
          </a>
        )}
      </div>
      <div className="space-y-4">
        {articles.slice(0, 3).map((article) => (
          <a
            key={article.id}
            href={`/articles/${article.id}`}
            className="block bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              {((article.images && article.images.length > 0) || article.image_url) && (
                <img
                  src={article.images && article.images.length > 0 ? article.images[0] : article.image_url}
                  alt={article.title}
                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  <span>{article.views_count || 0} views</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{article.category}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ProfileArticles;
