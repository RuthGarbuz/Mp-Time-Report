/**
 * useReportTime Hook - Business logic for time tracking component
 * 
 * This hook manages:
 * - Employee data fetching and state
 * - Real-time clock updates
 * - Geolocation tracking
 * - Clock in/out actions
 * - Time calculations
 * 
 * Extracted from ReportTime.tsx to separate concerns:
 * - Models: Data structures and utilities
 * - Hooks: Business logic and state management
 * - Component: UI rendering only
 */

import { useState, useEffect, useCallback } from 'react';
import authService from '../../../services/authService';
import EmployeeService from '../../../services/employeeService';
import type { EmployeeTimeData } from '../models';
import {
  mapEmployeeData,
  calculateEffectiveReportTime,
  formatDateHebrew,
  getProfileImageUrl,
  getCurrentCoordinates,
  generateMapsUrl,
  DEFAULT_LOCATION
} from '../models';

// ============================================================================
// Hook Interface
// ============================================================================

export interface UseReportTimeReturn {
  // Employee State
  employee: EmployeeTimeData | null;
  
  // Time State
  currentTime: Date;
  effectiveReportTime: string;
  
  // Location State
  locationName: string;
  locationUrl: string;
  
  // Actions
  handleClockIn: () => Promise<void>;
  handleClockOut: () => Promise<void>;
  
  // Utilities
  formatDate: (date: Date) => string;
  getProfileImage: () => string;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for time tracking functionality
 * 
 * @returns {UseReportTimeReturn} State and actions for time tracking
 * 
 * Features:
 * - Fetches current employee data on mount
 * - Updates clock every second
 * - Fetches and displays user location
 * - Handles clock in/out with page reload
 * - Calculates effective report time including current session
 */
export function useReportTime(): UseReportTimeReturn {
  // ==========================================================================
  // State
  // ==========================================================================
  
  const [employee, setEmployee] = useState<EmployeeTimeData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationName, setLocationName] = useState('המיקום שלך');
  const [locationUrl, setLocationUrl] = useState('');

  // ==========================================================================
  // Effect - Fetch Employee Data on Mount
  // ==========================================================================
  
  useEffect(() => {
    let mounted = true;
    
    const fetchEmployee = async () => {
      try {
        const empData = await authService.getCurrentEmployee();
        
        if (!mounted) return;
        
        // Map API data to normalized structure
        setEmployee(mapEmployeeData(empData));
      } catch (error) {
        console.error('Failed to fetch employee:', error);
      }
    };

    fetchEmployee();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================================
  // Effect - Real-time Clock Update
  // ==========================================================================
  
  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, []);

  // ==========================================================================
  // Effect - Fetch User Location
  // ==========================================================================
  
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Get user's coordinates using browser geolocation API
        const position = await getCurrentCoordinates();
        const { latitude, longitude } = position.coords;

        // Fetch location name from backend service
        const name = await EmployeeService.getUserLocation();
        setLocationName(name);
        localStorage.setItem('location', name);

        // Generate Google Maps embed URL
        const mapsUrl = generateMapsUrl(latitude, longitude);
        setLocationUrl(mapsUrl);

      } catch (error) {
        console.error('שגיאה בקבלת מיקום:', error);
        
        // Fallback to default location (Tel Aviv)
        setLocationName(DEFAULT_LOCATION.name);
        setLocationUrl(DEFAULT_LOCATION.url);
        localStorage.setItem('location', DEFAULT_LOCATION.name);
      }
    };

    fetchLocation();
  }, []);

  // ==========================================================================
  // Calculated Values
  // ==========================================================================
  
  /**
   * Calculate effective report time including current active session
   * Updates every second via currentTime dependency
   */
  const effectiveReportTime = calculateEffectiveReportTime(
    employee?.totalSecondsReported ?? 0,
    employee?.startTime ?? null,
    employee?.isActive ?? false
  );

  // ==========================================================================
  // Actions - Clock In/Out
  // ==========================================================================
  
  /**
   * Handles clock-in action
   * - Calls backend API to record clock-in
   * - Reloads page to reflect new state
   */
  const handleClockIn = useCallback(async () => {
    try {
      await EmployeeService.clockIn();
      console.log('כניסה נרשמה בהצלחה');
      window.location.reload();
    } catch (error) {
      console.error('שגיאה ברישום כניסה:', error);
    }
  }, []);

  /**
   * Handles clock-out action
   * - Calls backend API to record clock-out
   * - Reloads page to reflect new state
   */
  const handleClockOut = useCallback(async () => {
    try {
      await EmployeeService.clockOut();
      console.log('יציאה נרשמה בהצלחה');
      window.location.reload();
    } catch (error) {
      console.error('שגיאה ברישום יציאה:', error);
    }
  }, []);

  // ==========================================================================
  // Utility Functions
  // ==========================================================================
  
  /**
   * Format date in Hebrew locale
   * Wrapped in useCallback to prevent unnecessary re-renders
   */
  const formatDate = useCallback((date: Date) => {
    return formatDateHebrew(date);
  }, []);

  /**
   * Get profile image URL with fallback
   * Wrapped in useCallback to prevent unnecessary re-renders
   */
  const getProfileImage = useCallback(() => {
    return getProfileImageUrl(employee?.profileImage);
  }, [employee?.profileImage]);

  // ==========================================================================
  // Return Hook API
  // ==========================================================================
  
  return {
    // State
    employee,
    currentTime,
    effectiveReportTime,
    locationName,
    locationUrl,
    
    // Actions
    handleClockIn,
    handleClockOut,
    
    // Utilities
    formatDate,
    getProfileImage
  };
}
