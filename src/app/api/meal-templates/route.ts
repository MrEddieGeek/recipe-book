import { NextRequest } from 'next/server';
import { MealTemplateService } from '@/lib/services/meal-template-service';
import { checkRateLimit, checkBodySize } from '@/lib/utils/rate-limit';

export async function GET() {
  const rl = checkRateLimit('meal-templates');
  if (rl) return rl;

  const templates = await MealTemplateService.getAll();
  return Response.json(templates);
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('meal-templates');
  if (rl) return rl;
  const bs = checkBodySize(request.headers.get('content-length'));
  if (bs) return bs;

  try {
    const body = await request.json();

    if (body.weekStartDate && body.meals) {
      // Save from week
      const template = await MealTemplateService.saveFromWeek(
        body.name || 'Mi Plantilla',
        body.meals,
        body.weekStartDate
      );
      return Response.json(template, { status: 201 });
    }

    // Simple create
    if (!body.name || typeof body.name !== 'string') {
      return Response.json({ error: 'Nombre requerido' }, { status: 400 });
    }
    const template = await MealTemplateService.create(body.name, body.description);
    return Response.json(template, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al crear plantilla';
    return Response.json({ error: msg }, { status: 500 });
  }
}
