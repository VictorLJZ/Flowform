"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import MegaNavbar from '@/components/layout/public/MegaNavbar'
import FooterBar from '@/components/layout/public/FooterBar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Check, AlertCircle } from 'lucide-react'

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Initialize form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }
      
      setSubmitStatus('success')
      setSubmitMessage(result.message || 'Your message has been sent successfully!')
      form.reset()
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
      setSubmitMessage('Failed to send your message. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <MegaNavbar />
      <main className="flex flex-col">
        {/* Contact Hero */}
        <section className="py-16 md:py-24 bg-white border-b border-gray-100">
          <div className="container px-4 md:px-6 mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                Have questions about FlowForm? We&apos;re here to help. Fill out the form below and our team will get back to you as soon as possible.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 md:p-12 max-w-3xl mx-auto">
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">{submitMessage}</p>
                  <Button 
                    onClick={() => {
                      setSubmitStatus('idle')
                      setSubmitMessage('')
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="What&apos;s this about?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How can we help you?"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {submitStatus === 'error' && (
                      <div className="bg-red-50 p-4 rounded-md flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <span className="text-red-800 text-sm">{submitMessage}</span>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </section>
      </main>
      <FooterBar />
    </>
  )
}
