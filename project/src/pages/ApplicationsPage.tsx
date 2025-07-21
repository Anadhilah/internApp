import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, RotateCcw, CheckCircle, XCircle, Clock, ChevronDown, MapPin, Calendar, ExternalLink, Loader, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealTimeApplications } from '../hooks/useRealTimeData';
import { applicationService } from '../services/database';
import ChatWindow from '../components/chat/ChatWindow';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let icon = <Clock className="h-4 w-4 mr-1" />;

  if (status === 'accepted') {
    colorClass = 'bg-green-100 text-green-800';
    icon = <CheckCircle className="h-4 w-4 mr-1" />;
  } else if (status === 'rejected') {
    colorClass = 'bg-red-100 text-red-800';
    icon = <XCircle className="h-4 w-4 mr-1" />;
  } else if (status === 'pending' || status === 'applied') {
    colorClass = 'bg-yellow-100 text-yellow-800';
    icon = <Clock className="h-4 w-4 mr-1" />;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
      {icon}
      {status === 'applied' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.3
    }
  }
};

const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const { applications: dbApplications, loading, refetch } = useRealTimeApplications();
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<any>(null);

  // Transform database applications to component format
  useEffect(() => {
    if (dbApplications && dbApplications.length > 0) {
      // Transform database format to component format
      const transformedApplications = dbApplications.map(app => ({
        id: app.id,
        userId: app.intern_id,
        internshipId: app.job_id,
        internship: {
          id: app.job_listings?.id || app.job_id,
          companyName: app.job_listings?.employer_profiles?.company_name || 'Company',
          position: app.job_listings?.title || 'Position',
          location: app.job_listings?.location || 'Location',
          description: app.job_listings?.description || '',
          duration: app.job_listings?.duration || 'Flexible',
          paid: app.job_listings?.is_paid || false,
          remote: app.job_listings?.job_type === 'remote',
          skills: Array.isArray(app.job_listings?.skills_required) ? app.job_listings.skills_required : [],
          logo: app.job_listings?.employer_profiles?.logo_url
        },
        status: app.status === 'applied' ? 'pending' : app.status,
        appliedDate: app.applied_at,
        notes: app.notes || ''
      }));
      
      setApplications(transformedApplications);
    } else if (!loading) {
      // Fallback to mock data if no real applications and not loading
      import('../data/mockData').then(({ mockApplications }) => {
        setApplications(mockApplications);
      });
    }
  }, [dbApplications, loading]);

  // Refetch applications when user changes
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const handleWithdrawApplication = async (id: string) => {
    setIsWithdrawing(id);
    
    try {
      await applicationService.deleteApplication(id);
      setApplications(applications.filter(app => app.id !== id));
      // Trigger refetch to update real-time data
      refetch();
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('Failed to withdraw application. Please try again.');
    } finally {
      setIsWithdrawing(null);
    }
  };

  const handleStartChat = (application: any) => {
    const recipient = {
      id: `org_${application.internship.id}`,
      name: application.internship.companyName,
      role: 'organization' as const,
      online: Math.random() > 0.5, // Random online status for demo
      lastSeen: '2 hours ago'
    };
    setChatRecipient(recipient);
    setShowChat(true);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedApplicationId(expandedApplicationId === id ? null : id);
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    const appStatus = app.status === 'applied' ? 'pending' : app.status;
    return appStatus === filter;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending' || app.status === 'applied').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-lg text-gray-600">Loading applications...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'intern') {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please sign in as an intern to view your applications.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track and manage your internship applications</p>
        </div>
        
        {/* Application Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'All Applications', value: counts.all, color: 'bg-indigo-100 text-indigo-800', filter: 'all' },
            { label: 'Pending', value: counts.pending, color: 'bg-yellow-100 text-yellow-800', filter: 'pending' },
            { label: 'Accepted', value: counts.accepted, color: 'bg-green-100 text-green-800', filter: 'accepted' },
            { label: 'Rejected', value: counts.rejected, color: 'bg-red-100 text-red-800', filter: 'rejected' },
          ].map((stat) => (
            <motion.div
              key={stat.filter}
              className={`bg-white rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 ${filter === stat.filter ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => handleFilterChange(stat.filter)}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <h3 className="text-gray-600 text-xs font-medium">{stat.label}</h3>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <ClipboardCheck className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't applied to any internships yet."
                : `You don't have any ${filter} applications.`}
            </p>
            <a 
              href="/internships" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Internships
            </a>
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredApplications.map((application) => (
              <motion.div 
                key={application.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                variants={itemVariants}
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleToggleExpand(application.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                        {application.internship?.logo ? (
                          <img 
                            src={application.internship.logo} 
                            alt={application.internship.companyName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-700">
                            <span className="text-lg font-bold">
                              {application.internship?.companyName?.charAt(0) || 'C'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                          {application.internship?.position || 'Position Title'}
                        </h2>
                        <div className="flex items-center text-gray-600 text-sm">
                          <span className="font-medium">
                            {application.internship?.companyName || 'Company'}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{application.internship?.location || 'Location'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <StatusBadge status={application.status} />
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${expandedApplicationId === application.id ? 'rotate-180' : ''}`} 
                      />
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedApplicationId === application.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="border border-gray-200 rounded-md p-3">
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="font-medium">{application.internship?.duration || 'Not specified'}</p>
                          </div>
                          <div className="border border-gray-200 rounded-md p-3">
                            <p className="text-xs text-gray-500 mb-1">Application Status</p>
                            <StatusBadge status={application.status} />
                          </div>
                          <div className="border border-gray-200 rounded-md p-3">
                            <p className="text-xs text-gray-500 mb-1">Type</p>
                            <p className="font-medium">
                              {application.internship?.remote ? 'Remote' : 'On-site'} • {application.internship?.paid ? 'Paid' : 'Unpaid'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Position Description</h3>
                          <p className="text-gray-600 text-sm">{application.internship?.description || 'No description available'}</p>
                        </div>
                        
                        {application.internship?.skills && application.internship.skills.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {application.internship.skills.map((skill, index) => (
                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {application.notes && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                            <p className="text-gray-600 text-sm p-3 bg-gray-50 rounded-md">{application.notes}</p>
                          </div>
                        )}
                        
                        {application.status === 'accepted' && (
                          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Congratulations!</h3>
                                <div className="mt-2 text-sm text-green-700">
                                  <p>
                                    Your application has been accepted. The company will contact you shortly with next steps.
                                    Please check your email regularly for updates.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <a 
                            href={`/internships`} 
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                          >
                            <span className="mr-1">View Similar Positions</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStartChat(application)}
                              className="inline-flex items-center px-3 py-2 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </button>
                            
                            {(application.status === 'pending' || application.status === 'applied') && (
                              <button
                                onClick={() => handleWithdrawApplication(application.id)}
                                disabled={isWithdrawing === application.id}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                              >
                                {isWithdrawing === application.id ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Withdrawing...
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Withdraw Application
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Chat Window */}
      {showChat && chatRecipient && (
        <ChatWindow
          recipient={chatRecipient}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;