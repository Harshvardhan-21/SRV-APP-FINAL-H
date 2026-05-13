import { ProductScreen as ElectricianProductScreen } from '@/features/electrician/screens/ProductScreen';
import type { Screen } from '@/shared/types/navigation';

export function ProductScreen({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void;
}) {
  return <ElectricianProductScreen onNavigate={onNavigate} />;
}
