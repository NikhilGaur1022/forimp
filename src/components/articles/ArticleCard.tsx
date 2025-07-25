import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';

interface ArticleCardProps {
  article: any;
}

const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article }) => (
  <Link
    to={`/articles/${article.id}`}
    className="block bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
  >
    {article.image_url && (
      <img
        src={article.image_url}
        alt={article.title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
    )}
    <div className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 bg-dental-50 text-dental-700 rounded-full text-xs font-medium">
          {article.category}
        </span>
        <span className="flex items-center text-neutral-500 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(article.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-2 line-clamp-2">{article.title}</h3>
      <p className="text-neutral-600 line-clamp-3">{article.excerpt}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-neutral-500">By {article.author}</span>
        <span className="text-dental-600 font-medium flex items-center">
          Read more
          <ChevronRight className="h-4 w-4 ml-1" />
        </span>
      </div>
    </div>
  </Link>
));

export default ArticleCard;
