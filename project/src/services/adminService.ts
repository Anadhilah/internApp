import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type AdminUser = Tables['admin_users']['Row'];
type OrganizationApproval = Tables['organization_approvals']['Row'];
type UserReport = Tables['user_reports']['Row'];
type AuditLog = Tables['audit_logs']['Row'];

// Enhanced error handling for admin operations
class AdminError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AdminError';
  }
}

const handleAdminError = (error: any, operation: string) => {
  console.error(`Admin error during ${operation}:`, error);
  throw new AdminError(`Failed to ${operation}. Please try again.`, error);
};

// Admin authentication and authorization
export const adminAuthService = {
  async checkAdminAccess(userId: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          users (
            id,
            name,
            email,
            user_type,
            status
          )
        `)
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      handleAdminError(error, 'check admin access');
    }
  },

  async getCurrentAdmin() {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          admin_users (
            admin_level,
            permissions
          )
        `)
        .eq('auth_user_id', user.id)
        .eq('user_type', 'admin')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      handleAdminError(error, 'get current admin');
    }
  }
};

// Organization approval management
export const organizationApprovalService = {
  async getPendingApprovals() {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('organization_approvals')
        .select(`
          *,
          users (
            id,
            name,
            email,
            created_at
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleAdminError(error, 'get pending approvals');
    }
  },

  async approveOrganization(approvalId: string, adminId: string, notes?: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('organization_approvals')
        .update({
          status: 'approved',
          admin_notes: notes,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', approvalId)
        .select()
        .single();
      
      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'approve_organization', 'organization_approval', approvalId, {
        status: 'pending'
      }, {
        status: 'approved',
        notes
      });

      return data;
    } catch (error) {
      handleAdminError(error, 'approve organization');
    }
  },

  async rejectOrganization(approvalId: string, adminId: string, reason: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('organization_approvals')
        .update({
          status: 'rejected',
          admin_notes: reason,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', approvalId)
        .select()
        .single();
      
      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'reject_organization', 'organization_approval', approvalId, {
        status: 'pending'
      }, {
        status: 'rejected',
        reason
      });

      return data;
    } catch (error) {
      handleAdminError(error, 'reject organization');
    }
  },

  async logAdminAction(adminId: string, action: string, targetType: string, targetId: string, oldValues?: any, newValues?: any) {
    if (!supabase) return;
    
    try {
      await supabase.rpc('log_admin_action', {
        p_admin_id: adminId,
        p_action_type: action,
        p_target_type: targetType,
        p_target_id: targetId,
        p_old_values: oldValues,
        p_new_values: newValues
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
};

// User management
export const userManagementService = {
  async getAllUsers(page = 1, limit = 50, filter?: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          intern_profiles (
            skills,
            bio,
            location
          ),
          employer_profiles (
            company_name,
            industry,
            location
          )
        `)
        .neq('user_type', 'admin')
        .order('created_at', { ascending: false });

      if (filter) {
        query = query.or(`name.ilike.%${filter}%,email.ilike.%${filter}%`);
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleAdminError(error, 'get all users');
    }
  },

  async banUser(userId: string, adminId: string, reason: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          status: 'banned',
          banned_at: new Date().toISOString(),
          banned_by: adminId,
          ban_reason: reason
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;

      // Log admin action
      await organizationApprovalService.logAdminAction(adminId, 'ban_user', 'user', userId, {
        status: 'active'
      }, {
        status: 'banned',
        reason
      });

      return data;
    } catch (error) {
      handleAdminError(error, 'ban user');
    }
  },

  async unbanUser(userId: string, adminId: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          status: 'active',
          banned_at: null,
          banned_by: null,
          ban_reason: null
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;

      // Log admin action
      await organizationApprovalService.logAdminAction(adminId, 'unban_user', 'user', userId, {
        status: 'banned'
      }, {
        status: 'active'
      });

      return data;
    } catch (error) {
      handleAdminError(error, 'unban user');
    }
  },

  async deleteUser(userId: string, adminId: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      // Get user data before deletion for audit log
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;

      // Log admin action
      await organizationApprovalService.logAdminAction(adminId, 'delete_user', 'user', userId, userData, null);

      return true;
    } catch (error) {
      handleAdminError(error, 'delete user');
    }
  }
};

