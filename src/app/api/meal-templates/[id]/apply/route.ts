import { NextRequest } from 'next/server';
import { MealTemplateService } from '@/lib/services/meal-template-service';
import { checkRateLimit, checkBodySize } from '@/lib/utils/rate-limit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('meal-templates-apply');
  if (rl) return rl;
  const bs = checkBodySize(request.headers.get('content-length'));
  if (bs) return bs;

  const { id } = await params;

  try {
    const { weekStartDate } = await request.json();
    if (!weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
      return Response.json({ error: 'Fecha de inicio inválida' }, { status: 400 });
    }

    const count = await MealTemplateService.applyToWeek(id, weekStartDate);
    return Response.json({ applied: count });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al aplicar plantilla';
    return Response.json({ error: msg }, { status: 500 });
  }
}
