import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, CalendarClock, DollarSign, Globe, X, CheckCircle, Loader, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/database';
import { useRealTimeJobListings, useRealTimeApplications } from '../hooks/useRealTimeData';
import ChatWindow from '../components/chat/ChatWindow';

const InternshipsPage: React.FC = () => {
  const { user } = useAuth();
  const { jobListings: internships, loading: jobListingsLoading } = useRealTimeJobListings();
  const { applications: userApplications } = useRealTimeApplications();
  const [filteredInternships, setFilteredInternships] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    remote: false,
    paid: false,
    location: '',
    skills: [] as string[],
  });
  const [appliedInternships, setAppliedInternships] = useState<string[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<any>(null);

  // Transform job listings to internship format
  useEffect(() => {
    if (internships && internships.length > 0) {
      // Transform database format to component format
      const transformedInternships = internships.map(job => ({
        id: job.id,
        companyName: job.employer_profiles?.company_name || 'Company',
        position: job.title,
        location: job.location,
        description: job.description,
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        applicationDeadline: job.application_deadline,
        duration: job.duration || 'Flexible',
        paid: job.is_paid,
        remote: job.job_type === 'remote',
        skills: Array.isArray(job.skills_required) ? job.skills_required : [],
        logo: job.employer_profiles?.logo_url,
        stipend: job.stipend
      }));
      
      setFilteredInternships(transformedInternships);
    } else {
      setFilteredInternships([]);
    }
  }, [internships]);

  // Update applied internships from user applications
  useEffect(() => {
    if (userApplications && userApplications.length > 0) {
      const appliedIds = userApplications.map(app => app.job_id || app.internshipId);
      setAppliedInternships(appliedIds);
    } else {
      setAppliedInternships([]);
    }
  }, [userApplications]);

  // Get all unique skills from all internships
  const allSkills = Array.from(
    new Set((internships || []).flatMap(internship => internship.skills_required || []))
  ).sort();

  // Get all unique locations
  const allLocations = Array.from(
    new Set((internships || []).map(internship => internship.location))
  ).sort();

  useEffect(() => {
    let results = internships || [];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        internship =>
          internship.title?.toLowerCase().includes(query) ||
          internship.employer_profiles?.company_name?.toLowerCase().includes(query) ||
          internship.description.toLowerCase().includes(query) ||
          (internship.skills_required || []).some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.remote) {
      results = results.filter(internship => internship.job_type === 'remote');
    }
    
    if (filters.paid) {
      results = results.filter(internship => internship.is_paid);
    }
    
    if (filters.location) {
      results = results.filter(internship => 
        internship.location.toLowerCase() === filters.location.toLowerCase()
      );
    }
    
    if (filters.skills.length > 0) {
      results = results.filter(internship =>
        filters.skills.some(skill => (internship.skills_required || []).includes(skill))
      );
    }

    setFilteredInternships(results);
  }, [searchQuery, filters, internships]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFilters(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      
      return { ...prev, skills };
    });
  };

  const clearFilters = () => {
    setFilters({
      remote: false,
      paid: false,
      location: '',
      skills: [],
    });
    setSearchQuery('');
  };

  const handleApply = async (internship: any) => {
    if (!user || user.role !== 'intern') {
      alert('Please sign in as an intern to apply for internships.');
      return;
    }

    setIsApplying(true);
    
    try {
      await applicationService.createApplication({
        intern_id: user.id,
        job_id: internship.id,
        status: 'applied',
        cover_letter: 'Application submitted through InternLink platform.'
      });
      
      setAppliedInternships(prev => [...prev, internship.id]);
      setSelectedInternship(null);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to internship:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleStartChat = (internship: any) => {
    const recipient = {
      id: `org_${internship.id}`,
      name: internship.companyName,
      role: 'organization' as const,
      online: Math.random() > 0.5, // Random online status for demo
      lastSeen: '2 hours ago'
    };
    setChatRecipient(recipient);
    setShowChat(true);
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

  if (jobListingsLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-lg text-gray-600">Loading internships...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Internships</h1>
            <p className="text-gray-600 mt-1">Discover opportunities that match your skills and interests</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search positions, companies, skills..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-3 flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="h-5 w-5 mr-2 text-gray-500" />
              Filters
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-lg shadow-md mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button 
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Job Type Filters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Job Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.remote}
                      onChange={e => handleFilterChange('remote', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remote Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.paid}
                      onChange={e => handleFilterChange('paid', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Paid Only</span>
                  </label>
                </div>
              </div>
              
              {/* Location Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
                <select
                  value={filters.location}
                  onChange={e => handleFilterChange('location', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Locations</option>
                  {allLocations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Skills Filter */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        filters.skills.includes(skill)
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredInternships.length} of {(internships || []).length} internships
          </p>
          
          {(filters.remote || filters.paid || filters.location || filters.skills.length > 0 || searchQuery) && (
            <button 
              onClick={clearFilters}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </button>
          )}
        </div>
        
        {/* Active Filters */}
        {(filters.remote || filters.paid || filters.location || filters.skills.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.remote && (
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                Remote
                <button 
                  onClick={() => handleFilterChange('remote', false)}
                  className="ml-1 text-indigo-500 hover:text-indigo-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.paid && (
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Paid
                <button 
                  onClick={() => handleFilterChange('paid', false)}
                  className="ml-1 text-indigo-500 hover:text-indigo-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.location && (
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {filters.location}
                <button 
                  onClick={() => handleFilterChange('location', '')}
                  className="ml-1 text-indigo-500 hover:text-indigo-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.skills.map(skill => (
              <div key={skill} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                {skill}
                <button 
                  onClick={() => handleSkillToggle(skill)}
                  className="ml-1 text-indigo-500 hover:text-indigo-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Internship Listings */}
        {filteredInternships.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn't find any internships matching your criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredInternships.map(internship => (
              <motion.div
                key={internship.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="h-32 bg-gray-200 relative">
                  {internship.logo ? (
                    <img 
                      src={internship.logo} 
                      alt={internship.companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700">
                      <span className="text-xl font-bold">{internship.companyName?.charAt(0) || 'C'}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white font-semibold">{internship.companyName || 'Company'}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{internship.position}</h2>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm">{internship.location}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{internship.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(internship.skills || []).slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                    {(internship.skills || []).length > 3 && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        +{(internship.skills || []).length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-5">
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      <span>{internship.duration || 'Flexible'}</span>
                    </div>
                    <div className={`flex items-center ${internship.paid ? 'text-green-600' : 'text-gray-600'}`}>
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{internship.paid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                    <div className={`flex items-center ${internship.remote ? 'text-indigo-600' : 'text-gray-600'}`}>
                      <Globe className="h-4 w-4 mr-1" />
                      <span>{internship.remote ? 'Remote' : 'On-site'}</span>
                    </div>
                  </div>
                  
                  {appliedInternships.includes(internship.id) ? (
                    <div className="flex items-center justify-center py-2 px-4 border border-green-500 text-green-700 bg-green-50 rounded-md">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Applied
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedInternship(internship)}
                        className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View & Apply
                      </button>
                      <button
                        onClick={() => handleStartChat(internship)}
                        className="w-full py-2 px-4 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Internship Detail Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="h-48 bg-gray-200 relative">
              {selectedInternship.logo ? (
                <img 
                  src={selectedInternship.logo} 
                  alt={selectedInternship.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700">
                  <span className="text-4xl font-bold">{selectedInternship.companyName?.charAt(0) || 'C'}</span>
                </div>
              )}
              <button 
                onClick={() => setSelectedInternship(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedInternship.position}</h2>
                  <div className="flex items-center mt-1">
                    <span className="text-lg text-gray-700">{selectedInternship.companyName || 'Company'}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{selectedInternship.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedInternship.paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedInternship.paid ? 'Paid' : 'Unpaid'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedInternship.remote ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedInternship.remote ? 'Remote' : 'On-site'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="font-medium">{selectedInternship.duration || 'Flexible'}</p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Application Deadline</p>
                  <p className="font-medium">
                    {selectedInternship.applicationDeadline 
                      ? new Date(selectedInternship.applicationDeadline).toLocaleDateString()
                      : 'Open'
                    }
                  </p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Stipend</p>
                  <p className="font-medium">{selectedInternship.stipend || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 mb-4">{selectedInternship.description}</p>
                
                {selectedInternship.requirements && selectedInternship.requirements.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                    <ul className="list-disc pl-5 text-gray-700 mb-4">
                      {selectedInternship.requirements.map((req: string, index: number) => (
                        <li key={index} className="mb-1">{req}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(selectedInternship.skills || []).map((skill: string, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedInternship(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
                
                {appliedInternships.includes(selectedInternship.id) ? (
                  <div className="flex items-center justify-center py-2 px-4 border border-green-500 text-green-700 bg-green-50 rounded-md shadow-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Applied
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleStartChat(selectedInternship)}
                      className="px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </button>
                    <button
                      onClick={() => handleApply(selectedInternship)}
                      disabled={isApplying || !user || user.role !== 'intern'}
                      className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 flex items-center"
                    >
                      {isApplying ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Applying...
                        </>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
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

export default InternshipsPage;