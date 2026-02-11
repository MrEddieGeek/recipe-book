'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    async function test() {
      try {
        const supabase = createClient();

        // Test 1: Check if client was created
        setStatus((prev: any) => ({
          ...prev,
          clientCreated: !!supabase,
        }));

        // Test 2: Try to get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        setStatus((prev: any) => ({
          ...prev,
          sessionCheck: sessionError ? `Error: ${sessionError.message}` : 'OK',
          hasSession: !!sessionData.session,
        }));

        // Test 3: Check environment variables
        setStatus((prev: any) => ({
          ...prev,
          envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
          envKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
        }));

      } catch (error: any) {
        setStatus((prev: any) => ({
          ...prev,
          error: error.message,
        }));
      }
    }

    test();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(status, null, 2)}
      </pre>
    </div>
  );
}
