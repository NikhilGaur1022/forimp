import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Filter, Search, Grid, List, Store, Plus, TrendingUp, X, Check, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  features: string[];
  stock_quantity: number;
  seller_id: string;
  created_at: string;
  rating: number;
  review_count: number;
  is_sponsored: boolean;
  is_featured: boolean;
}

interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

interface UserProfile {
  application_count: number;
  seller_status: string;
  is_seller: boolean;
}

const ITEMS_PER_PAGE = 12; // Show 12 products per page (3x4 grid)

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [showFilters, setShowFilters] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Cart and Wishlist states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Popup states
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  // ✅ SIMPLIFIED - Only get basic auth data
  const { user } = useAuth();

  const categories = ['all', 'Orthodontics', 'Equipment', 'Dental Care', 'Surgery', 'Cosmetic', 'Instruments'];

  useEffect(() => {
    document.title = 'Products | DentalReach';
    fetchProducts();
    if (user) {
      fetchCartItems();
      fetchWishlistItems();
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy, priceRange, inStockOnly]);

  // ✅ DIRECT DATA FETCHING - No dependency on AuthContext
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('application_count, seller_status, is_seller')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      console.log('User profile fetched:', data); // Debug log
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      // First, get total count
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('admin_approved', true)
        .eq('is_active', true);

      setTotalCount(count || 0);

      // Then fetch current page
      const { data, error } = await supabase
        .from('products')
        .select('*, rating, review_count, is_sponsored, is_featured')
        .eq('admin_approved', true)
        .eq('is_active', true)
        .order('is_sponsored', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]); // Refetch when page changes

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            stock_quantity,
            description,
            category,
            features,
            seller_id,
            created_at,
            rating,
            review_count,
            is_sponsored,
            is_featured
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedItems = data?.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: item.products
      })) || [];

      setCartItems(formattedItems);
      setCartCount(formattedItems.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const fetchWishlistItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const productIds = data?.map(item => item.product_id) || [];
      setWishlistItems(productIds);
      setWishlistCount(productIds.length);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    if (inStockOnly) {
      filtered = filtered.filter(product => product.stock_quantity > 0);
    }

    filtered.sort((a, b) => {
      // Always show sponsored products first
      if (a.is_sponsored && !b.is_sponsored) return -1;
      if (!a.is_sponsored && b.is_sponsored) return 1;

      // Then featured products
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;

      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'featured':
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart')
          .insert({ user_id: user.id, product_id: product.id, quantity: 1 });

        if (error) throw error;
      }

      setAddedProduct(product);
      setShowCartPopup(true);
      fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (wishlistItems.includes(product.id)) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: product.id });

        if (error) throw error;

        setAddedProduct(product);
        setShowWishlistPopup(true);
      }

      fetchWishlistItems();
    } catch (error) {
      console.error('Error managing wishlist:', error);
    }
  };

  const getSellerActionButton = () => {
    if (!user) {
      return (
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 bg-white text-dental-600 font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
        >
          Login to Sell
        </Link>
      );
    }

    if (userProfile?.is_seller) {
      return (
        <Link
          to="/seller/dashboard"
          className="inline-flex items-center px-6 py-3 bg-white text-dental-600 font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <Store className="h-5 w-5 mr-2" />
          Seller Dashboard
        </Link>
      );
    }

    if (userProfile?.seller_status === 'pending') {
      return (
        <div className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded-lg">
          Application Pending Review
        </div>
      );
    }

    if (userProfile?.seller_status === 'rejected') {
      // ✅ USE LOCAL userProfile data
      const applicationCount = userProfile?.application_count || 0;
      const canReapply = applicationCount < 3;

      if (canReapply) {
        return (
          <div className="text-center">
            <div className="bg-red-100 text-red-800 px-6 py-3 rounded-lg mb-4">
              <div className="font-semibold">Application Rejected</div>
              <div className="text-sm mt-1">
                {applicationCount} of 3 attempts used
                {applicationCount >= 2 && (
                  <div className="flex items-center justify-center mt-2">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {applicationCount === 2 ? 'Last chance to apply' : 'Final attempt'}
                  </div>
                )}
              </div>
            </div>
            <Link
              to="/become-seller"
              className="inline-flex items-center px-6 py-3 bg-white text-dental-600 font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Reapply as Seller
            </Link>
          </div>
        );
      } else {
        return (
          <div className="bg-red-100 text-red-800 px-6 py-3 rounded-lg">
            <div className="font-semibold">Application Limit Reached</div>
            <div className="text-sm mt-1">All 3 attempts used</div>
          </div>
        );
      }
    }

    return (
      <Link
        to="/become-seller"
        className="inline-flex items-center px-6 py-3 bg-white text-dental-600 font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        Become a Seller
      </Link>
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600"></div>
            <span className="ml-3 text-neutral-600">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Cart and Wishlist Icons - Fixed Position */}
      <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => navigate('/cart')}
            className="bg-white rounded-full p-3 shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow"
          >
            <ShoppingCart className="h-6 w-6 text-dental-600" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => navigate('/wishlist')}
            className="bg-white rounded-full p-3 shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow"
          >
            <Heart className={`h-6 w-6 ${wishlistCount > 0 ? 'text-red-500 fill-current' : 'text-dental-600'}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dental-600 to-dental-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Dental Products Marketplace
              </h1>
              <p className="text-xl text-dental-100 mb-8">
                Discover premium dental products, equipment, and materials from trusted sellers worldwide
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setSortBy('newest')}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span>Latest Products</span>
                </button>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSortBy('featured');
                  }}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Star className="h-5 w-5 mr-2" />
                  <span>Verified Sellers</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <Store className="h-16 w-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-4 text-white">Start Selling Today</h3>
                <p className="text-dental-100 mb-6">
                  Join thousands of dental professionals selling on our platform
                </p>
                {getSellerActionButton()}
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
                placeholder="Search for dental products, equipment, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange({ min: 0, max: 20000 });
                    setInStockOnly(false);
                  }}
                  className="text-sm text-dental-600 hover:text-dental-700"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3">Category</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-dental-600 focus:ring-dental-500 border-neutral-300"
                      />
                      <span className="ml-3 text-sm text-neutral-700">
                        {category === 'all' ? 'All Categories' : category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3">Price Range</label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <span className="text-neutral-500">to</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 20000 })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>${priceRange.min}</span>
                    <span>${priceRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3">Quick Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 text-dental-600 focus:ring-dental-500 border-neutral-300 rounded"
                    />
                    <span className="ml-3 text-sm text-neutral-700">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-neutral-600">
                    {filteredProducts.length} products found
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent text-sm"
                  >
                    <option value="featured">Featured First</option>
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex items-center border border-neutral-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-dental-600 text-white' : 'text-neutral-600'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-dental-600 text-white' : 'text-neutral-600'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No products found</h3>
                <p className="text-neutral-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
              }>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group relative ${viewMode === 'list' ? 'flex' : ''
                    }`}>
                    {/* Sponsored Badge */}
                    {product.is_sponsored && (
                      <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Sponsored
                      </div>
                    )}

                    {/* Featured Badge */}
                    {product.is_featured && !product.is_sponsored && (
                      <div className="absolute top-2 left-2 z-10 bg-dental-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    )}

                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className={`w-full object-cover group-hover:scale-105 transition-transform duration-200 ${viewMode === 'list' ? 'h-48' : 'h-64'}`}
                        />
                      </Link>
                      <button
                        onClick={() => addToWishlist(product)}
                        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Heart className={`h-4 w-4 ${wishlistItems.includes(product.id) ? 'text-red-500 fill-current' : 'text-neutral-600'}`} />
                      </button>
                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Only {product.stock_quantity} left
                        </div>
                      )}
                      {product.stock_quantity === 0 && (
                        <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <Link to={`/products/${product.id}`} className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 hover:text-dental-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="text-sm text-dental-600 font-medium mb-2">{product.category}</div>

                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2 flex-grow">
                        {product.description}
                      </p>

                      {/* Features */}
                      {product.features && product.features.length > 0 && (
                        <div className="mb-4">
                          <ul className="text-xs text-neutral-500 space-y-1">
                            {product.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <div className="w-1 h-1 bg-dental-600 rounded-full mr-2"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-neutral-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-neutral-500 ml-2">
                          ({product.rating?.toFixed(1) || '0.0'}) {product.review_count || 0} reviews
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-2xl font-bold text-neutral-900">
                            ${product.price.toLocaleString()}
                          </span>
                          <div className="text-xs text-neutral-500">
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                          </div>
                        </div>

                        <PrimaryButton
                          onClick={() => addToCart(product)}
                          disabled={product.stock_quantity === 0}
                          className="flex items-center text-sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </PrimaryButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

      {/* Cart Added Popup */}
      {showCartPopup && addedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span className="font-semibold">Added to Cart</span>
              </div>
              <button
                onClick={() => setShowCartPopup(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center mb-4">
              <img
                src={addedProduct.image_url}
                alt={addedProduct.name}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">{addedProduct.name}</h3>
                <p className="text-dental-600 font-bold">${addedProduct.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 mb-4">
              <div className="flex justify-between text-sm text-neutral-600 mb-2">
                <span>Cart total ({cartCount} items):</span>
                <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <SecondaryButton
                onClick={() => setShowCartPopup(false)}
                className="flex-1"
              >
                Continue Shopping
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  setShowCartPopup(false);
                  navigate('/cart');
                }}
                className="flex-1"
              >
                Go to Cart
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Added Popup */}
      {showWishlistPopup && addedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-red-600">
                <Heart className="h-5 w-5 mr-2 fill-current" />
                <span className="font-semibold">Added to Wishlist</span>
              </div>
              <button
                onClick={() => setShowWishlistPopup(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center mb-4">
              <img
                src={addedProduct.image_url}
                alt={addedProduct.name}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">{addedProduct.name}</h3>
                <p className="text-dental-600 font-bold">${addedProduct.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 mb-4">
              <p className="text-sm text-neutral-600">
                You have {wishlistCount} items in your wishlist
              </p>
            </div>

            <div className="flex gap-3">
              <SecondaryButton
                onClick={() => setShowWishlistPopup(false)}
                className="flex-1"
              >
                Continue Shopping
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  setShowWishlistPopup(false);
                  navigate('/wishlist');
                }}
                className="flex-1"
              >
                View Wishlist
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