// Job moderation
export const jobModerationService = {
  async getAllJobListings(page = 1, limit = 50, filter?: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      let query = supabase
        .from('job_listings')
        .select(`
          *,
          employer_profiles (
            company_name,
            user_id,
            users (
              name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filter) {
        query = query.or(`title.ilike.%${filter}%,description.ilike.%${filter}%`);
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleAdminError(error, 'get all job listings');
    }
  },

  async moderateJob(jobId: string, adminId: string, status: 'approved' | 'rejected' | 'flagged', notes?: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .update({
          moderation_status: status,
          moderation_notes: notes,
          moderated_by: adminId,
          moderated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) throw error;

      // Log admin action
      await organizationApprovalService.logAdminAction(adminId, 'moderate_job', 'job_listing', jobId, {
        moderation_status: 'pending'
      }, {
        moderation_status: status,
        notes
      });

      return data;
    } catch (error) {
      handleAdminError(error, 'moderate job');
    }
  },

  async deleteJob(jobId: string, adminId: string, reason: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      // Get job data before deletion for audit log
      const { data: jobData } = await supabase
        .from('job_listings')
        .select('*')
        .eq('id', jobId)
        .single();

      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobId);
      
      if (error) throw error;

      // Log admin action
      await organizationApprovalService.logAdminAction(adminId, 'delete_job', 'job_listing', jobId, jobData, { reason });

      return true;
    } catch (error) {
      handleAdminError(error, 'delete job');
    }
  }
};

// Reports management
export const reportsService = {
  async getAllReports(page = 1, limit = 50, status?: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      let query = supabase
        .from('user_reports')
        .select(`
          *,
          reporter:users!user_reports_reporter_id_fkey (
            id,
            name,
            email
          ),
          reported_user:users!user_reports_reported_user_id_fkey (
            id,
            name,
            email
          ),
          reported_job:job_listings (
            id,
            title,
            employer_profiles (
              company_name
            )
          ),
          handler:users!user_reports_handled_by_fkey (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleAdminError(error, 'get all reports');
    }
  },

  async handleReport(reportId: string, adminId: string, status: 'resolved' | 'dismissed', notes?: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .update({
          status,
          admin_notes: notes,
          handled_by: adminId,
          handled_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;

      // Log admin action
      await organizationApprovalService.logAdminAction(adminId, 'handle_report', 'user_report', reportId, {
        status: 'pending'
      }, {
        status,
        notes
      });

      return data;
    } catch (error) {
      handleAdminError(error, 'handle report');
    }
  }
};

// Analytics service
export const analyticsService = {
  async getDashboardMetrics() {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      // Get current metrics
      const [
        { count: totalUsers },
        { count: totalInterns },
        { count: totalEmployers },
        { count: totalJobs },
        { count: activeJobs },
        { count: totalApplications },
        { count: pendingApprovals },
        { count: pendingReports }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).neq('user_type', 'admin'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'intern'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'employer'),
        supabase.from('job_listings').select('*', { count: 'exact', head: true }),
        supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('organization_approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalInterns: totalInterns || 0,
        totalEmployers: totalEmployers || 0,
        totalJobs: totalJobs || 0,
        activeJobs: activeJobs || 0,
        totalApplications: totalApplications || 0,
        pendingApprovals: pendingApprovals || 0,
        pendingReports: pendingReports || 0
      };
    } catch (error) {
      handleAdminError(error, 'get dashboard metrics');
    }
  },

  async getApplicationTrends(days = 30) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('applied_at')
        .gte('applied_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('applied_at', { ascending: true });
      
      if (error) throw error;

      // Group by date
      const trends = (data || []).reduce((acc, app) => {
        const date = new Date(app.applied_at).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(trends).map(([date, count]) => ({
        date,
        applications: count
      }));
    } catch (error) {
      handleAdminError(error, 'get application trends');
    }
  }
};

// Audit logs service
export const auditLogService = {
  async getAuditLogs(page = 1, limit = 50, adminId?: string, actionType?: string) {
    if (!supabase) throw new AdminError('Database not available');
    
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          admin:users (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (adminId) {
        query = query.eq('admin_id', adminId);
      }

      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleAdminError(error, 'get audit logs');
    }
  }
};