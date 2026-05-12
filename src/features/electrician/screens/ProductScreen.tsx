import { CategoriesScreen } from '@/features/user/screens/CategoriesScreen';
import type { Screen } from '@/shared/types/navigation';

type ProductTheme = 'electrician' | 'dealer';

export function ProductScreen({
  onNavigate,
  theme = 'electrician',
  initialCategory = 'all',
}: {
  onNavigate: (screen: Screen) => void;
  theme?: ProductTheme;
  initialCategory?: string;
}) {
  return (
    <CategoriesScreen
      onNavigate={onNavigate}
      theme={theme}
      actionMode="scan"
      initialCategory={initialCategory}
    />
  );
}
