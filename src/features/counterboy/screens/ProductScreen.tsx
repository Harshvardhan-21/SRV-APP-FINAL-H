import { CategoriesScreen } from '@/features/user/screens/CategoriesScreen';
import type { Screen } from '@/shared/types/navigation';

export function ProductScreen({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void;
}) {
  return <CategoriesScreen onNavigate={onNavigate} theme="counterboy" actionMode="scan" />;
}
