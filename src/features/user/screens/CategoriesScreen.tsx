import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '@/shared/context/AppDataContext';
import type { Product as ApiProduct, ProductCategory as ApiProductCategory } from '@/shared/api';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';

type CatalogTheme = 'user' | 'electrician' | 'dealer' | 'counterboy';
type ActionMode = 'cart' | 'scan';
type CatalogLayoutVariant = 'default' | 'classic';

const THEMES: Record<CatalogTheme, {
  primary: string;
  primaryLight: string;
  screenBg: string;
  searchBg: string;
  sectionBg: string;
  cardBorder: string;
  muted: string;
  headerGradient: [string, string, string];
  imageGradient: [string, string, string];
  sidebarSoft: string;
  sidebarBg: string;
  productPanelBg: string;
  headerSoftText: string;
  chipBg: string;
  cardBg: string;
  cardShadow: string;
}> = {
  user: {
    primary: '#173E80',
    primaryLight: '#D6E5FA',
    screenBg: '#DDE7F3',
    searchBg: 'rgba(255,255,255,0.9)',
    sectionBg: '#E8F0FB',
    cardBorder: '#BDD0E7',
    muted: '#55697F',
    headerGradient: ['#183B78', '#355C95', '#7087A8'],
    imageGradient: ['#F7FAFE', '#E3ECF8', '#D1DEEE'],
    sidebarSoft: '#DFEAF8',
    sidebarBg: '#F4F8FD',
    productPanelBg: '#F7FBFF',
    headerSoftText: 'rgba(255,255,255,0.78)',
    chipBg: 'rgba(255,255,255,0.18)',
    cardBg: '#FBFDFF',
    cardShadow: '#2A4365',
  },
  electrician: {
    primary: '#123A78',
    primaryLight: '#DCEBFF',
    screenBg: '#E7EEF8',
    searchBg: 'rgba(248,251,255,0.96)',
    sectionBg: '#EEF4FB',
    cardBorder: '#C7D8EE',
    muted: '#58708C',
    headerGradient: ['#0F2F66', '#1F4E92', '#3C6FB2'],
    imageGradient: ['#FDFEFF', '#EDF4FB', '#DCE7F5'],
    sidebarSoft: '#E3EEFB',
    sidebarBg: '#F7FAFE',
    productPanelBg: '#F9FBFE',
    headerSoftText: 'rgba(234,243,255,0.86)',
    chipBg: 'rgba(255,255,255,0.14)',
    cardBg: '#FFFFFF',
    cardShadow: '#102A63',
  },
  dealer: {
    primary: '#B45309',
    primaryLight: '#FEF7ED',
    screenBg: '#FFFCF7',
    searchBg: 'rgba(255,252,245,0.96)',
    sectionBg: '#FEF7ED',
    cardBorder: '#F3E8D3',
    muted: '#A16207',
    headerGradient: ['#B45309', '#D97706', '#E6A855'],
    imageGradient: ['#FFFDF7', '#FEF7ED', '#F3E8D3'],
    sidebarSoft: '#FEF7ED',
    sidebarBg: '#FFFBF5',
    productPanelBg: '#FFFDF9',
    headerSoftText: 'rgba(255,247,237,0.82)',
    chipBg: 'rgba(255,255,255,0.18)',
    cardBg: '#FFFFFF',
    cardShadow: '#7C2D12',
  },
  counterboy: {
    primary: '#E8453C',
    primaryLight: '#FEE2E2',
    screenBg: '#FFF6F6',
    searchBg: 'rgba(255,245,245,0.96)',
    sectionBg: '#FFF1F2',
    cardBorder: '#FECACA',
    muted: '#9F4A4A',
    headerGradient: ['#E8453C', '#FF6B6B', '#F59E9A'],
    imageGradient: ['#FFF8F8', '#FFF1F2', '#FFE4E6'],
    sidebarSoft: '#FFF1F2',
    sidebarBg: '#FFF8F8',
    productPanelBg: '#FFF9FA',
    headerSoftText: 'rgba(255,245,245,0.84)',
    chipBg: 'rgba(255,255,255,0.18)',
    cardBg: '#FFFFFF',
    cardShadow: '#7F1D1D',
  },
};

