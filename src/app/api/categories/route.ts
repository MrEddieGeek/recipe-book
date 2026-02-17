import { NextRequest } from 'next/server';
import { CategoryService } from '@/lib/services/category-service';
import { checkRateLimit } from '@/lib/utils/rate-limit';

export async function GET() {
  const rl = checkRateLimit('categories');
  if (rl) return rl;

  const categories = await CategoryService.getAll();
  return Response.json(categories);
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('categories');
  if (rl) return rl;

  try {
    const { name, color, icon } = await request.json();
    if (!name || typeof name !== 'string' || name.length > 100) {
      return Response.json({ error: 'Nombre inválido' }, { status: 400 });
    }
    const category = await CategoryService.create(
      name.trim(),
      color || '#3B82F6',
      icon || 'utensils'
    );
    return Response.json(category, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al crear categoría';
    return Response.json({ error: msg }, { status: 500 });
  }
}
