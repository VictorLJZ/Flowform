"use client"

import { useCallback } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function OrphanedNodeAlert() {
  // Get the state and actions from the store
  const showOrphanedNodeAlert = useFormBuilderStore(state => state.showOrphanedNodeAlert)
  const orphanedNodeDetails = useFormBuilderStore(state => state.orphanedNodeDetails)
  const setShowOrphanedNodeAlert = useFormBuilderStore(state => state.setShowOrphanedNodeAlert)
  const blocks = useFormBuilderStore(state => state.blocks)
  
  // Get the block names for better user experience
  const oldTargetBlock = blocks.find(block => block.id === orphanedNodeDetails?.oldTargetId)
  
  const oldTargetName = oldTargetBlock?.title || 'the previous block'
  
  // Handle the user confirming they want to proceed anyway (which would create an orphaned node)
  const handleProceedAnyway = useCallback(() => {
    if (orphanedNodeDetails) {
      // Force the update by directly modifying the connections
      const connections = useFormBuilderStore.getState().connections
      const updatedConnections = connections.map(conn => 
        conn.id === orphanedNodeDetails.connectionId 
          ? { ...conn, defaultTargetId: orphanedNodeDetails.newTargetId } 
          : conn
      )
      
      // Update the connections
      useFormBuilderStore.getState().setConnections(updatedConnections)
      
      // Close the alert
      setShowOrphanedNodeAlert(false)
    }
  }, [orphanedNodeDetails, setShowOrphanedNodeAlert])
  
  // Handle the user canceling the action
  const handleCancel = useCallback(() => {
    setShowOrphanedNodeAlert(false)
  }, [setShowOrphanedNodeAlert])
  
  return (
    <AlertDialog open={showOrphanedNodeAlert} onOpenChange={setShowOrphanedNodeAlert}>
      <AlertDialogContent className="p-6 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Warning: Orphaned Block</AlertDialogTitle>
          <AlertDialogDescription>
            Changing this connection would leave <strong>{oldTargetName}</strong> as an orphaned block 
            with no connections to it. This means it would become unreachable in your form flow.
          </AlertDialogDescription>
          <div className="mt-4 text-sm text-muted-foreground">
            Do you want to proceed anyway? If you do, you might want to either:
            <ul className="list-disc pl-6 mt-2">
              <li>Connect to the orphaned block from somewhere else</li>
              <li>Delete the orphaned block if it&apos;s no longer needed</li>
            </ul>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleProceedAnyway}>
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