const CLASSIC_ELECTRICIAN_THEME = {
  primary: '#173E80',
  primaryLight: '#E7F0FF',
  screenBg: '#EEF3F8',
  searchBg: '#FFFFFF',
  sectionBg: '#FFFFFF',
  cardBorder: '#EEEEF3',
  muted: '#6B7C93',
  headerGradient: ['#EEF3F8', '#EEF3F8', '#EEF3F8'] as [string, string, string],
  imageGradient: ['#FAFBFD', '#E9EEF5', '#D5DEE9'] as [string, string, string],
  sidebarSoft: '#E7F0FF',
  sidebarBg: '#FFFFFF',
  productPanelBg: '#FFFFFF',
  headerSoftText: '#6B7C93',
  chipBg: 'rgba(23,62,128,0.1)',
  cardBg: '#FFFFFF',
  cardShadow: '#1C1E2E',
};

const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  fanbox: 'https://srvelectricals.com/cdn/shop/files/FC_4_17-30.png?v=1757426626&width=320',
  concealedbox: 'https://srvelectricals.com/cdn/shop/files/CRD_PL_3.png?v=1757426566&width=320',
  modular: 'https://srvelectricals.com/cdn/shop/files/3x3_679e5d30-ecf2-446e-9452-354bbf4c4a26.png?v=1757426377&width=320',
  modularbox: 'https://srvelectricals.com/cdn/shop/files/3x3_679e5d30-ecf2-446e-9452-354bbf4c4a26.png?v=1757426377&width=320',
  mcb: 'https://srvelectricals.com/cdn/shop/files/MCB_Box_4_Way_GI.png?v=1757426418&width=320',
  busbar: 'https://srvelectricals.com/cdn/shop/files/Bus_Bar_100A_Super.png?v=1757426672&width=320',
  exhaust: 'https://srvelectricals.com/cdn/shop/files/AP-Turtle-Fan.webp?v=1747938680&width=320',
  led: 'https://srvelectricals.com/cdn/shop/files/FloodLightSleek.png?v=1757426471&width=320',
  changeover: 'https://srvelectricals.com/cdn/shop/files/ACO_100A_FP.png?v=1757426480&width=320',
  mainswitch: 'https://srvelectricals.com/cdn/shop/files/CO_32A_DP_PRM.png?v=1757426515&width=320',
  louver: 'https://srvelectricals.com/cdn/shop/files/Louver_6_inch.png?v=1757426390&width=320',
  axialfan: 'https://srvelectricals.com/cdn/shop/files/AP-Turtle-Fan.webp?v=1747938680&width=320',
  ledflood: 'https://srvelectricals.com/cdn/shop/files/FloodLightLense_533x.png?v=1757426472&width=320',
  conduit: 'https://cdn.shopify.com/s/files/1/0651/4583/1466/files/PVCPipe_d645973b-bd5e-41de-8eb0-53331cce1c19.png?v=1772786167',
  pvcpipe: 'https://cdn.shopify.com/s/files/1/0651/4583/1466/files/PVCPipe_d645973b-bd5e-41de-8eb0-53331cce1c19.png?v=1772786167',
  stabilizer: 'https://srvelectricals.com/cdn/shop/files/VoltageStabilizer.png?v=1757426471&width=320',
  junction: 'https://srvelectricals.com/cdn/shop/files/Junction_Box.png?v=1757426390&width=320',
  boxes: 'https://srvelectricals.com/cdn/shop/files/MCB_Box_4_Way_GI.png?v=1757426418&width=320',
  fans: 'https://srvelectricals.com/cdn/shop/files/AP-Turtle-Fan.webp?v=1747938680&width=320',
};

const CATEGORY_LABELS: Record<string, string> = {
  fanbox: 'Fan Box',
  concealedbox: 'Concealed Box',
  modular: 'Modular Box',
  modularbox: 'Modular Box',
  mcb: 'MCB Box',
  busbar: 'Bus Bar',
  exhaust: 'Exhaust Fan',
  led: 'LED Lights',
  changeover: 'Changeover',
  mainswitch: 'Main Switch',
  louver: 'Louvers',
  axialfan: 'Axial Fan',
  ledflood: 'LED Flood',
  multipin: 'Multi Pin',
  pintop: 'Pin Top',
  conduit: 'Conduit Pipe',
  pvcpipe: 'PVC Pipe',
  stabilizer: 'Voltage Stabilizer',
  junction: 'Junction Box',
  boxes: 'MCB & DB Boxes',
  fans: 'Fans & Ventilation',
};

