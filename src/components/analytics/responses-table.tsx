"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Filter, MoreHorizontal, Search, SlidersHorizontal } from "lucide-react"
import { useFormStore } from "@/stores/formStore"
import { useAnalyticsStore } from "@/stores/analyticsStore"
import { FormBlock, StaticBlockAnswer, QAPair } from "@/types/supabase-types"

interface ResponsesTableProps {
  formId: string
}

export function ResponsesTable({ formId }: ResponsesTableProps) {
  const { fetchFormById, currentForm, isLoading: isFormLoading } = useFormStore()
  const { fetchResponses, responses, isLoading: isResponsesLoading } = useAnalyticsStore()
  const [searchTerm, setSearchTerm] = useState("")
  
  const isLoading = isFormLoading || isResponsesLoading

  useEffect(() => {
    // Fetch the form data if not already loaded
    if (formId && (!currentForm || currentForm.form_id !== formId)) {
      fetchFormById(formId)
    }
    
    // Fetch responses
    if (formId) {
      fetchResponses(formId)
    }
  }, [formId, fetchFormById, fetchResponses, currentForm])

  // Generate table headers based on form blocks
  const headers = currentForm?.blocks
    ? [...currentForm.blocks]
        .sort((a, b) => a.order_index - b.order_index)
        .map((block) => ({
          id: block.id,
          title: block.title,
          type: block.type,
          subtype: block.subtype,
        }))
    : []

  // Helper function to find answer for a specific block
  const findAnswerForBlock = (
    answers: StaticBlockAnswer[],
    blockId: string
  ): string => {
    const answer = answers.find((a) => a.block_id === blockId)
    return answer?.answer || ""
  }

  // Helper function to format dynamic conversation
  const formatDynamicConversation = (conversation: QAPair[]): string => {
    return conversation
      .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join("\n\n")
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search responses..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Respondent</TableHead>
              <TableHead className="w-[160px]">Submitted</TableHead>
              
              {/* Dynamically generated columns based on form blocks */}
              {isLoading ? (
                <TableHead colSpan={3}>
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ) : headers.length > 0 ? (
                headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.title}
                  </TableHead>
                ))
              ) : (
                <TableHead>No questions found</TableHead>
              )}
              
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  {Array.from({ length: headers.length || 3 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : responses.length > 0 ? (
              // Actual data rows
              responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">
                    {response.respondent_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {new Date(response.completed_at || response.started_at).toLocaleDateString()}
                  </TableCell>
                  
                  {headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.type === "static" ? (
                        findAnswerForBlock(response.static_answers, header.id)
                      ) : header.type === "dynamic" ? (
                        response.dynamic_responses
                          .filter((dr) => dr.block_id === header.id)
                          .map((dr) => (
                            <div key={dr.id} className="max-w-xs truncate">
                              {dr.conversation && dr.conversation.length > 0 ? (
                                <span title={formatDynamicConversation(dr.conversation)}>
                                  {dr.conversation.length} message{dr.conversation.length !== 1 ? 's' : ''}
                                </span>
                              ) : (
                                "No conversation"
                              )}
                            </div>
                          ))
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  ))}
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Export</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={headers.length + 3}
                  className="h-24 text-center"
                >
                  No responses yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {responses.length > 0
            ? `Showing ${responses.length} response${responses.length !== 1 ? 's' : ''}`
            : 'No responses'}
        </div>
        
        {responses.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={true}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={true}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
