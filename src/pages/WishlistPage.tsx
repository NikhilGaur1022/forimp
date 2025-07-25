import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock_quantity: number;
    category: string;
  };
}

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          products (
            id,
            name,
            description,
            price,
            image_url,
            stock_quantity,
            category
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedItems = data?.map(item => ({
        id: item.id,
        product: item.products
      })) || [];

      setWishlistItems(formattedItems);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: number) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlistItems(items => items.filter(item => item.id !== wishlistId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user?.id)
        .eq('product_id', productId)
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
          .insert({ user_id: user?.id, product_id: productId, quantity: 1 });
        
        if (error) throw error;
      }

      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600"></div>
            <span className="ml-3 text-neutral-600">Loading wishlist...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/products" className="flex items-center text-dental-600 hover:text-dental-700 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">My Wishlist</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
            <Heart className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-neutral-900 mb-2">Your wishlist is empty</h3>
            <p className="text-neutral-600 mb-6">Save products you love for later</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-dental-600 text-white font-medium rounded-lg hover:bg-dental-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-neutral-600">{wishlistItems.length} items in your wishlist</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="relative">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-dental-600 font-medium">{item.product.category}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
                      {item.product.name}
                    </h3>
                    
                    <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                      {item.product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-neutral-900">
                        ${item.product.price.toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.product.stock_quantity > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => addToCart(item.product.id)}
                      disabled={item.product.stock_quantity === 0}
                      className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        item.product.stock_quantity > 0
                          ? 'bg-dental-600 text-white hover:bg-dental-700'
                          : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {item.product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
