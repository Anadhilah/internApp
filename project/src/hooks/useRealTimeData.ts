import { useState, useEffect, useCallback } from 'react';
import { jobListingService, applicationService, messageService, notificationService } from '../services/database';
import { useAuth } from '../context/AuthContext';

// Hook for real-time job listings
export const useRealTimeJobListings = () => {
  const [jobListings, setJobListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const listings = await jobListingService.getAllJobListings();
      setJobListings(listings);
    } catch (err) {
      console.error('Error loading job listings:', err);
      setError('Failed to load job listings');
      // Fallback to mock data
      try {
        const { mockInternships } = await import('../data/mockData');
        setJobListings(mockInternships);
      } catch (mockError) {
        console.error('Error loading mock data:', mockError);
        setJobListings([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobListings();

    // Subscribe to real-time updates
    const unsubscribe = jobListingService.subscribeToJobListings((payload) => {
      console.log('Job listing change:', payload);
      
      if (payload.eventType === 'INSERT') {
        setJobListings(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setJobListings(prev => 
          prev.map(job => job.id === payload.new.id ? payload.new : job)
        );
      } else if (payload.eventType === 'DELETE') {
        setJobListings(prev => 
          prev.filter(job => job.id !== payload.old.id)
        );
      }
    });

    return unsubscribe;
  }, [loadJobListings]);

  return { jobListings, loading, error, refetch: loadJobListings };
};

// Hook for real-time applications
export const useRealTimeApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let apps;
      if (user.role === 'intern') {
        apps = await applicationService.getApplicationsByIntern(user.id);
      } else {
        apps = await applicationService.getApplicationsByEmployer(user.id);
      }
      
      setApplications(apps || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications');
      // Fallback to mock data
      try {
        const { mockApplications } = await import('../data/mockData');
        setApplications(mockApplications);
      } catch (mockError) {
        console.error('Error loading mock data:', mockError);
        setApplications([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadApplications();

    if (user) {
      // Subscribe to real-time updates
      const unsubscribe = applicationService.subscribeToApplications(user.id, (payload) => {
        console.log('Application change:', payload);
        
        if (payload.eventType === 'INSERT') {
          setApplications(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setApplications(prev => 
            prev.map(app => app.id === payload.new.id ? payload.new : app)
          );
        } else if (payload.eventType === 'DELETE') {
          setApplications(prev => 
            prev.filter(app => app.id !== payload.old.id)
          );
        }
      });

      return unsubscribe;
    }
  }, [user, loadApplications]);

  return { applications, loading, error, refetch: loadApplications };
};

// Hook for real-time messages
export const useRealTimeMessages = (conversationUserId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let msgs;
      if (conversationUserId) {
        msgs = await messageService.getConversation(user.id, conversationUserId);
      } else {
        msgs = await messageService.getMessagesByUser(user.id);
      }
      
      setMessages(msgs || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user, conversationUserId]);

  const sendMessage = useCallback(async (content: string, receiverId: string) => {
    if (!user) return;

    try {
      const message = await messageService.sendMessage({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
      });
      
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [user]);

  useEffect(() => {
    loadMessages();

    if (user) {
      // Subscribe to real-time updates
      const unsubscribe = messageService.subscribeToMessages(user.id, (payload) => {
        console.log('New message:', payload);
        setMessages(prev => [...prev, payload.new]);
      });

      return unsubscribe;
    }
  }, [user, loadMessages]);

  return { messages, loading, error, sendMessage, refetch: loadMessages };
};

// Hook for real-time notifications
export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.id,
      (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('InternLink', {
            body: notification.message,
            icon: '/vite.svg'
          });
        }
      }
    );

    return unsubscribe;
  }, [user]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { 
    notifications, 
    clearNotifications, 
    requestNotificationPermission 
  };
};