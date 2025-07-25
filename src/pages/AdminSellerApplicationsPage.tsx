import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Mail, Phone, Building, Calendar, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

interface SellerApplication {
  id: number;
  user_id: string;
  business_name: string;
  business_type: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  tax_id?: string;
  business_license?: string;
  identity_document?: string;
  bank_account_details?: string;
  experience_years?: number;
  product_categories?: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

const AdminSellerApplications = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching seller applications...');

      // Fetch applications with separate queries to avoid foreign key issues
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('seller_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Get unique user IDs
      const userIds = [...new Set(applicationsData.map(app => app.user_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const applicationsWithProfiles = applicationsData.map(app => ({
        ...app,
        profiles: profilesData.find(profile => profile.id === app.user_id) || null
      }));

      console.log('Applications with profiles:', applicationsWithProfiles);
      setApplications(applicationsWithProfiles);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED UPDATE FUNCTION
  const updateApplicationStatus = async (applicationId: number, status: 'approved' | 'rejected', notes: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      console.log('Updating application:', { applicationId, status, notes, userId: application.user_id });

      // ✅ Step 1: Update seller_applications table
      const { error: appError } = await supabase
        .from('seller_applications')
        .update({ 
          status, 
          admin_notes: notes 
        })
        .eq('id', applicationId);

      if (appError) {
        console.error('Error updating application:', appError);
        throw appError;
      }

      console.log('Application status updated successfully');

      // ✅ Step 2: Update profiles table based on status
      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_seller: true,
            seller_status: 'approved'
          })
          .eq('id', application.user_id);

        if (profileError) {
          console.error('Error updating profile for approval:', profileError);
          throw profileError;
        }

        console.log('Profile updated for approval');
      } else if (status === 'rejected') {
        // ✅ Get current application count first
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('application_count')
          .eq('id', application.user_id)
          .single();

        const currentCount = currentProfile?.application_count || 0;
        
        // ✅ Update profile with incremented count
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_seller: false,
            seller_status: 'rejected',
            application_count: currentCount + 1,
            last_rejection_date: new Date().toISOString()
          })
          .eq('id', application.user_id);

        if (profileError) {
          console.error('Error updating profile for rejection:', profileError);
          throw profileError;
        }

        console.log(`Updated application_count from ${currentCount} to ${currentCount + 1}`);
      }

      // ✅ Step 3: Create notification with correct type
      const notificationData = {
        user_id: application.user_id,
        type: status === 'approved' ? 'application_approved' as const : 'application_rejected' as const,
        message: status === 'approved' 
          ? `Congratulations! Your seller application for "${application.business_name}" has been approved. You can now start selling products on our platform.`
          : `Your seller application for "${application.business_name}" has been rejected. Reason: ${notes}`,
        reason: status === 'rejected' ? notes : null,
        read: false
      };

      console.log('Creating notification with data:', notificationData);

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't throw here, notification is not critical
      } else {
        console.log('Notification created successfully');
      }

      fetchApplications();
      setSelectedApplication(null);
      setAdminNotes('');
      
      showToast(
        `Application ${status} successfully!`, 
        status === 'approved' ? 'success' : 'info'
      );
    } catch (error) {
      console.error('Error updating application:', error);
      showToast(
        'Failed to update application: ' + (error instanceof Error ? error.message : 'Unknown error'),
        'error'
      );
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-600"></div>
            <span className="ml-3 text-neutral-600">Loading applications...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Applications</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Seller Applications</h1>
          <p className="text-neutral-600">Review and manage seller applications</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <strong>Debug:</strong> Found {applications.length} applications
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="flex border-b border-neutral-200">
            {[
              { key: 'all', label: 'All Applications', count: applications.length },
              { key: 'pending', label: 'Pending', count: applications.filter(app => app.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: applications.filter(app => app.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: applications.filter(app => app.status === 'rejected').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  filter === tab.key
                    ? 'border-dental-600 text-dental-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No applications found</h3>
              <p className="text-neutral-600">
                {applications.length === 0 
                  ? 'No seller applications have been submitted yet.' 
                  : 'No seller applications match the current filter'
                }
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 mr-3">
                          {application.business_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          <span>{application.business_type}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{application.profiles?.email || application.business_email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{application.business_phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="flex items-center px-4 py-2 text-sm text-dental-600 hover:text-dental-700 font-medium"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {application.product_categories?.map((category, index) => (
                      <span key={index} className="px-2 py-1 bg-dental-50 text-dental-700 rounded-full text-xs">
                        {category}
                      </span>
                    )) || <span className="text-neutral-500 text-sm">No categories specified</span>}
                  </div>

                  {application.admin_notes && (
                    <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-700 mb-1">Admin Notes:</p>
                      <p className="text-sm text-neutral-600">{application.admin_notes}</p>
                    </div>
                  )}

                  {application.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                      <SecondaryButton
                        onClick={() => {
                          setSelectedApplication(application);
                          setAdminNotes('');
                        }}
                        className="flex items-center text-sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </SecondaryButton>
                      <PrimaryButton
                        onClick={() => updateApplicationStatus(application.id, 'approved', 'Application approved by admin')}
                        className="flex items-center text-sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </PrimaryButton>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Business Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Business Name</label>
                    <p className="text-neutral-900">{selectedApplication.business_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Business Type</label>
                    <p className="text-neutral-900">{selectedApplication.business_type}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Business Address</label>
                    <p className="text-neutral-900">{selectedApplication.business_address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Business Phone</label>
                    <p className="text-neutral-900">{selectedApplication.business_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Business Email</label>
                    <p className="text-neutral-900">{selectedApplication.business_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Tax ID</label>
                    <p className="text-neutral-900">{selectedApplication.tax_id || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Experience (Years)</label>
                    <p className="text-neutral-900">{selectedApplication.experience_years}</p>
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Product Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.product_categories?.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-dental-50 text-dental-700 rounded-full text-sm">
                      {category}
                    </span>
                  )) || <span className="text-neutral-500">No categories specified</span>}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedApplication.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Admin Notes (Rejection Reason)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
                    placeholder="Add notes for this application (required for rejection)..."
                  />
                </div>
              )}

              {selectedApplication.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Previous Admin Notes</label>
                  <p className="text-neutral-900 bg-neutral-50 p-3 rounded-lg">{selectedApplication.admin_notes}</p>
                </div>
              )}
            </div>

            {selectedApplication.status === 'pending' && (
              <div className="flex justify-end gap-3 p-6 border-t border-neutral-200">
                <SecondaryButton
                  onClick={() => {
                    if (!adminNotes.trim()) {
                      showToast('Please provide a reason for rejection', 'error');
                      return;
                    }
                    updateApplicationStatus(selectedApplication.id, 'rejected', adminNotes);
                  }}
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </SecondaryButton>
                <PrimaryButton
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'approved', adminNotes || 'Application approved by admin')}
                  className="flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellerApplications;
