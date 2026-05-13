import { ProductScreen as ElectricianProductScreen } from '@/features/electrician/screens/ProductScreen';
import type { Screen } from '@/shared/types/navigation';

export function CategoriesScreen({
  onNavigate,
  onAddToCart,
  initialCategory = 'all',
}: {
  onNavigate: (screen: Screen) => void;
  onAddToCart?: (item: any) => void;
  initialCategory?: string;
}) {
  return (
    <ElectricianProductScreen
      onNavigate={onNavigate}
      initialCategory={initialCategory}
      showBottomBanner={true}
      role="customer"
    />
  );
}
