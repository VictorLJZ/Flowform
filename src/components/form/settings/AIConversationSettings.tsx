"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { UiBlock } from "@/types/block/UiBlock"
import { Info } from "lucide-react"

/**
 * Props interface for AIConversationSettings component
 * Accepts both UiBlock (legacy) and UiBlock (new type system)
 */
interface AIConversationSettingsProps {
  block: UiBlock
  updateSettings: (settings: Record<string, unknown>) => void
}

export function AIConversationSettings({ block, updateSettings }: AIConversationSettingsProps) {
  const settings = block.settings || {}
  const temperature = (settings.temperature as number) || 0.7
  const maxQuestions = (settings.maxQuestions as number) || 5
  const contextInstructions = (settings.contextInstructions as string) || "You are a helpful assistant responding to form submissions."

  const handleChange = (key: string, value: string | number) => {
    updateSettings({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="maxQuestions">Maximum Follow-up Questions</Label>
        <div className="flex items-center gap-2">
          <Input
            id="maxQuestions"
            type="number"
            min={1}
            max={10}
            value={maxQuestions}
            onChange={(e) => handleChange("maxQuestions", parseInt(e.target.value) || 5)}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground flex-1">
            {maxQuestions === 1 ? "1 question" : `${maxQuestions} questions`}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          How many follow-up questions the AI can ask after the initial question
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperature">AI Temperature ({temperature.toFixed(1)})</Label>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.1}
          value={[temperature]}
          onValueChange={(values) => handleChange("temperature", values[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Precise (0.0)</span>
          <span>Balanced (0.5)</span>
          <span>Creative (1.0)</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Controls how creative or focused the AI responses will be
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contextInstructions">AI Instructions</Label>
        <Textarea
          id="contextInstructions"
          placeholder="You are a helpful assistant responding to form submissions."
          value={contextInstructions}
          onChange={(e) => handleChange("contextInstructions", e.target.value)}
          className="min-h-[150px]"
        />
        <p className="text-sm text-muted-foreground">
          Instructions for the AI on how to respond and generate follow-up questions
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex gap-2">
          <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p>The dynamic AI conversation will appear to the user as a series of questions, with each follow-up appearing after they answer the previous question.</p>
            <p className="mt-2">The conversation will end after the maximum number of questions has been reached.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
