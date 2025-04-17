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
import { useForm } from "@/hooks/useForm"
import { useFormResponses } from "@/hooks/useAnalyticsData"
import { StaticBlockAnswer, QAPair } from "@/types/supabase-types"

interface ResponsesTableProps {
  formId: string
}

export function ResponsesTable({ formId }: ResponsesTableProps) {
  const { form: currentForm, isLoading: isFormLoading } = useForm(formId)
  const { responses, error: responsesError, isLoading: isResponsesLoading } = useFormResponses(formId)
  const [searchTerm, setSearchTerm] = useState("")

  const isLoading = isFormLoading || isResponsesLoading

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

  const filteredResponses = responses
    ? responses.filter((response) => {
        if (!response) return false
        const searchLower = searchTerm.toLowerCase()
        const matchesStatic = response.static_answers.some((sa) =>
          sa.answer?.toString().toLowerCase().includes(searchLower)
        )
        const matchesDynamic = response.dynamic_responses.some((dr) => {
          const conversationText = (dr.conversation as QAPair[])
            ?.map((pair) => `${pair.question} ${pair.answer}`)
            .join(" ") || ""
          return conversationText.toLowerCase().includes(searchLower)
        })
        return matchesStatic || matchesDynamic
      })
    : []

  if (isLoading) {
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

                {headers.length > 0 ? (
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
              {Array.from({ length: 5 }).map((_, i) => (
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
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Loading...
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled={true}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={true}>
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (responsesError) {
    return <div className="text-red-500">Error loading responses: {responsesError.message}</div>
  }

  if (!responses || responses.length === 0) {
    return <div className="text-center p-4">No responses submitted yet.</div>
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

              {headers.length > 0 ? (
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
            {filteredResponses.map((response) => (
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
                            {dr.conversation && Array.isArray(dr.conversation) ? (
                              (dr.conversation as QAPair[]).map((qa) => `${qa.question}: ${qa.answer}`).join(', ')
                            ) : (
                              JSON.stringify(dr.conversation)
                            )}
                          </div>
                        ))
                        .find(Boolean)
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                ))}

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
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
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {filteredResponses.length > 0
            ? `Showing ${filteredResponses.length} response${filteredResponses.length !== 1 ? 's' : ''}`
            : 'No responses'}
        </div>

        {filteredResponses.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled={true}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={true}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const findAnswerForBlock = (staticAnswers: StaticBlockAnswer[], blockId: string) => {
  const answer = staticAnswers.find((sa) => sa.block_id === blockId)?.answer
  if (typeof answer === 'boolean') {
    return answer ? 'Yes' : 'No'
  }
  if (answer === null || answer === undefined) {
    return '-'
  }
  const displayAnswer = String(answer)
  return displayAnswer.length > 50 ? displayAnswer.substring(0, 47) + '...' : displayAnswer
}
