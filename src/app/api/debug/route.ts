import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const xaiKey = process.env.XAI_API_KEY;

  const checks: Record<string, string> = {
    SUPABASE_URL: url ? 'set' : 'MISSING',
    SERVICE_ROLE_KEY: serviceKey ? 'set' : 'MISSING',
    ANON_KEY: anonKey ? 'set' : 'MISSING',
    XAI_API_KEY: xaiKey ? 'set' : 'MISSING',
  };

  // Test Supabase insert
  const key = serviceKey || anonKey;
  if (url && key) {
    const supabase = createClient(url.trim(), key.trim());
    const testRecipe = {
      user_id: null,
      title: 'Test Recipe (delete me)',
      description: 'Debug test',
      source_type: 'manual',
      ingredients: [{ item: 'test', amount: '1', unit: 'cup' }],
      instructions: [{ step: 1, description: 'Test step' }],
      tags: ['test'],
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert(testRecipe)
      .select()
      .single();

    if (error) {
      checks.supabase_insert = `ERROR: ${error.message} (code: ${error.code})`;
    } else {
      checks.supabase_insert = `OK (id: ${data.id})`;
      await supabase.from('recipes').delete().eq('id', data.id);
      checks.supabase_cleanup = 'OK';
    }
  }

  // Test xAI API
  if (xaiKey) {
    try {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${xaiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'grok-3-mini-fast',
          messages: [{ role: 'user', content: 'Say hello in one word.' }],
          max_tokens: 10,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        checks.xai_test = `ERROR ${res.status}: ${errBody}`;
      } else {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'no content';
        checks.xai_test = `OK: "${reply}"`;
      }
    } catch (err) {
      checks.xai_test = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return Response.json(checks);
}
