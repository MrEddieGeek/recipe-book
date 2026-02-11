// Temporary debug endpoint to check environment variables
export async function GET() {
  return Response.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
  });
}
