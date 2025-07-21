import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Shield,
  Activity
} from 'lucide-react';
import { analyticsService } from '../../services/adminService';

interface DashboardMetrics {
  totalUsers: number;
  totalInterns: number;
  totalEmployers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApprovals: number;
  pendingReports: number;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [applicationTrends, setApplicationTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, trendsData] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getApplicationTrends(30)
      ]);
      
      setMetrics(metricsData);
      setApplicationTrends(trendsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set mock data for demonstration
      setMetrics({
        totalUsers: 1247,
        totalInterns: 892,
        totalEmployers: 355,
        totalJobs: 156,
        activeJobs: 89,
        totalApplications: 2341,
        pendingApprovals: 12,
        pendingReports: 5
      });
      setApplicationTrends([
        { date: 'Jan 1', applications: 45 },
        { date: 'Jan 2', applications: 52 },
        { date: 'Jan 3', applications: 38 },
        { date: 'Jan 4', applications: 61 },
        { date: 'Jan 5', applications: 55 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: metrics?.totalUsers || 0,
      icon: <Users className="h-8 w-8" />,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Jobs',
      value: metrics?.activeJobs || 0,
      icon: <Briefcase className="h-8 w-8" />,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: metrics?.pendingApprovals || 0,
      icon: <Clock className="h-8 w-8" />,
      color: 'bg-yellow-500',
      change: '-3%',
      changeType: 'negative'
    },
    {
      title: 'Total Applications',
      value: metrics?.totalApplications || 0,
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  const quickActions = [
    {
      title: 'Pending Organization Approvals',
      count: metrics?.pendingApprovals || 0,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      action: 'Review Now'
    },
    {
      title: 'Reported Content',
      count: metrics?.pendingReports || 0,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      action: 'Investigate'
    },
    {
      title: 'Flagged Jobs',
      count: 3,
      icon: <Eye className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: 'Review'
    },
    {
      title: 'System Health',
      count: 99,
      icon: <Activity className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: 'Monitor',
      suffix: '%'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
                <Shield className="h-8 w-8 text-purple-600 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage the InternLink platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <div key={action.title} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${action.bgColor} ${action.color} mr-4`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">
                        {action.count}{action.suffix || ''} {action.title.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                    {action.action}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                {
                  action: 'Organization approved',
                  target: 'TechStartup Inc.',
                  time: '2 minutes ago',
                  type: 'approval'
                },
                {
                  action: 'User banned',
                  target: 'john.doe@email.com',
                  time: '15 minutes ago',
                  type: 'moderation'
                },
                {
                  action: 'Job listing flagged',
                  target: 'Senior Developer Position',
                  time: '1 hour ago',
                  type: 'flag'
                },
                {
                  action: 'Report resolved',
                  target: 'Inappropriate content',
                  time: '2 hours ago',
                  type: 'resolution'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'approval' ? 'bg-green-500' :
                      activity.type === 'moderation' ? 'bg-red-500' :
                      activity.type === 'flag' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.target}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Application Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Application Trends</h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {applicationTrends.slice(0, 7).map((trend, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-purple-500 rounded-t-sm transition-all duration-300 hover:bg-purple-600"
                    style={{ height: `${(trend.applications / 70) * 100}%`, minHeight: '4px' }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                    {trend.date}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* User Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Distribution</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Interns</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 mr-2">
                    {metrics?.totalInterns || 0}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({Math.round(((metrics?.totalInterns || 0) / (metrics?.totalUsers || 1)) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((metrics?.totalInterns || 0) / (metrics?.totalUsers || 1)) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Employers</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 mr-2">
                    {metrics?.totalEmployers || 0}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({Math.round(((metrics?.totalEmployers || 0) / (metrics?.totalUsers || 1)) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((metrics?.totalEmployers || 0) / (metrics?.totalUsers || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;