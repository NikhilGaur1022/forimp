import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
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
            stock_quantity
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedItems = data?.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: item.products
      })) || [];

      setCartItems(formattedItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', cartId);

      if (error) throw error;

      setCartItems(items =>
        items.map(item =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (cartId: number) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

      if (error) throw error;

      setCartItems(items => items.filter(item => item.id !== cartId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600"></div>
            <span className="ml-3 text-neutral-600">Loading cart...</span>
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
          <h1 className="text-3xl font-bold text-neutral-900">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-neutral-900 mb-2">Your cart is empty</h3>
            <p className="text-neutral-600 mb-6">Add some products to get started</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-dental-600 text-white font-medium rounded-lg hover:bg-dental-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6 border-b border-neutral-200">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Cart Items ({cartItems.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-neutral-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg mr-4"
                        />
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-neutral-900 mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-dental-600 font-semibold">
                            ${item.product.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {item.product.stock_quantity > 0 
                              ? `${item.product.stock_quantity} in stock` 
                              : 'Out of stock'
                            }
                          </p>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-neutral-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-neutral-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 text-center min-w-[3rem]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-neutral-100 transition-colors"
                              disabled={item.quantity >= item.product.stock_quantity}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax</span>
                    <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-neutral-900">
                      <span>Total</span>
                      <span>${(getTotalPrice() * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-dental-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-dental-700 transition-colors mb-4">
                  Proceed to Checkout
                </button>
                
                <Link
                  to="/products"
                  className="block text-center text-dental-600 hover:text-dental-700 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
