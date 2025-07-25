import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Building, Phone, Mail, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SellerApplicationPage = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    taxId: '',
    bankAccountDetails: '',
    experienceYears: '',
    productCategories: []
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['Orthodontics', 'Equipment', 'Dental Care', 'Surgery', 'Cosmetic', 'Instruments'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('seller_applications')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          business_address: formData.businessAddress,
          business_phone: formData.businessPhone,
          business_email: formData.businessEmail,
          tax_id: formData.taxId,
          bank_account_details: formData.bankAccountDetails,
          experience_years: parseInt(formData.experienceYears),
          product_categories: formData.productCategories
        });

      if (error) throw error;

      // Update profile to show seller application pending
      await supabase
        .from('profiles')
        .update({ 
          seller_status: 'pending',
          seller_applied_at: new Date().toISOString()
        })
        .eq('id', user.id);

      alert('Application submitted successfully! We will review it and get back to you.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-gradient-to-r from-dental-600 to-dental-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Become a Seller</h1>
            <p className="text-dental-100 mt-2">Join our marketplace and start selling your dental products</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Business Information */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-dental-600" />
                Business Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                    <option value="clinic">Dental Clinic</option>
                    <option value="individual">Individual Professional</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-dental-600" />
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.businessPhone}
                    onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({...formData, businessEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-dental-600" />
                Business Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tax ID / Business Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Product Categories *
              </h2>
              <p className="text-sm text-neutral-600 mb-4">Select the categories of products you plan to sell</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.productCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-dental-600 focus:ring-dental-500 border-neutral-300 rounded"
                    />
                    <span className="ml-2 text-sm text-neutral-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-dental-600" />
                Bank Account Details
              </h2>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Bank Account Information *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Please provide your bank account details for payments"
                  value={formData.bankAccountDetails}
                  onChange={(e) => setFormData({...formData, bankAccountDetails: e.target.value})}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-neutral-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-dental-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-dental-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
              <p className="text-sm text-neutral-600 text-center mt-4">
                Your application will be reviewed by our team. You'll receive an email notification once it's processed.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerApplicationPage;
