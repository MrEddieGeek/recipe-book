import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !key) {
    return Response.json({ error: 'Storage not configured' }, { status: 503 });
  }

  const supabase = createClient(url.trim(), key.trim());

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'El archivo debe ser una imagen' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'La imagen no debe superar los 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `recipes/${fileName}`;

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return Response.json(
        { error: `Error al subir: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filePath);

    return Response.json({ url: publicUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    return Response.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    );
  }
}
