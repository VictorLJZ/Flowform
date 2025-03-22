import { NextResponse } from 'next/server'
import { type CookieOptions } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieHeader = request.headers.get('cookie') || ''
    
    // Create a Response to manipulate cookies
    const response = new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Redirecting...</title>
          <script>
            // Check if we have a saved redirect URL
            const redirectUrl = localStorage.getItem('authRedirectUrl');
            if (redirectUrl) {
              // Clear the stored URL
              localStorage.removeItem('authRedirectUrl');
              // Redirect to the original page
              window.location.href = redirectUrl;
            } else {
              // Default to homepage if no stored URL
              window.location.href = '${origin}';
            }
          </script>
        </head>
        <body>
          <p>Completing authentication, please wait...</p>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = [];
            for (const cookie of cookieHeader.split(';')) {
              const [name, ...value] = cookie.split('=');
              cookies.push({
                name: name.trim(),
                value: value.join('='),
              });
            }
            return cookies;
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              let cookieValue = `${name}=${value}`;
              
              if (options?.expires) {
                cookieValue += `; Expires=${options.expires.toUTCString()}`;
              }
              if (options?.maxAge) {
                cookieValue += `; Max-Age=${options.maxAge}`;
              }
              if (options?.domain) {
                cookieValue += `; Domain=${options.domain}`;
              }
              if (options?.path) {
                cookieValue += `; Path=${options.path}`;
              }
              if (options?.sameSite) {
                cookieValue += `; SameSite=${options.sameSite}`;
              }
              if (options?.secure) {
                cookieValue += '; Secure';
              }
              if (options?.httpOnly) {
                cookieValue += '; HttpOnly';
              }
              
              response.headers.append('Set-Cookie', cookieValue);
            });
          },
        },
      }
    )

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    return response
  }

  // Fallback for cases where there is no code
  return NextResponse.redirect(origin)
}
