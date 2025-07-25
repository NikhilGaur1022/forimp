import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, ArrowLeft, Share2 } from 'lucide-react';
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
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { user } = useAuth();

  // Mock additional images for demo
  const productImages = [
    product?.image_url,
    product?.image_url,
    product?.image_url,
    product?.image_url
  ].filter(Boolean);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('admin_approved', true)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
      document.title = `${data.name} | DentalReach`;
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    if (!product) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .eq('admin_approved', true)
        .eq('is_active', true)
        .neq('id', product.id)
        .limit(4);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const addToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    if (!product) return;

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
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart')
          .insert({ user_id: user.id, product_id: product.id, quantity });
        
        if (error) throw error;
      }

      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }

    if (!product) return;

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: product.id });
      
      if (error) {
        if (error.code === '23505') {
          alert('Item already in wishlist');
        } else {
          throw error;
        }
      } else {
        alert('Added to wishlist successfully!');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600"></div>
            <span className="ml-3 text-neutral-600">Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Product Not Found</h2>
            <p className="text-neutral-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/products">
              <PrimaryButton>Browse Products</PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link to="/products" className="flex items-center text-dental-600 hover:text-dental-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
          <span className="mx-2 text-neutral-400">/</span>
          <span className="text-neutral-600">{product.category}</span>
          <span className="mx-2 text-neutral-400">/</span>
          <span className="text-neutral-900 font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-4">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white rounded-lg border-2 overflow-hidden ${
                    selectedImage === index ? 'border-dental-600' : 'border-neutral-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
              <div className="mb-4">
                <span className="text-sm text-dental-600 font-medium">{product.category}</span>
                <h1 className="text-3xl font-bold text-neutral-900 mt-2 mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-600 ml-2">(4.8) 124 reviews</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">${product.price.toLocaleString()}</span>
                <div className="text-sm text-neutral-600 mt-1">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600">✓ {product.stock_quantity} in stock</span>
                  ) : (
                    <span className="text-red-600">✗ Out of stock</span>
                  )}
                </div>
              </div>

              <p className="text-neutral-700 mb-6 leading-relaxed">{product.description}</p>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-dental-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-neutral-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-neutral-600">
                    Total: ${(product.price * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-6">
                <PrimaryButton
                  onClick={addToCart}
                  disabled={product.stock_quantity === 0}
                  className="w-full flex items-center justify-center"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </PrimaryButton>
                
                <div className="grid grid-cols-2 gap-4">
                  <SecondaryButton
                    onClick={addToWishlist}
                    className="flex items-center justify-center"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </SecondaryButton>
                  <SecondaryButton className="flex items-center justify-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </SecondaryButton>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border-t border-neutral-200 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Truck className="h-4 w-4 mr-2 text-dental-600" />
                    Free shipping on orders over $500
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <Shield className="h-4 w-4 mr-2 text-dental-600" />
                    1 year warranty included
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <RotateCcw className="h-4 w-4 mr-2 text-dental-600" />
                    30-day return policy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/products/${relatedProduct.id}`}>
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <img
                      src={relatedProduct.image_url}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-dental-600 font-bold">
                        ${relatedProduct.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
