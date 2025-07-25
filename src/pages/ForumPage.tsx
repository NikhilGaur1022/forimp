import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MessageSquare, Plus, ChevronRight, MessageCircle, ThumbsUp, X, Users, ChevronLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import Card from '../components/common/Card';
import PageContainer from "../components/common/PageContainer";
import SectionHeading from '../components/common/SectionHeading';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import LoginModal from '../components/common/LoginModal'; // Add this import
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Thread {
  id: string;
  title: string;
  author_id: string;
  category: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
}

const ITEMS_PER_PAGE = 10; // Show 10 threads per page

const ForumPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Add login modal state
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replyCounts, setReplyCounts] = useState<{ [threadId: string]: number }>({});
  const [likeCounts, setLikeCounts] = useState<{ [threadId: string]: number }>({});
  const [authorNames, setAuthorNames] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filtering, setFiltering] = useState(false); // for optional spinner
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'mostReplies' | 'mostLiked'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Define categories array (was missing in original)
  const categories = [
    { name: 'Clinical Cases' },
    { name: 'Practice Management' },
    { name: 'Dental Technology' },
    { name: 'Student Corner' },
    { name: 'Product Discussion' },
    { name: 'Career Development' }
  ];

  // Compute unique categories from fetched threads
  const threadCategories = Array.from(new Set(threads.map(t => t.category))).sort();

  // Filtering logic (client-side)
  const filteredThreads = threads.filter(thread => {
    const matchesCategory = selectedCategory === 'All' || thread.category === selectedCategory;
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting logic for threads
  function getSortedThreads(threads: Thread[]) {
    if (sortOption === 'newest') {
      return [...threads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'oldest') {
      return [...threads].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === 'mostReplies') {
      return [...threads].sort((a, b) => (replyCounts[b.id] || 0) - (replyCounts[a.id] || 0));
    } else if (sortOption === 'mostLiked') {
      return [...threads].sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0));
    }
    return threads;
  }

  // Optional: show spinner for a short time when filtering
  useEffect(() => {
    if (loading) return;
    setFiltering(true);
    const timeout = setTimeout(() => setFiltering(false), 200); // 200ms fake spinner
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, loading]);

  useEffect(() => {
    document.title = 'Forum | DentalReach';
    fetchAll();
    
    // Check URL parameters for pre-filled discussion (for "Discuss" button from articles)
    const urlParams = new URLSearchParams(location.search);
    const shouldShowNewDiscussion = urlParams.get('new_discussion');
    const prefilledTitle = urlParams.get('title');
    const prefilledContent = urlParams.get('content');
    
    if (shouldShowNewDiscussion === 'true') {
      if (!user) {
        setShowLoginModal(true);
      } else {
        setNewDiscussion({
          title: prefilledTitle || '',
          content: prefilledContent || '',
          category: 'Clinical Cases'
        });
        setShowNewDiscussionModal(true);
      }
      
      // Clean up URL
      navigate('/forum', { replace: true });
    }
  }, [location.search, user, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get total count
      const { count } = await supabase
        .from('threads')
        .select('*', { count: 'exact', head: true });
        
      setTotalCount(count || 0);

      // Fetch threads with pagination
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (threadsError) {
        setError('Failed to load discussions.');
        setThreads([]);
        setLoading(false);
        return;
      }

      setThreads(threadsData || []);

      // Fetch all posts for reply counts and like counts
      const threadIds = (threadsData || []).map((t: Thread) => t.id);
      let postsData: any[] = [];
      if (threadIds.length > 0) {
        const { data: posts } = await supabase
          .from('posts')
          .select('id,thread_id,author_id,parent_id,created_at')
          .in('thread_id', threadIds);
        postsData = posts || [];
      }

      // Count replies per thread
      const replyCountMap: { [threadId: string]: number } = {};
      postsData.forEach(post => {
        replyCountMap[post.thread_id] = (replyCountMap[post.thread_id] || 0) + 1;
      });
      setReplyCounts(replyCountMap);

      // Count likes for all posts in each thread
      let likeCountMap: { [threadId: string]: number } = {};
      const allPostIds = postsData.map(p => p.id);
      if (allPostIds.length > 0) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id,is_like')
          .in('post_id', allPostIds);
        // Aggregate likes per thread
        (threadsData || []).forEach((thread: Thread) => {
          const postIdsForThread = postsData.filter(p => p.thread_id === thread.id).map(p => p.id);
          likeCountMap[thread.id] = (likes || []).filter(l => postIdsForThread.includes(l.post_id) && l.is_like).length;
        });
      }
      setLikeCounts(likeCountMap);

      // Fetch author names from profiles
      const authorIds = Array.from(new Set((threadsData || []).map((t: Thread) => t.author_id)));
      let authorNameMap: { [userId: string]: string } = {};
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id,full_name')
          .in('id', authorIds);
        (profiles || []).forEach((profile: Profile) => {
          authorNameMap[profile.id] = profile.full_name || 'Unknown';
        });
      }
      setAuthorNames(authorNameMap);
    } catch (error) {
      console.error('Error fetching forum data:', error);
      setError('Failed to load discussions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [currentPage]); // Refetch when page changes

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  // Helper for relative time
  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // Enhanced click handler for "Start Discussion" button
  const handleNewDiscussionClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowNewDiscussionModal(true);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    // If there were URL parameters for a new discussion, show the modal
    const urlParams = new URLSearchParams(location.search);
    const shouldShowNewDiscussion = urlParams.get('new_discussion');
    
    if (shouldShowNewDiscussion === 'true') {
      const prefilledTitle = urlParams.get('title');
      const prefilledContent = urlParams.get('content');
      
      setNewDiscussion({
        title: prefilledTitle || '',
        content: prefilledContent || '',
        category: 'Clinical Cases'
      });
      setShowNewDiscussionModal(true);
      navigate('/forum', { replace: true });
    } else {
      // Just show the new discussion modal
      setShowNewDiscussionModal(true);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const { title, category } = newDiscussion;
      
      // Insert the thread
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .insert([{
          title,
          category,
          author_id: user.id
        }])
        .select()
        .single();

      if (threadError) throw threadError;

      // If there's content, create the first post
      if (newDiscussion.content.trim()) {
        const { error: postError } = await supabase
          .from('posts')
          .insert([{
            thread_id: threadData.id,
            author_id: user.id,
            content: newDiscussion.content.trim(),
            parent_id: null
          }]);

        if (postError) {
          console.error('Failed to create initial post:', postError);
          // Continue anyway, thread was created
        }
      }

      setShowNewDiscussionModal(false);
      setNewDiscussion({ title: '', content: '', category: '' });
      
      // Refresh the discussions
      await fetchAll();
      
    } catch (err) {
      console.error('Error creating discussion:', err);
      setError('Failed to create discussion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16 font-inter">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dental-600 to-dental-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Dental Community Forum
              </h1>
              <p className="text-xl text-dental-100 mb-8">
                Connect with dental professionals worldwide. Share experiences, ask questions, and grow together
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setSelectedCategory('Clinical Cases')}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <span>Clinical Cases</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('Practice Management')}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>Practice Tips</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <Users className="h-16 w-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-4 text-white">Join the Discussion</h3>
                <p className="text-dental-100 mb-6">
                  Connect with thousands of dental professionals sharing knowledge
                </p>
                <button
                  onClick={handleNewDiscussionClick}
                  className="inline-flex items-center px-6 py-3 bg-white text-dental-600 rounded-lg hover:bg-dental-50 transition-colors font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Start Discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search discussions, topics, questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <PageContainer className="py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Categories (now used for filtering) */}
          <div className="lg:w-1/4">
            <Card className="border border-neutral-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full flex items-center px-2 py-2 rounded-xl transition-colors gap-3 font-medium ${selectedCategory === 'All' ? 'bg-dental-50 text-dental-600' : 'hover:bg-neutral-50 text-neutral-700'}`}
                  >
                    <span className="text-dental-600 flex-shrink-0 w-5 text-left"><MessageSquare className="h-5 w-5" /></span>
                    <span className="flex-grow min-w-0 text-left">All</span>
                  </button>
                  {threadCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center px-2 py-2 rounded-xl transition-colors gap-3 font-medium ${selectedCategory === category ? 'bg-dental-50 text-dental-600' : 'hover:bg-neutral-50 text-neutral-700'}`}
                    >
                      <span className="text-dental-600 flex-shrink-0 w-5 text-left"><MessageSquare className="h-5 w-5" /></span>
                      <span className="flex-grow min-w-0 text-left">{category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Discussions */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <SectionHeading title="Discussions" />
                <div className="flex items-center">
                  <label className="mr-2 text-sm text-neutral-600">Sort by:</label>
                  <select
                    className="border border-neutral-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-dental-500"
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as any)}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="mostReplies">Most Replies</option>
                    <option value="mostLiked">Most Liked</option>
                  </select>
                </div>
              </div>
              {loading || filtering ? (
                <LoadingSpinner text="Loading discussions..." />
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <div className="space-y-6">
                  {filteredThreads.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-neutral-100">
                      <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No discussions found</h3>
                      <p className="text-neutral-600 mb-4">
                        {searchQuery || selectedCategory !== 'All' 
                          ? 'Try adjusting your search or filters'
                          : 'Be the first to start a discussion!'
                        }
                      </p>
                      <button
                        onClick={handleNewDiscussionClick}
                        className="btn-primary inline-flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Discussion
                      </button>
                    </div>
                  )}
                  {getSortedThreads(filteredThreads)
                    .map((thread) => (
                      <Link key={thread.id} to={`/forum/thread/${thread.id}`} className="block">
                        <Card className="hover:shadow-lg transition-all duration-200 ease-in-out border border-neutral-100 p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{thread.title}</h3>
                              <div className="flex items-center text-sm text-neutral-500 mb-2 gap-2 flex-wrap">
                                <span className="mr-2">By {authorNames[thread.author_id] || 'Unknown'}</span>
                                <span>• {timeAgo(thread.created_at)}</span>
                                <span className="flex items-center gap-1 ml-2"><MessageCircle className="h-4 w-4" /> {replyCounts[thread.id] || 0} replies</span>
                                <span className="flex items-center gap-1 ml-2"><ThumbsUp className="h-4 w-4" /> {likeCounts[thread.id] || 0} likes</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xs font-medium text-dental-600 bg-dental-50 px-2.5 py-1 rounded-full">
                                {thread.category}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Add pagination controls before closing div */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === page
                  ? 'bg-dental-600 text-white border-dental-600'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* New Discussion Modal */}
      {showNewDiscussionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl transition-all duration-200">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Start a New Discussion</h3>
              <button 
                onClick={() => setShowNewDiscussionModal(false)} // FIXED: was calling (true)
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateDiscussion} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200"
                  required
                  placeholder="What would you like to discuss?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={newDiscussion.category}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200 ease-in-out focus:border-dental-500 hover:border-dental-600"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category, idx) => (
                    <option key={idx} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Content (Optional)
                </label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 min-h-[120px] transition-colors duration-200"
                  placeholder="Share your thoughts, ask questions, or start a conversation..."
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewDiscussionModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        redirectPath={window.location.pathname + window.location.search}
      />
    </div>
  );
};

export default ForumPage;