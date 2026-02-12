import Badge from '@/components/ui/Badge';

interface RecipeSourceBadgeProps {
  sourceType: 'manual' | 'api' | 'ai';
  sourceName?: string;
}

export default function RecipeSourceBadge({
  sourceType,
  sourceName,
}: RecipeSourceBadgeProps) {
  const getVariant = (type: 'manual' | 'api' | 'ai') => {
    switch (type) {
      case 'manual':
        return 'default';
      case 'api':
        return 'primary';
      case 'ai':
        return 'success';
    }
  };

  const getLabel = (type: 'manual' | 'api' | 'ai') => {
    if (sourceName) return sourceName;

    switch (type) {
      case 'manual':
        return 'Mi Receta';
      case 'api':
        return 'API';
      case 'ai':
        return 'IA Generada';
    }
  };

  return (
    <Badge variant={getVariant(sourceType)} size="sm">
      {getLabel(sourceType)}
    </Badge>
  );
}
