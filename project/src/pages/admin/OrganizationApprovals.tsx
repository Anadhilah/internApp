import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  Mail, 
  Phone, 
  Globe,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { organizationApprovalService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

interface OrganizationApproval {
  id: string;
  company_name: string;
  company_description: string;
  industry: string;
  website: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  users?: {
    name: string;
    email: string;
    created_at: string;
  };
}

const OrganizationApprovals: React.FC = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<OrganizationApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<OrganizationApproval | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await organizationApprovalService.getPendingApprovals();
      setApprovals(data || []);
    } catch (error) {
      console.error('Error loading approvals:', error);
      // Mock data for demonstration
      setApprovals([
        {
          id: '1',
          company_name: 'TechStartup Inc.',
          company_description: 'A cutting-edge technology startup focused on AI and machine learning solutions.',
          industry: 'Technology',
          website: 'https://techstartup.com',
          contact_name: 'John Smith',
          contact_email: 'john@techstartup.com',
          contact_phone: '+1 (555) 123-4567',
          status: 'pending',
          submitted_at: new Date().toISOString(),
          users: {
            name: 'John Smith',
            email: 'john@techstartup.com',
            created_at: new Date().toISOString()
          }
        },
        {
          id: '2',
          company_name: 'Green Energy Solutions',
          company_description: 'Leading provider of renewable energy solutions for businesses and homes.',
          industry: 'Energy',
          website: 'https://greenenergy.com',
          contact_name: 'Sarah Johnson',
          contact_email: 'sarah@greenenergy.com',
          contact_phone: '+1 (555) 987-6543',
          status: 'pending',
          submitted_at: new Date(Date.now() - 86400000).toISOString(),
          users: {
            name: 'Sarah Johnson',
            email: 'sarah@greenenergy.com',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (approval: OrganizationApproval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setModalAction(action);
    setShowModal(true);
    setNotes('');
  };

  const confirmAction = async () => {
    if (!selectedApproval || !modalAction || !user) return;

    setActionLoading(selectedApproval.id);
    try {
      if (modalAction === 'approve') {
        await organizationApprovalService.approveOrganization(
          selectedApproval.id,
          user.id,
          notes || 'Organization approved by admin'
        );
      } else {
        await organizationApprovalService.rejectOrganization(
          selectedApproval.id,
          user.id,
          notes || 'Organization rejected by admin'
        );
      }

      // Remove from list
      setApprovals(prev => prev.filter(a => a.id !== selectedApproval.id));
      setShowModal(false);
      setSelectedApproval(null);
      setModalAction(null);
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="h-8 w-8 text-purple-600 mr-3" />
                Organization Approvals
              </h1>
              <p className="text-gray-600 mt-1">Review and approve organization registrations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {approvals.length} Pending
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {approvals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-600">No pending organization approvals at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {approvals.map((approval, index) => (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {approval.company_name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Submitted {new Date(approval.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Pending Review
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">Industry:</span>
                      <span className="ml-1 font-medium text-gray-900">{approval.industry}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">Contact:</span>
                      <span className="ml-1 font-medium text-gray-900">{approval.contact_name}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-1 font-medium text-gray-900">{approval.contact_email}</span>
                    </div>

                    {approval.contact_phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-1 font-medium text-gray-900">{approval.contact_phone}</span>
                      </div>
                    )}

                    {approval.website && (
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">Website:</span>
                        <a 
                          href={approval.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 font-medium text-purple-600 hover:text-purple-700"
                        >
                          {approval.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {approval.company_description && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Company Description</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {approval.company_description}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAction(approval, 'approve')}
                      disabled={actionLoading === approval.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(approval, 'reject')}
                      disabled={actionLoading === approval.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              {modalAction === 'approve' ? (
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 mr-3" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {modalAction === 'approve' ? 'Approve' : 'Reject'} Organization
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to {modalAction} <strong>{selectedApproval.company_name}</strong>?
            </p>

            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                {modalAction === 'approve' ? 'Approval Notes (optional)' : 'Rejection Reason'}
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder={modalAction === 'approve' 
                  ? 'Add any notes for the approval...' 
                  : 'Please provide a reason for rejection...'
                }
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading === selectedApproval.id}
                className={`flex-1 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 ${
                  modalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {actionLoading === selectedApproval.id ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  `${modalAction === 'approve' ? 'Approve' : 'Reject'} Organization`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrganizationApprovals;