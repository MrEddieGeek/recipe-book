#!/bin/bash

# Vercel Environment Variables Setup Helper
# Run this after installing Vercel CLI with: npm install -g vercel

echo "Setting up environment variables in Vercel..."

vercel env add NEXT_PUBLIC_SUPABASE_URL production <<EOF
https://ogtqpsqliggszflsobny.supabase.co
EOF

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndHFwc3FsaWdnc3pmbHNvYm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDUyMTUsImV4cCI6MjA4NjQyMTIxNX0.73D86_d_faTdxFDfGvfrVLU2ZHhD5mg-Ulvc_BQXu54
EOF

vercel env add SUPABASE_SERVICE_ROLE_KEY production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndHFwc3FsaWdnc3pmbHNvYm55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDg0NTIxNSwiZXhwIjoyMDg2NDIxMjE1fQ.gKxhyeLQPieBQxTaxy1HhrxNP73jIe0B1TGSZIwWPwQ
EOF

echo "Environment variables added! Now run: vercel --prod"
