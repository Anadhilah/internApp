import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Save, Upload, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Education } from '../types';
import { useForm } from 'react-hook-form';

interface EducationFormProps {
  onAdd: (education: Education) => void;
  onCancel: () => void;
  defaultValues?: Education;
  isEdit?: boolean;
}

const EducationForm: React.FC<EducationFormProps> = ({ onAdd, onCancel, defaultValues, isEdit = false }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<Education>({
    defaultValues: defaultValues || {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: undefined
    }
  });

  const isCurrent = watch('current');

  const onSubmit = (data: Education) => {
    if (data.current) {
      data.endDate = undefined;
    }
    onAdd(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Education' : 'Add Education'}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
            Institution *
          </label>
          <input
            id="institution"
            {...register('institution', { required: 'Institution is required' })}
            className={`w-full px-3 py-2 border ${errors.institution ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution.message}</p>}
        </div>

        <div>
          <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
            Degree *
          </label>
          <input
            id="degree"
            {...register('degree', { required: 'Degree is required' })}
            className={`w-full px-3 py-2 border ${errors.degree ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.degree && <p className="mt-1 text-sm text-red-600">{errors.degree.message}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-1">
          Field of Study *
        </label>
        <input
          id="field"
          {...register('field', { required: 'Field of study is required' })}
          className={`w-full px-3 py-2 border ${errors.field ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
        />
        {errors.field && <p className="mt-1 text-sm text-red-600">{errors.field.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
            className={`w-full px-3 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date {!isCurrent && '*'}
          </label>
          <input
            id="endDate"
            type="date"
            disabled={isCurrent}
            {...register('endDate', { 
              required: isCurrent ? false : 'End date is required' 
            })}
            className={`w-full px-3 py-2 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${isCurrent ? 'bg-gray-100' : ''}`}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="flex items-center mb-4">
        <input
          id="current"
          type="checkbox"
          {...register('current')}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="current" className="ml-2 block text-sm text-gray-700">
          I am currently studying here
        </label>
      </div>

      <div className="mb-6">
        <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-1">
          GPA (optional)
        </label>
        <input
          id="gpa"
          type="number"
          step="0.01"
          min="0"
          max="4.0"
          {...register('gpa', { 
            min: { value: 0, message: 'GPA must be positive' }, 
            max: { value: 4.0, message: 'GPA cannot exceed 4.0' },
            valueAsNumber: true
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.gpa && <p className="mt-1 text-sm text-red-600">{errors.gpa.message}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isEdit ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<{ index: number; education: Education } | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePic(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleAddEducation = (education: Education) => {
    if (editingEducation !== null) {
      const updatedEducation = [...educationList];
      updatedEducation[editingEducation.index] = education;
      setEducationList(updatedEducation);
      setEditingEducation(null);
    } else {
      setEducationList([...educationList, education]);
    }
    setShowEducationForm(false);
  };

  const handleEditEducation = (index: number) => {
    setEditingEducation({ index, education: educationList[index] });
    setShowEducationForm(true);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success message
    setSuccessMessage('Profile saved successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    
    setIsSaving(false);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Complete your profile to help find the perfect internship match.</p>
        </div>
        
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center"
          >
            <div className="mr-3 flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center mb-6">
              <div className="mb-4 sm:mb-0 sm:mr-6 relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 uppercase font-bold text-4xl">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <label htmlFor="profile-pic" className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    id="profile-pic" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePicChange}
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell employers about yourself, your career goals, and what you're looking for in an internship..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Skills */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full flex items-center">
                    <span>{skill}</span>
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleAddSkill} className="flex">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
          
          {/* Interests */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Interests</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {interests.map((interest, index) => (
                  <div key={index} className="bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center">
                    <span>{interest}</span>
                    <button 
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-2 text-green-500 hover:text-green-700 focus:outline-none"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleAddInterest} className="flex">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Education Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Education</h3>
              {!showEducationForm && (
                <button
                  onClick={() => {
                    setShowEducationForm(true);
                    setEditingEducation(null);
                  }}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 focus:outline-none"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  <span>Add Education</span>
                </button>
              )}
            </div>
            
            {showEducationForm && (
              <EducationForm 
                onAdd={handleAddEducation} 
                onCancel={() => {
                  setShowEducationForm(false);
                  setEditingEducation(null);
                }}
                defaultValues={editingEducation?.education}
                isEdit={!!editingEducation}
              />
            )}
            
            {educationList.length === 0 && !showEducationForm ? (
              <div className="text-center py-8 text-gray-500">
                <p>No education entries yet. Add your educational background to help find matching internships.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {educationList.map((education, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{education.institution}</h4>
                        <p className="text-gray-600">{education.degree} in {education.field}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(education.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - {' '}
                          {education.current 
                            ? 'Present' 
                            : education.endDate 
                              ? new Date(education.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
                              : ''}
                        </p>
                        {education.gpa && (
                          <p className="text-sm text-gray-600 mt-1">GPA: {education.gpa}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEducation(index)}
                          className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveEducation(index)}
                          className="text-red-600 hover:text-red-800 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Resume Upload */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Resume</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                {resumeFile ? `Selected: ${resumeFile.name}` : 'Drag and drop your resume here, or click to select a file'}
              </p>
              <p className="text-xs text-gray-500 mb-4">PDF, DOCX, or RTF up to 5MB</p>
              <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                {resumeFile ? 'Replace Resume' : 'Upload Resume'}
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.rtf"
                  onChange={handleResumeChange}
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;