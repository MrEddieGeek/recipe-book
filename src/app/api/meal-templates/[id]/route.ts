import { NextRequest } from 'next/server';
import { MealTemplateService } from '@/lib/services/meal-template-service';
import { checkRateLimit } from '@/lib/utils/rate-limit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('meal-templates');
  if (rl) return rl;

  const { id } = await params;
  const template = await MealTemplateService.getWithItems(id);

  if (!template) {
    return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 });
  }

  return Response.json(template);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('meal-templates');
  if (rl) return rl;

  const { id } = await params;

  try {
    await MealTemplateService.delete(id);
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al eliminar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
