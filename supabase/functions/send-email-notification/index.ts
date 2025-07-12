import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string
  subject: string
  html: string
  type: 'request_sent' | 'request_accepted' | 'request_rejected'
  requestData?: {
    fromUserName: string
    toUserName: string
    message: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, subject, html, type, requestData }: EmailPayload = await req.json()

    // For demo purposes, we'll log the email instead of actually sending it
    // In production, you would integrate with a service like SendGrid, Resend, or AWS SES
    console.log('📧 Email Notification:', {
      to,
      subject,
      type,
      requestData,
      timestamp: new Date().toISOString()
    })

    // Simulate email sending with different templates based on type
    let emailContent = ''
    
    switch (type) {
      case 'request_sent':
        emailContent = `
          <h2>New Skill Swap Request</h2>
          <p>Hi ${requestData?.toUserName},</p>
          <p>You have received a new skill swap request from <strong>${requestData?.fromUserName}</strong>.</p>
          <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; font-style: italic;">
            "${requestData?.message}"
          </blockquote>
          <p>Log in to your SkillSwap account to respond to this request.</p>
          <a href="${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/requests" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            View Request
          </a>
          <p>Best regards,<br>The SkillSwap Team</p>
        `
        break
        
      case 'request_accepted':
        emailContent = `
          <h2>🎉 Your Skill Swap Request was Accepted!</h2>
          <p>Hi ${requestData?.fromUserName},</p>
          <p>Great news! <strong>${requestData?.toUserName}</strong> has accepted your skill swap request.</p>
          <p>You can now coordinate your skill exchange session. We recommend reaching out to discuss:</p>
          <ul>
            <li>Preferred meeting times</li>
            <li>Communication platform (video call, in-person, etc.)</li>
            <li>Specific topics to cover</li>
            <li>Session duration and frequency</li>
          </ul>
          <a href="${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/requests" 
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            View Details
          </a>
          <p>Happy learning!<br>The SkillSwap Team</p>
        `
        break
        
      case 'request_rejected':
        emailContent = `
          <h2>Skill Swap Request Update</h2>
          <p>Hi ${requestData?.fromUserName},</p>
          <p><strong>${requestData?.toUserName}</strong> has declined your skill swap request.</p>
          <p>Don't worry! There are many other skilled individuals on SkillSwap who would love to connect with you.</p>
          <a href="${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/browse" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Browse More Profiles
          </a>
          <p>Keep exploring and connecting!<br>The SkillSwap Team</p>
        `
        break
    }

    // In a real implementation, you would send the email here
    // Example with a service like Resend:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SkillSwap <noreply@skillswap.com>',
        to: [to],
        subject: subject,
        html: emailContent,
      }),
    })
    */

    // For demo, we'll return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
        emailPreview: emailContent 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending email notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})