// Only canonical IDs — aliases merged via CATEGORY_ALIASES
const CATEGORY_ORDER = [
  'fanbox', 'concealedbox', 'modular', 'mcb', 'busbar', 'exhaust', 'led',
  'changeover', 'mainswitch', 'louver', 'multipin', 'pintop',
  'conduit', 'stabilizer', 'junction',
];

type UiCategory = {
  id: string;
  label: string;
  count: number;
  imageUrl: string;
};

type UiProduct = {
  id: string;
  name: string;
  desc: string;
  category: string;
  categoryLabel: string;
  imageUrl: string;
  badge: string;
  tagColor: string;
  tagBg: string;
  searchIndex: string;
};

// Pair of products rendered as one row in the FlatList
type ProductRow = {
  key: string;
  left: UiProduct;
  right: UiProduct | null;
};

function SearchIcon({ size = 18, color = '#9CA3AF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} />
      <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function resolveBadge(product: ApiProduct, theme: CatalogTheme) {
  const badge = product.badge?.trim() || 'Available';
  const normalized = badge.toLowerCase();
  if (normalized.includes('best')) return { badge, tagColor: '#D97706', tagBg: '#FEF3C7' };
  if (normalized.includes('new')) return { badge, tagColor: '#DC2626', tagBg: '#FEE2E2' };
  if (normalized.includes('premium')) return { badge, tagColor: THEMES[theme].primary, tagBg: THEMES[theme].primaryLight };
  return { badge, tagColor: '#059669', tagBg: '#D1FAE5' };
}

// Alias map: normalize duplicate/alias category IDs to a single canonical ID
const CATEGORY_ALIASES: Record<string, string> = {
  modularbox: 'modular',
  pvcpipe: 'conduit',
  axialfan: 'exhaust',
  ledflood: 'led',
  boxes: 'mcb',
  fans: 'exhaust',
};

function sanitizeCategoryKey(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '');
}

function normalizeCategory(id: string): string {
  const sanitized = sanitizeCategoryKey(id);
  return CATEGORY_ALIASES[sanitized] ?? sanitized;
}

function toCategoryCount(value: unknown): number {
  const count = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function prettifyCategoryLabel(id: string): string {
  if (CATEGORY_LABELS[id]) return CATEGORY_LABELS[id];
  return id
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])([0-9])/gi, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapApiProduct(product: ApiProduct, theme: CatalogTheme): UiProduct {
  const { badge, tagColor, tagBg } = resolveBadge(product, theme);
  const normalizedCategory = normalizeCategory(product.category);
  const categoryLabel = CATEGORY_LABELS[normalizedCategory] || prettifyCategoryLabel(normalizedCategory);
  const desc = product.sub || product.description || '';
  const searchIndex = [
    product.name,
    desc,
    badge,
    product.category,
    product.categoryId,
    normalizedCategory,
    categoryLabel,
    product.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return {
    id: product.id,
    name: product.name,
    desc,
    category: normalizedCategory,
    categoryLabel,
    imageUrl:
      product.imageUrl ||
      product.image ||
      DEFAULT_PRODUCT_IMAGES[normalizedCategory] ||
      DEFAULT_PRODUCT_IMAGES[product.category] ||
      DEFAULT_PRODUCT_IMAGES.fanbox,
    badge,
    tagColor,
    tagBg,
    searchIndex,
  };
}

function buildCategories(products: UiProduct[], apiCategories: ApiProductCategory[]): UiCategory[] {
  const countMap = new Map<string, number>();
  products.forEach((product) => {
    const normalizedId = normalizeCategory(product.category);
    if (!normalizedId || normalizedId === 'all') return;
    countMap.set(normalizedId, (countMap.get(normalizedId) ?? 0) + 1);
  });

  const merged = new Map<string, UiCategory>();
  apiCategories.forEach((category) => {
    const rawId = category.categoryId ?? category.slug ?? category.label ?? category.id ?? '';
    const id = normalizeCategory(rawId);
    if (!id || id === 'all') return;

    const count = countMap.get(id) ?? toCategoryCount(category.productCount);
    if (count <= 0) return;

    const label = category.label?.trim() || CATEGORY_LABELS[id] || prettifyCategoryLabel(id);
    const imageUrl =
      category.imageUrl ||
      DEFAULT_PRODUCT_IMAGES[id] ||
      DEFAULT_PRODUCT_IMAGES[normalizeCategory(category.label || '')] ||
      DEFAULT_PRODUCT_IMAGES.fanbox;

    const existing = merged.get(id);
    if (!existing) {
      merged.set(id, { id, label, count, imageUrl });
      return;
    }

    existing.count = Math.max(existing.count, count);
    if (!CATEGORY_LABELS[existing.id] && category.label?.trim()) existing.label = label;
    if (!existing.imageUrl || existing.imageUrl === DEFAULT_PRODUCT_IMAGES.fanbox) existing.imageUrl = imageUrl;
  });

  countMap.forEach((count, id) => {
    if (!merged.has(id)) {
      merged.set(id, {
        id,
        label: CATEGORY_LABELS[id] || prettifyCategoryLabel(id),
        count,
        imageUrl: DEFAULT_PRODUCT_IMAGES[id] || DEFAULT_PRODUCT_IMAGES.fanbox,
      });
    }
  });

  const labelMap = new Map<string, UiCategory>();
  merged.forEach((cat) => {
    const key = normalizeCategory(cat.id || cat.label);
    const existing = labelMap.get(key);
    if (!existing || cat.count > existing.count) labelMap.set(key, cat);
  });

  const deduped = Array.from(labelMap.values()).filter((cat) => cat.count > 0);

  return deduped.sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a.id);
    const bIndex = CATEGORY_ORDER.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

// ─── Memoized product card — only re-renders if its own data changes ──────────
const ProductCard = memo(function ProductCard({
  product,
  cardWidth,
  cardBg,
  borderColor,
  textPrimary,
  textMuted,
  palette,
  actionLabel,
  onAction,
  isClassicElectrician,
}: {
  product: UiProduct;
  cardWidth: number;
  cardBg: string;
  borderColor: string;
  textPrimary: string;
  textMuted: string;
  palette: typeof THEMES['user'];
  actionLabel: string;
  onAction: (product: UiProduct) => void;
  isClassicElectrician?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        isClassicElectrician ? styles.cardClassicElectrician : null,
        { width: cardWidth, backgroundColor: cardBg, borderColor },
      ]}
    >
      <View style={[styles.tag, { backgroundColor: product.tagBg }]}>
        <Text style={[styles.tagText, { color: product.tagColor }]}>{product.badge}</Text>
      </View>
      <LinearGradient
        colors={palette.imageGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.imgWrap, isClassicElectrician ? styles.imgWrapClassicElectrician : null]}
      >
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.img}
          resizeMode="contain"
          // fadeDuration keeps image swap smooth
          fadeDuration={200}
        />
      </LinearGradient>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: textPrimary }]} numberOfLines={2}>{product.name}</Text>
        <Text style={[styles.cardDesc, { color: textMuted }]} numberOfLines={2}>{product.desc || 'SRV product'}</Text>
      </View>
      <Pressable
        style={[
          styles.actionBtn,
          isClassicElectrician ? styles.actionBtnClassicElectrician : null,
          { backgroundColor: palette.primaryLight },
        ]}
        android_ripple={{ color: `${palette.primary}25` }}
        onPress={() => onAction(product)}
      >
        <Text style={[styles.actionBtnText, { color: palette.primary }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
});

