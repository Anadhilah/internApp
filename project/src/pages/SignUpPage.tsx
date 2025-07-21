import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building2, ArrowRight } from 'lucide-react';

const SignUpPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'intern' | 'organization' | null>(null);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Join InternLink
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Choose how you'd like to get started on your professional journey
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Intern Sign Up */}
          <motion.div
            className={`bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all duration-300 ${
              selectedRole === 'intern' ? 'ring-4 ring-indigo-500 transform scale-105' : 'hover:shadow-2xl hover:transform hover:scale-102'
            }`}
            onClick={() => setSelectedRole('intern')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4 mx-auto">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">I'm a Student</h2>
              <p className="text-indigo-100 text-center">Looking for internship opportunities</p>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Browse thousands of internship opportunities</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Get matched based on your skills and interests</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Track your applications in real-time</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Build your professional network</span>
                </li>
              </ul>
              
              {selectedRole === 'intern' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to="/signup/intern"
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center"
                  >
                    Get Started as Student
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Organization Sign Up */}
          <motion.div
            className={`bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all duration-300 ${
              selectedRole === 'organization' ? 'ring-4 ring-emerald-500 transform scale-105' : 'hover:shadow-2xl hover:transform hover:scale-102'
            }`}
            onClick={() => setSelectedRole('organization')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
              <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4 mx-auto">
                <Building2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">I'm an Organization</h2>
              <p className="text-emerald-100 text-center">Looking to hire talented interns</p>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Post internship opportunities easily</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Access a pool of qualified candidates</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Manage applications and interviews</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Build your talent pipeline</span>
                </li>
              </ul>
              
              {selectedRole === 'organization' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to="/signup/organization"
                    className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition duration-300 flex items-center justify-center"
                  >
                    Get Started as Organization
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;