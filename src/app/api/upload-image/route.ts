import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// Magic byte signatures for image formats
const MAGIC_BYTES: { mime: string; bytes: number[]; offset?: number }[] = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46] },
];

function detectImageType(buffer: Uint8Array): string | null {
  for (const sig of MAGIC_BYTES) {
    const offset = sig.offset ?? 0;
    if (buffer.length < offset + sig.bytes.length) continue;
    const match = sig.bytes.every((b, i) => buffer[offset + i] === b);
    if (match) {
      // Extra check for WebP: bytes 8-11 must be "WEBP"
      if (sig.mime === 'image/webp') {
        if (buffer.length < 12) continue;
        const webp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
        if (!webp) continue;
      }
      return sig.mime;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('upload-image', RATE_LIMITS.UPLOAD_IMAGE);
  if (rl) return rl;

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

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'La imagen no debe superar los 5MB' }, { status: 400 });
    }

    // Convert to buffer for magic byte validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Validate actual file content via magic bytes (not trusting client MIME)
    const detectedMime = detectImageType(buffer);
    if (!detectedMime || !ALLOWED_TYPES[detectedMime]) {
      return Response.json(
        { error: 'Formato no soportado. Usa JPG, PNG, WebP o GIF.' },
        { status: 400 }
      );
    }

    // Use validated extension (ignore client-provided extension)
    const ext = ALLOWED_TYPES[detectedMime];
    const fileName = `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `recipes/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, buffer, {
        contentType: detectedMime,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return Response.json(
        { error: 'Error al subir la imagen. Inténtalo de nuevo.' },
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