// ─── Memoized sidebar item ────────────────────────────────────────────────────
const SidebarItem = memo(function SidebarItem({
  category,
  isActive,
  borderColor,
  palette,
  textMuted,
  darkMode,
  onPress,
  isClassicElectrician,
}: {
  category: UiCategory;
  isActive: boolean;
  borderColor: string;
  palette: typeof THEMES['user'];
  textMuted: string;
  darkMode: boolean;
  onPress: () => void;
  isClassicElectrician?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${palette.primary}15` }}
      style={[
        styles.sidebarItem,
        isClassicElectrician ? styles.sidebarItemClassicElectrician : null,
        { borderBottomColor: borderColor },
        isActive && { backgroundColor: darkMode ? `${palette.primary}30` : palette.sidebarSoft },
      ]}
    >
      {isActive && <View style={[styles.activeBar, { backgroundColor: palette.primary }]} />}
      <View style={[styles.sidebarImageWrap, darkMode ? styles.sidebarImageWrapDark : null]}>
        <Image source={{ uri: category.imageUrl }} style={styles.sidebarImage} resizeMode="contain" fadeDuration={150} />
      </View>
      <Text
        style={[styles.sidebarLabel, { color: isActive ? palette.primary : textMuted }, isActive && { fontWeight: '800' }]}
        numberOfLines={2}
      >
        {category.label}
      </Text>
      <Text style={[styles.sidebarCount, { color: isActive ? palette.primary : textMuted }]}>
        {category.count}
      </Text>
    </Pressable>
  );
});

export function CategoriesScreen({
  onNavigate,
  onAddToCart,
  theme = 'user',
  actionMode,
  initialCategory = 'all',
  layoutVariant = 'default',
}: {
  onNavigate: (screen: any) => void;
  onAddToCart?: (item: any) => void;
  theme?: CatalogTheme;
  actionMode?: ActionMode;
  initialCategory?: string;
  layoutVariant?: CatalogLayoutVariant;
}) {
  const { darkMode, tx } = usePreferenceContext();
  const { products: apiProducts, categories: apiCategories, catalogLoading } = useAppData();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isClassicElectrician = theme === 'electrician' && layoutVariant === 'classic';
  const palette = isClassicElectrician ? CLASSIC_ELECTRICIAN_THEME : THEMES[theme];
  const resolvedActionMode: ActionMode = actionMode ?? (onAddToCart ? 'cart' : 'scan');
  const [selectedCategory, setSelectedCategory] = useState(normalizeCategory(initialCategory) || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const products = useMemo(
    () => apiProducts.map((p) => mapApiProduct(p, theme)),
    [apiProducts, theme],
  );
  const categories = useMemo(
    () => buildCategories(products, apiCategories),
    [products, apiCategories],
  );

  const categoryItems = useMemo(
    () => [{ id: 'all', label: tx('All Products'), count: products.length, imageUrl: DEFAULT_PRODUCT_IMAGES.fanbox }, ...categories],
    [categories, products.length, tx],
  );

  useEffect(() => {
    const nextCategory = normalizeCategory(initialCategory) || 'all';
    setSelectedCategory(nextCategory);
    setSearchQuery('');
  }, [initialCategory]);

  useEffect(() => {
    if (categoryItems.length === 0) return;
    setSelectedCategory((prev) =>
      categoryItems.some((item) => item.id === prev) ? prev : categoryItems[0].id
    );
  }, [categoryItems]);

  const selectedCategoryLabel = useMemo(
    () => categoryItems.find((item) => item.id === selectedCategory)?.label ?? tx('All Products'),
    [categoryItems, selectedCategory, tx],
  );

  const filteredProducts = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    const searchTerms = needle.split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      const matchCategory =
        needle.length > 0 || selectedCategory === 'all' || product.category === selectedCategory;
      const matchSearch =
        searchTerms.length === 0 ||
        searchTerms.every((term) => product.searchIndex.includes(term));
      return matchCategory && matchSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // ── Pair products into rows of 2 for FlatList ─────────────────────────────
  const productRows = useMemo<ProductRow[]>(() => {
    const rows: ProductRow[] = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
      rows.push({
        key: filteredProducts[i].id,
        left: filteredProducts[i],
        right: filteredProducts[i + 1] ?? null,
      });
    }
    return rows;
  }, [filteredProducts]);

  const SIDEBAR_W = 96;
  const cardWidth = isClassicElectrician ? (width - 34) / 2 : (width - SIDEBAR_W - 30) / 2;
  const isElectricianTheme = theme === 'electrician';
  const showElectricianHero = isElectricianTheme && !isClassicElectrician;
  const bg = darkMode ? '#0F172A' : palette.screenBg;
  const cardBg = darkMode ? '#1E293B' : palette.cardBg;
  const borderColor = darkMode ? '#2D3748' : palette.cardBorder;
  const textPrimary = darkMode ? '#F1F5F9' : '#1A1A1A';
  const textMuted = darkMode ? '#94A3B8' : palette.muted;

  const handleProductAction = useCallback((product: UiProduct) => {
    if (resolvedActionMode === 'cart' && onAddToCart) {
      onAddToCart({ id: product.id, name: product.name, desc: product.desc, image: { uri: product.imageUrl }, qty: 1 });
      return;
    }
    onNavigate('scan');
  }, [resolvedActionMode, onAddToCart, onNavigate]);

  const actionLabel = resolvedActionMode === 'cart' ? tx('Add to Cart') : tx('Scan & Earn');

  // ── FlatList renderItem — renders one row (2 cards) ───────────────────────
  const renderProductRow = useCallback(({ item }: { item: ProductRow }) => (
    <View style={styles.row}>
      <ProductCard
        product={item.left}
        cardWidth={cardWidth}
        cardBg={cardBg}
        borderColor={borderColor}
        textPrimary={textPrimary}
        textMuted={textMuted}
        palette={palette}
        actionLabel={actionLabel}
        onAction={handleProductAction}
        isClassicElectrician={isClassicElectrician}
      />
      {item.right ? (
        <ProductCard
          product={item.right}
          cardWidth={cardWidth}
          cardBg={cardBg}
          borderColor={borderColor}
          textPrimary={textPrimary}
          textMuted={textMuted}
          palette={palette}
          actionLabel={actionLabel}
          onAction={handleProductAction}
          isClassicElectrician={isClassicElectrician}
        />
      ) : (
        <View style={{ width: cardWidth }} />
      )}
    </View>
  ), [cardWidth, cardBg, borderColor, textPrimary, textMuted, palette, actionLabel, handleProductAction]);

  const keyExtractor = useCallback((item: ProductRow) => item.key, []);

  // ── Sidebar FlatList renderItem ───────────────────────────────────────────
  const renderSidebarItem = useCallback(({ item }: { item: UiCategory }) => (
    <SidebarItem
      category={item}
      isActive={selectedCategory === item.id}
      borderColor={borderColor}
      palette={palette}
      textMuted={textMuted}
      darkMode={darkMode}
      isClassicElectrician={isClassicElectrician}
      onPress={() => setSelectedCategory(item.id)}
    />
  ), [selectedCategory, borderColor, palette, textMuted, darkMode, isClassicElectrician]);

  const sidebarKeyExtractor = useCallback((item: UiCategory) => item.id, []);

  const renderClassicCategoryChip = useCallback(({ item }: { item: UiCategory }) => (
    <Pressable
      onPress={() => setSelectedCategory(item.id)}
      android_ripple={{ color: `${palette.primary}18` }}
      style={[
        styles.classicCategoryChip,
        {
          borderColor: selectedCategory === item.id ? palette.primary : borderColor,
          backgroundColor: selectedCategory === item.id ? palette.sidebarSoft : '#FFFFFF',
        },
      ]}
    >
      <Text
        style={[
          styles.classicCategoryChipText,
          { color: selectedCategory === item.id ? palette.primary : textMuted },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      <Text
        style={[
          styles.classicCategoryChipCount,
          { color: selectedCategory === item.id ? palette.primary : textMuted },
        ]}
      >
        {item.count}
      </Text>
    </Pressable>
  ), [borderColor, palette.primary, palette.sidebarSoft, selectedCategory, textMuted]);

  // ── Section header for product FlatList ──────────────────────────────────
  const ListHeader = useMemo(() => (
    <View style={[styles.sectionHead, showElectricianHero ? styles.sectionHeadElectrician : null, isClassicElectrician ? styles.sectionHeadClassicElectrician : null, { borderBottomColor: borderColor, backgroundColor: darkMode ? '#162132' : palette.sectionBg }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>{selectedCategoryLabel}</Text>
        <Text style={[styles.sectionCount, { color: textMuted }]}>
          {catalogLoading && products.length === 0 ? tx('Loading products...') : `${filteredProducts.length} ${tx('products')}`}
        </Text>
      </View>
      {showElectricianHero ? (
        <View style={[styles.liveChip, { backgroundColor: darkMode ? 'rgba(30,64,175,0.28)' : '#E3EEFB', borderColor }]}>
          <Text style={[styles.liveChipText, { color: palette.primary }]}>SRV Pro</Text>
        </View>
      ) : null}
      {isClassicElectrician ? (
        <FlatList
          data={categoryItems}
          keyExtractor={sidebarKeyExtractor}
          renderItem={renderClassicCategoryChip}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classicCategoryStrip}
        />
      ) : null}
    </View>
  ), [borderColor, darkMode, palette.sectionBg, palette.primary, textPrimary, textMuted, selectedCategoryLabel, catalogLoading, products.length, filteredProducts.length, tx, showElectricianHero, isClassicElectrician, categoryItems, sidebarKeyExtractor, renderClassicCategoryChip]);

  const ListEmpty = useMemo(() => (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={[styles.emptyText, { color: textMuted }]}>{tx('No products found')}</Text>
    </View>
  ), [textMuted, tx]);

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      {/* Header */}
      <LinearGradient
        style={[
          styles.header,
          showElectricianHero ? styles.headerElectrician : null,
          isClassicElectrician ? styles.headerClassicElectrician : null,
          {
            paddingTop: isClassicElectrician ? insets.top - 2 : insets.top + 8,
            ...createShadow({ color: palette.primary, offsetY: showElectricianHero ? 8 : 3, blur: showElectricianHero ? 18 : 10, opacity: showElectricianHero ? 0.24 : 0.12, elevation: showElectricianHero ? 10 : 4 }),
          },
        ]}
        colors={darkMode ? ['#0F172A', '#162132', '#1E293B'] : palette.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {showElectricianHero ? (
          <>
            <Text style={[styles.headerEyebrow, { color: palette.headerSoftText }]}>ELECTRICIAN CATALOG</Text>
            <View style={styles.headerTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{tx('All Categories')}</Text>
                <Text style={[styles.headerSubtitle, { color: palette.headerSoftText }]}>
                  Premium SRV products curated for faster selection and scanning.
                </Text>
              </View>
              <View style={styles.headerStatsWrap}>
                <View style={[styles.headerStatChip, { backgroundColor: palette.chipBg }]}>
                  <Text style={styles.headerStatValue}>{categoryItems.length - 1}</Text>
                  <Text style={styles.headerStatLabel}>{tx('categories')}</Text>
                </View>
                <View style={[styles.headerStatChip, { backgroundColor: palette.chipBg }]}>
                  <Text style={styles.headerStatValue}>{products.length}</Text>
                  <Text style={styles.headerStatLabel}>{tx('products')}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <Text style={[styles.headerTitle, isClassicElectrician ? styles.headerTitleClassicElectrician : null]}>{tx('All Categories')}</Text>
        )}
        <View style={[styles.searchRow, showElectricianHero ? styles.searchRowElectrician : null, isClassicElectrician ? styles.searchRowClassicElectrician : null, { backgroundColor: palette.searchBg }]}>
          <SearchIcon size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={tx('Search SRV products...')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <View style={[styles.body, isClassicElectrician ? styles.bodyClassicElectrician : null]}>
        {/* Sidebar — virtualized FlatList */}
        {isClassicElectrician ? null : (
          <View style={[styles.sidebar, showElectricianHero ? styles.sidebarElectrician : null, { width: SIDEBAR_W, backgroundColor: darkMode ? '#1E293B' : palette.sidebarBg, borderRightColor: borderColor }]}>
            <FlatList
              data={categoryItems}
              keyExtractor={sidebarKeyExtractor}
              renderItem={renderSidebarItem}
              showsVerticalScrollIndicator={false}
              bounces={false}
              initialNumToRender={12}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews
            />
          </View>
        )}

        {/* Products — virtualized FlatList with row pairs */}
        <FlatList
          style={[styles.productsArea, isClassicElectrician ? styles.productsAreaClassicElectrician : null, { backgroundColor: darkMode ? '#0F172A' : palette.productPanelBg }]}
          data={productRows}
          keyExtractor={keyExtractor}
          renderItem={renderProductRow}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={<View style={{ height: 110 }} />}
          contentContainerStyle={styles.productsContent}
          showsVerticalScrollIndicator={false}
          // Lazy loading config — render 4 rows (8 cards) first, load more as user scrolls
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={30}
          windowSize={7}
          removeClippedSubviews
          // Reset scroll to top when category changes
          extraData={selectedCategory}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 14, paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerElectrician: { paddingBottom: 18, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerClassicElectrician: { paddingHorizontal: 12, paddingBottom: 6, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  headerEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 },
  headerTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 10, letterSpacing: 0.2 },
  headerTitleClassicElectrician: { color: '#1C1E2E', marginBottom: 6, textAlign: 'center', fontSize: 20, fontWeight: '800' },
  headerSubtitle: { fontSize: 12.5, lineHeight: 18, fontWeight: '600', paddingRight: 8 },
  headerStatsWrap: { gap: 8 },
  headerStatChip: { minWidth: 76, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 9, alignItems: 'center' },
  headerStatValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  headerStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', marginTop: 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  searchRowElectrician: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  searchRowClassicElectrician: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E7FF',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#1E293B', padding: 0, fontWeight: '500' },
  body: { flex: 1, flexDirection: 'row' },
  bodyClassicElectrician: { flexDirection: 'column' },
  sidebar: { borderRightWidth: 1 },
  sidebarElectrician: { marginTop: 10, marginLeft: 10, marginBottom: 12, borderRadius: 22, overflow: 'hidden', borderWidth: 1 },
  sidebarItem: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    position: 'relative',
    minHeight: 98,
    justifyContent: 'center',
    gap: 4,
  },
  sidebarItemClassicElectrician: { minHeight: 92, paddingHorizontal: 8 },
  activeBar: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 4, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  sidebarImageWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#ECF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sidebarImageWrapDark: { backgroundColor: '#162132' },
  sidebarImage: { width: 36, height: 36 },
  sidebarLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 13 },
  sidebarCount: { fontSize: 10, fontWeight: '700' },
  productsArea: { flex: 1 },
  productsAreaClassicElectrician: { flex: 1, paddingHorizontal: 10 },
  productsContent: { padding: 10, gap: 8 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderRadius: 18,
  },
  sectionHeadElectrician: {
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 20,
  },
  sectionHeadClassicElectrician: {
    marginBottom: 8,
    paddingHorizontal: 2,
    paddingTop: 0,
    paddingBottom: 8,
    borderRadius: 0,
  },
  classicCategoryStrip: { paddingTop: 8 },
  classicCategoryChip: {
    minWidth: 92,
    maxWidth: 148,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  classicCategoryChipText: { fontSize: 12, fontWeight: '800' },
  classicCategoryChipCount: { fontSize: 10, fontWeight: '700', marginTop: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '900' },
  sectionCount: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  liveChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'center' },
  liveChipText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  // Row holds 2 cards side by side
  row: { flexDirection: 'row', gap: 10 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...createShadow({ color: '#2A4365', offsetY: 6, blur: 16, opacity: 0.1, elevation: 4 }),
  },
  cardClassicElectrician: {
    borderRadius: 20,
    ...createShadow({ color: '#1C1E2E', offsetY: 8, blur: 18, opacity: 0.08, elevation: 3 }),
  },
  tag: { alignSelf: 'flex-start', margin: 9, marginBottom: 0, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 9, fontWeight: '800' },
  imgWrap: {
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginHorizontal: 8,
    borderRadius: 14,
  },
  imgWrapClassicElectrician: { height: 122, marginTop: 8, marginHorizontal: 10, borderRadius: 18 },
  img: { width: '100%', height: '100%' },
  cardInfo: { paddingHorizontal: 10, paddingBottom: 8, paddingTop: 2 },
  cardName: { fontSize: 12, fontWeight: '800', lineHeight: 16, marginBottom: 3 },
  cardDesc: { fontSize: 10, lineHeight: 14 },
  actionBtn: { marginHorizontal: 10, marginBottom: 12, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  actionBtnClassicElectrician: { marginHorizontal: 12, borderRadius: 14, paddingVertical: 10 },
  actionBtnText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.2 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, fontWeight: '600' },
});
