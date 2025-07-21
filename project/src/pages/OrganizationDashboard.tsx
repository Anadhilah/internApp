import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Briefcase, Calendar, TrendingUp, Eye, Edit, Trash2, MapPin, Clock, DollarSign, Globe, Loader, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobListingService, applicationService } from '../services/database';
import { useRealTimeApplications } from '../hooks/useRealTimeData';
import ChatWindow from '../components/chat/ChatWindow';

const OrganizationDashboard: React.FC = () => {
  const { user } = useAuth();
  const { applications: dbApplications, refetch: refetchApplications } = useRealTimeApplications();
  const [activeTab, setActiveTab] = useState<'overview' | 'internships' | 'applications' | 'post'>('overview');
  const [postedInternships, setPostedInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<any>(null);
  
  const [newInternship, setNewInternship] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    duration: '',
    stipend: '',
    is_paid: true,
    job_type: 'in-person' as 'remote' | 'in-person' | 'hybrid',
    skills_required: '',
    application_deadline: '',
  });

  // Load organization's job listings with real-time updates
  useEffect(() => {
    const loadJobListings = async () => {
      if (user && user.role === 'organization') {
        setLoading(true);
        try {
          const jobListings = await jobListingService.getJobListingsByEmployer(user.id);
          setPostedInternships(jobListings);
          
          // Subscribe to real-time updates for this employer's jobs
          const unsubscribe = jobListingService.subscribeToJobListings((payload) => {
            if (payload.new?.employer_id === user.id) {
              if (payload.eventType === 'INSERT') {
                setPostedInternships(prev => [payload.new, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setPostedInternships(prev => 
                  prev.map(job => job.id === payload.new.id ? payload.new : job)
                );
              } else if (payload.eventType === 'DELETE') {
                setPostedInternships(prev => 
                  prev.filter(job => job.id !== payload.old.id)
                );
              }
            }
          });
          
          return unsubscribe;
        } catch (error) {
          console.error('Error loading job listings:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadJobListings();
  }, [user]);

  // Update applications from real-time hook
  useEffect(() => {
    setApplications(dbApplications || []);
  }, [dbApplications]);

  const stats = [
    { 
      label: 'Active Internships', 
      value: postedInternships.filter(job => job.status === 'active').length, 
      icon: <Briefcase className="h-6 w-6" />, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Total Applications', 
      value: applications.length, 
      icon: <Users className="h-6 w-6" />, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Pending Reviews', 
      value: applications.filter(app => app.status === 'applied' || app.status === 'reviewing').length, 
      icon: <Clock className="h-6 w-6" />, 
      color: 'bg-yellow-500' 
    },
    { 
      label: 'Accepted This Month', 
      value: applications.filter(app => app.status === 'accepted').length, 
      icon: <TrendingUp className="h-6 w-6" />, 
      color: 'bg-purple-500' 
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNewInternship(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePostInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'organization') {
      alert('You must be logged in as an organization to post internships.');
      return;
    }

    setSubmitting(true);
    
    try {
      const jobData = {
        employer_id: user.id,
        title: newInternship.title,
        description: newInternship.description,
        requirements: newInternship.requirements.split(',').map(r => r.trim()),
        skills_required: newInternship.skills_required.split(',').map(s => s.trim()),
        location: newInternship.location,
        job_type: newInternship.job_type,
        duration: newInternship.duration,
        stipend: newInternship.stipend,
        is_paid: newInternship.is_paid,
        application_deadline: newInternship.application_deadline || null,
        status: 'active' as const
      };

      const newJob = await jobListingService.createJobListing(jobData);
      setPostedInternships(prev => [newJob, ...prev]);
      
      // Trigger applications refetch
      refetchApplications();
      
      // Reset form
      setNewInternship({
        title: '',
        description: '',
        requirements: '',
        location: '',
        duration: '',
        stipend: '',
        is_paid: true,
        job_type: 'in-person',
        skills_required: '',
        application_deadline: '',
      });
      
      setActiveTab('internships');
      alert('Internship posted successfully!');
    } catch (error) {
      console.error('Error posting internship:', error);
      alert('Failed to post internship. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChat = (applicant: any) => {
    const recipient = {
      id: `intern_${applicant.id}`,
      name: applicant.name || 'Student',
      role: 'intern' as const,
      online: Math.random() > 0.5, // Random online status for demo
      lastSeen: '1 hour ago'
    };
    setChatRecipient(recipient);
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-lg text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organization') {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please sign in as an organization to access the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}! Manage your internship postings and applications</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-5 w-5" /> },
              { id: 'internships', label: 'My Internships', icon: <Briefcase className="h-5 w-5" /> },
              { id: 'applications', label: 'Applications', icon: <Users className="h-5 w-5" /> },
              { id: 'post', label: 'Post New', icon: <Plus className="h-5 w-5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white rounded-lg shadow-md p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Welcome Message */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to InternLink!</h2>
              <p className="text-gray-600 mb-6">
                Start by posting your first internship opportunity to connect with talented students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('post')}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition duration-300 flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Post Your First Internship
                </button>
                <button
                  onClick={() => handleStartChat({ id: 'demo', name: 'Demo Student' })}
                  className="border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition duration-300 flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Start a Conversation
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Internships Tab */}
        {activeTab === 'internships' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Internships</h2>
              <button
                onClick={() => setActiveTab('post')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition duration-300 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post New Internship
              </button>
            </div>

            {postedInternships.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No internships posted yet</h3>
                <p className="text-gray-600 mb-4">Start by posting your first internship opportunity.</p>
                <button
                  onClick={() => setActiveTab('post')}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition duration-300"
                >
                  Post Your First Internship
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postedInternships.map((internship) => (
                  <motion.div
                    key={internship.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{internship.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          internship.status === 'active' ? 'bg-green-100 text-green-800' :
                          internship.status === 'closed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {internship.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{internship.location}</span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{internship.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{internship.duration || 'Flexible'}</span>
                        </div>
                        <div className={`flex items-center ${internship.is_paid ? 'text-green-600' : 'text-gray-600'}`}>
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>{internship.is_paid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {internship.application_deadline 
                            ? `Due: ${new Date(internship.application_deadline).toLocaleDateString()}`
                            : 'Open application'
                          }
                        </span>
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications</h2>
            
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">Applications will appear here once students start applying to your internships.</p>
            </div>
          </motion.div>
        )}

        {/* Post New Internship Tab */}
        {activeTab === 'post' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Post New Internship</h2>
              
              <form onSubmit={handlePostInternship} className="bg-white rounded-lg shadow-md p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Position Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newInternship.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Frontend Developer Intern"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={newInternship.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={newInternship.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Describe the role, responsibilities, and what the intern will learn..."
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements (comma-separated) *
                  </label>
                  <input
                    type="text"
                    id="requirements"
                    name="requirements"
                    value={newInternship.requirements}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., JavaScript experience, React knowledge, HTML/CSS proficiency"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="skills_required" className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills (comma-separated) *
                  </label>
                  <input
                    type="text"
                    id="skills_required"
                    name="skills_required"
                    value={newInternship.skills_required}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., JavaScript, React, HTML/CSS, Git"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Work Type *
                    </label>
                    <select
                      id="job_type"
                      name="job_type"
                      value={newInternship.job_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="in-person">In-person</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={newInternship.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select duration</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="12 months">12 months</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      id="application_deadline"
                      name="application_deadline"
                      value={newInternship.application_deadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="stipend" className="block text-sm font-medium text-gray-700 mb-2">
                    Stipend (optional)
                  </label>
                  <input
                    type="text"
                    id="stipend"
                    name="stipend"
                    value={newInternship.stipend}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., $1000/month"
                  />
                </div>

                <div className="flex items-center mb-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_paid"
                      checked={newInternship.is_paid}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">This is a paid position</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('internships')}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-300 disabled:opacity-70 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </>
                    ) : (
                      'Post Internship'
                    )}
                  </button>
                </div>
              </form>
            </div>
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

export default OrganizationDashboard;