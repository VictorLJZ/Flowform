"use client"

import { useQuestionMetrics } from "@/hooks/useQuestionMetrics"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { FileQuestionIcon, CornerDownRightIcon, RefreshCwIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface QuestionMetricsProps {
  formId: string
}

/**
 * Displays question-by-question metrics including views and drop-off rates
 */
export function QuestionMetrics({ formId }: QuestionMetricsProps) {
  const { 
    questions,
    isLoading,
    error,
    refresh
  } = useQuestionMetrics(formId)

  // Handle error state
  if (error) {
    console.error('[QuestionMetrics] Error:', error);
    return (
      <div className="p-6 border rounded-md bg-destructive/5">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Error loading question metrics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Please check the browser console for more details. This may be due to the API endpoint 
            not being properly configured for your database schema.
          </p>
          <Button onClick={() => refresh()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Question by question</h3>
        <Button
          onClick={() => refresh()}
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <RefreshCwIcon className="h-3.5 w-3.5" />
          <span className="text-xs">Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : questions.length === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Questions</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Drop-off<span className="ml-1 text-xs text-muted-foreground">(?)</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">
                  <div className="flex items-start gap-2">
                    <FileQuestionIcon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <span className="line-clamp-2">{question.title || "Untitled Question"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{question.count}</TableCell>
                <TableCell className="text-right">
                  <span 
                    className={cn(
                      "inline-flex items-center gap-1 font-medium",
                      question.dropOffRate > 0 ? "text-rose-500" : "text-muted-foreground"
                    )}
                  >
                    {question.dropOffRate > 0 && (
                      <CornerDownRightIcon className="h-3 w-3" />
                    )}
                    {question.dropOffPercentage}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="ml-auto h-4 w-[50px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        </div>
        <div className="border-t">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[240px]" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-[50px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-md border bg-muted/40">
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileQuestionIcon className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="text-sm font-medium">No question data available</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">
          When people start viewing and responding to your form, you'll see metrics for each question here.
        </p>
      </div>
    </div>
  )
}
