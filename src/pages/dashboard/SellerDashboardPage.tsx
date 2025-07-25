import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Eye, 
  Plus,
  BarChart3,
  Users,
  Star,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import PageContainer from '../../components/common/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';

interface SellerStats {
  total_revenue: number;
  monthly_revenue: number;
  total_orders: number;
  monthly_orders: number;
  total_products: number;
  active_products: number;
  total_views: number;
  monthly_views: number;
  conversion_rate: number;
  average_rating: number;
  total_reviews: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  admin_approved: boolean;
  views_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  image_url: string;
}

interface RecentOrder {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
}

interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
  views: number;
}

const SellerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    checkSellerStatus();
    fetchDashboardData();
  }, [user, timeRange]);

  const checkSellerStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_seller, seller_status')
        .eq('id', user.id)
        .single();

      if (!profile?.is_seller || profile.seller_status !== 'approved') {
        navigate('/products');
        return;
      }

      // Check if this is a new seller (no products yet)
      const { data: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('seller_id', user.id);

      if (productCount && productCount.length === 0) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error('Error checking seller status:', err);
      setError('Failed to verify seller status');
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchSellerStats(),
        fetchProducts(),
        fetchRecentOrders(),
        fetchAnalyticsData()
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSellerStats = async () => {
    const { data, error } = await supabase
      .rpc('get_seller_stats', { seller_uuid: user.id });
    
    if (error) throw error;
    setStats(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    setProducts(data || []);
  };

  const fetchRecentOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        profiles!orders_user_id_fkey(full_name)
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    const formattedOrders = data?.map(order => ({
      ...order,
      customer_name: order.profiles?.full_name || 'Unknown Customer'
    })) || [];
    
    setRecentOrders(formattedOrders);
  };

  const fetchAnalyticsData = async () => {
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    const { data, error } = await supabase
      .from('seller_analytics')
      .select('date, revenue, orders_count, views_count')
      .eq('seller_id', user.id)
      .gte('date', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    const formattedData = data?.map(item => ({
      date: item.date,
      revenue: item.revenue,
      orders: item.orders_count,
      views: item.views_count
    })) || [];
    
    setAnalyticsData(formattedData);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your dashboard...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Onboarding Modal for New Sellers
  if (showOnboarding) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="bg-gradient-to-r from-dental-600 to-dental-700 px-8 py-12 text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-dental-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Your Seller Dashboard!</h1>
              <p className="text-dental-100 text-lg">You're now an approved seller. Let's get you started with your first product.</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-dental-100 rounded-full pl-2 pr-2">
                    <span className="text-dental-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 ">Add Your First Product</h3>
                    <p className="text-neutral-600 text-sm">Create a compelling product listing with high-quality images and detailed descriptions.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-dental-100 rounded-full pl-2 pr-2">
                    <span className="text-dental-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Set Competitive Pricing</h3>
                    <p className="text-neutral-600 text-sm">Research market prices and set competitive rates for your dental products.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-dental-100 rounded-full pl-2 pr-2">
                    <span className="text-dental-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Start Selling</h3>
                    <p className="text-neutral-600 text-sm">Once approved, your products will be visible to thousands of dental professionals.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-4">
                <PrimaryButton 
                  onClick={() => navigate('/seller/products/new')}
                  className="flex flex-1 items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </PrimaryButton>
                <SecondaryButton 
                  onClick={() => setShowOnboarding(false)}
                  className="px-6"
                >
                  Skip for Now
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Seller Dashboard"
        subtitle="Manage your products, track sales, and grow your business"
      >
        <div className="flex space-x-3">
          <SecondaryButton onClick={() => navigate('/seller/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </SecondaryButton>
          <PrimaryButton onClick={() => navigate('/seller/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </PrimaryButton>
        </div>
      </PageHeader>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(stats?.total_revenue || 0)}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{((stats?.monthly_revenue || 0) / (stats?.total_revenue || 1) * 100).toFixed(1)}% this month
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Orders</p>
              <p className="text-2xl font-bold text-neutral-900">{stats?.total_orders || 0}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats?.monthly_orders || 0} this month
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Products</p>
              <p className="text-2xl font-bold text-neutral-900">{stats?.active_products || 0}</p>
              <p className="text-sm text-neutral-600 mt-1">
                of {stats?.total_products || 0} total products
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-neutral-900">{stats?.conversion_rate || 0}%</p>
              <p className="text-sm text-neutral-600 mt-1">
                {stats?.total_views || 0} total views
              </p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Your Products</h3>
                <Link 
                  to="/seller/products" 
                  className="text-dental-600 hover:text-dental-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {products.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-neutral-900 mb-2">No products yet</h4>
                  <p className="text-neutral-600 mb-6">Start selling by adding your first product to the marketplace.</p>
                  <PrimaryButton onClick={() => navigate('/seller/products/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </PrimaryButton>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="p-6 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.image_url || '/api/placeholder/60/60'}
                        alt={product.name}
                        className="w-15 h-15 rounded-lg object-cover border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-neutral-900 truncate">{product.name}</h4>
                          {!product.admin_approved && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Pending Approval
                            </span>
                          )}
                          {!product.is_active && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-neutral-600">
                          <span>{formatCurrency(product.price)}</span>
                          <span>Stock: {product.stock_quantity}</span>
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {product.views_count || 0}
                          </div>
                          {product.rating > 0 && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                              {product.rating} ({product.review_count})
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-500">
                          Added {formatDate(product.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Recent Orders</h3>
                <Link 
                  to="/seller/orders" 
                  className="text-dental-600 hover:text-dental-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600 text-sm">No orders yet</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-neutral-900 text-sm">
                        #{order.order_number}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-neutral-600">
                      <span>{order.customer_name}</span>
                      <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/seller/products/new')}
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-dental-300 hover:bg-dental-50 transition-colors"
          >
            <Plus className="h-8 w-8 text-dental-600 mr-3" />
            <div className="text-left">
              <h4 className="font-medium text-neutral-900">Add New Product</h4>
              <p className="text-sm text-neutral-600">List a new product for sale</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/seller/promotions')}
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-dental-300 hover:bg-dental-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-dental-600 mr-3" />
            <div className="text-left">
              <h4 className="font-medium text-neutral-900">Promote Products</h4>
              <p className="text-sm text-neutral-600">Boost visibility with ads</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/seller/analytics')}
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-dental-300 hover:bg-dental-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-dental-600 mr-3" />
            <div className="text-left">
              <h4 className="font-medium text-neutral-900">View Analytics</h4>
              <p className="text-sm text-neutral-600">Track your performance</p>
            </div>
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default SellerDashboardPage;
