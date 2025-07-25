import { useEffect, useState, Suspense, lazy } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Search, Clock, ChevronRight, ChevronLeft, Filter, BookOpen, TrendingUp, FileText } from 'lucide-react';
import YearDropdown from '../components/articles/YearDropdown';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import PageContainer from '../components/common/PageContainer';
import { supabase } from '../lib/supabase';
import type { Article } from '../lib/supabase';
import SidebarTransition from '../components/common/SidebarTransition';
const ArticleCard = lazy(() => import('../components/articles/ArticleCard'));
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Clinical Dentistry',
  'Dental Technology',
  'Practice Management',
  'Dental Education',
  'Dental Research',
  'Community Dentistry'
];

const ITEMS_PER_PAGE = 9; // Show 9 articles per page (3x3 grid)

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // Fetch articles from Supabase with pagination
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        
        // First, get the total count
        const { count } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', true);
          
        setTotalCount(count || 0);

        // Then fetch the current page
        const { data, error: fetchError } = await supabase
          .from('articles')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

        if (fetchError) throw fetchError;
        setArticles(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage]);

  // Extract years from articles
  const years = Array.from(new Set(articles.map(a => new Date(a.created_at).getFullYear()))).sort((a, b) => b - a);

  // Filter articles based on category, search query, and year
  const filteredArticles = articles.filter(article => {
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !selectedYear || new Date(article.created_at).getFullYear() === selectedYear;
    return matchesCategory && matchesSearch && matchesYear;
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  // Add this pagination helper function
  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Always show first page
        i === totalPages || // Always show last page
        (i >= currentPage - delta && i <= currentPage + delta) // Show pages around current page
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          // If there's just one number between, show it
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          // If there's more than one number between, show dots
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  useEffect(() => {
    document.title = 'Articles | DentalReach';
  }, []);

  return (
    <div className="pb-16 font-inter bg-neutral-50 min-h-screen">
      <SidebarTransition open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Journals nav button styled and placed full height right side like canalstreet.market */}
      <div className="fixed top-0 right-0 h-full z-40 flex flex-col items-center justify-center group">
        <button
          onClick={() => setSidebarOpen(true)}
          className="main-navigation__tab js-navigation-tab h-full rounded-none font-bold text-white text-lg flex flex-col items-center justify-center shadow-lg p-0 w-12"
          style={{ backgroundColor: 'rgb(94, 163, 236)', transition: 'background 0.3s, width 0.4s cubic-bezier(0.77,0,0.175,1)', transform: 'matrix(1,0,0,1,0,0)' }}
          data-page="journals"
          data-transition="tab"
          onMouseEnter={e => { e.currentTarget.style.width = '96px'; }}
          onMouseLeave={e => { e.currentTarget.style.width = '48px'; }}
        >
          <div className="flex flex-col items-center justify-center h-full w-full transition-all duration-400">
            <span className="text-lg font-semibold tracking-wide rotate-[-90deg] m-0 p-0">Journals</span>
          </div>
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dental-600 to-dental-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Dental Articles & Research
              </h1>
              <p className="text-xl text-dental-100 mb-8">
                Discover the latest insights, research, and techniques in dentistry from experts around the world
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setSelectedCategory('Clinical Dentistry')}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span>Clinical Articles</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('Dental Research')}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>Research Papers</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <FileText className="h-16 w-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-4 text-white">Submit Your Article</h3>
                <p className="text-dental-100 mb-6">
                  Share your knowledge and research with the dental community
                </p>
                <Link
                  to="/submit-article"
                  className="inline-flex items-center px-6 py-3 bg-white text-dental-600 rounded-lg hover:bg-dental-50 transition-colors font-semibold"
                >
                  Submit Article
                </Link>
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
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for articles, research papers, techniques..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <PageContainer>
        <section className="py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters - Mobile */}
            <div className="md:hidden mb-6">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-neutral-200 shadow-md"
              >
                <span className="font-medium flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter Articles
                </span>
                <ChevronRight className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
              </button>
              {showFilters && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-neutral-200 shadow-md">
                  <h3 className="font-semibold text-lg mb-3">Categories</h3>
                  <div className="space-y-2">
                    <SecondaryButton
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm w-full text-left ${selectedCategory === null ? 'bg-dental-100 text-dental-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      All Categories
                    </SecondaryButton>
                    {CATEGORIES.map(category => (
                      <SecondaryButton
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm ${selectedCategory === category ? 'bg-dental-100 text-dental-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'}`}
                      >
                        {category}
                      </SecondaryButton>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Filters - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    <SecondaryButton
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm w-full text-left ${selectedCategory === null ? 'bg-dental-100 text-dental-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      All Categories
                    </SecondaryButton>
                    {CATEGORIES.map(category => (
                      <SecondaryButton
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm ${selectedCategory === category ? 'bg-dental-100 text-dental-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'}`}
                      >
                        {category}
                      </SecondaryButton>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <LoadingSpinner text="Loading articles..." />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <div className="text-red-600 text-lg font-medium">{error}</div>
                </div>
              ) : (
                <>
                  {/* Search and Year Dropdown */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      />
                      <Search className="absolute right-3 top-3 h-5 w-5 text-neutral-400" />
                    </div>
                    <YearDropdown
                      years={years}
                      selectedYear={selectedYear}
                      onChange={setSelectedYear}
                    />
                  </div>
                  {/* Articles List */}
                  <Suspense fallback={<LoadingSpinner text="Loading articles..." />}>
                    {filteredArticles.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-neutral-100">
                        <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No articles found</h3>
                        <p className="text-neutral-600 mb-4">
                          {searchQuery || selectedCategory || selectedYear
                            ? 'Try adjusting your search or filters'
                            : 'Be the first to submit an article!'}
                        </p>
                        <Link to="/submission" className="btn-primary inline-flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Submit Article
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                          {filteredArticles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="mt-8 flex justify-center items-center space-x-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            {getPageNumbers(currentPage, totalPages).map((page, index) => (
                              page === '...' ? (
                                <span key={`dots-${index}`} className="px-4 py-2">
                                  {page}
                                </span>
                              ) : (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page as number)}
                                  className={`px-4 py-2 rounded-lg border ${
                                    currentPage === page
                                      ? 'bg-dental-600 text-white border-dental-600'
                                      : 'border-neutral-200 hover:bg-neutral-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              )
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
                      </>
                    )}
                  </Suspense>
                </>
              )}
            </div>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}

export default ArticlesPage;