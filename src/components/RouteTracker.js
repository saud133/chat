/**
 * RouteTracker Component
 * 
 * Tracks page visits when routes change.
 * Automatically sends visit data to the backend analytics API.
 * 
 * This component should be placed inside the Router to track all navigation.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { trackVisit } from '../utils/sessionUtils';

const RouteTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Track visit when route changes
    trackVisit(location.pathname, user?.id || null);
  }, [location.pathname, user?.id]);

  return null; // This component doesn't render anything
};

export default RouteTracker;

