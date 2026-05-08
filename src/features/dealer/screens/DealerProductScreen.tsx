import { CategoriesScreen } from '@/features/user/screens/CategoriesScreen';
import type { Screen } from '@/shared/types/navigation';

export function ProductScreen({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void;
  initialCategory?: string;
}) {
  return <CategoriesScreen onNavigate={onNavigate} theme="dealer" actionMode="scan" />;
}
