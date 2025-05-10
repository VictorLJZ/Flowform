/**
 * UI Alerts Slice Types
 * 
 * This file contains the type definitions for UI alerts in the form builder.
 */

export interface UIAlertsSlice {
  // Alert state
  showOrphanedNodeAlert: boolean;
  orphanedNodeDetails: {
    connectionId: string;
    oldTargetId: string;
    newTargetId: string;
  } | null;
  
  // Alert actions
  setShowOrphanedNodeAlert: (show: boolean) => void;
  setOrphanedNodeDetails: (details: {
    connectionId: string;
    oldTargetId: string;
    newTargetId: string;
  } | null) => void;
}
