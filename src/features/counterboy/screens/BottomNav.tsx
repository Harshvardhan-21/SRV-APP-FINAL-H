import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { withWebSafeNativeDriver } from '@/shared/animations/nativeDriver';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';
import type { Screen } from '@/shared/types/navigation';
import { useResponsive } from '@/shared/hooks';
import { useAppData } from '@/shared/context/AppDataContext';
import {
  getAllowedBottomNavScreens,
  resolveRolePageControls,
} from '@/shared/config/rolePageControls';
import { counterboyTheme as cb } from '@/features/counterboy/theme';

const CB_PRIMARY = cb.primary;
const CB_DARK = cb.primaryDeep;

type NavControlConfig = {
  id: Screen;
  label: string;
  testID: string;
  accessibilityLabel: string;
};

function HomeIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M9 21V12h6v9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProductIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function WalletIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="13" rx="2.4" stroke={color} strokeWidth={2} />
      <Path d="M15.5 11.5H21V16h-5.5a2.25 2.25 0 010-4.5z" stroke={color} strokeWidth={2} />
      <Circle cx="16.8" cy="13.75" r="1.05" fill={color} />
      <Path d="M7 6V4.8A1.8 1.8 0 018.8 3h7.7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ProfileIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8.2" r="3.5" stroke={color} strokeWidth={2} />
      <Path d="M5 19.2c1.52-3.02 4.12-4.53 7-4.53 2.88 0 5.48 1.5 7 4.53" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function NavTab({ id, label, active, onPress, testID, accessibilityLabel, compact = false }: {
  id: Screen; label: string; active: boolean; onPress: () => void;
  testID: string; accessibilityLabel: string; compact?: boolean;
}) {
  const iconColor = active ? CB_PRIMARY : cb.muted;
  const tabScale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(tabScale, withWebSafeNativeDriver({ toValue: 0.82, duration: 70 })),
      Animated.spring(tabScale, withWebSafeNativeDriver({ toValue: 1, tension: 200, friction: 7 })),
    ]).start();
    onPress();
  };

  const renderIcon = () => {
    const iconSize = compact ? 20 : 24;
    switch (id) {
      case 'home':    return <HomeIcon color={iconColor} size={iconSize} />;
      case 'product': return <ProductIcon color={iconColor} size={iconSize} />;
      case 'wallet':  return <WalletIcon color={iconColor} size={iconSize} />;
      case 'profile': return <ProfileIcon color={iconColor} size={iconSize} />;
      default:        return null;
    }
  };

  return (
    <Pressable onPress={handlePress} testID={testID} accessible accessibilityRole="button"
      accessibilityLabel={accessibilityLabel} accessibilityState={{ selected: active }}
      style={[styles.tab, compact && styles.tabCompact]}
    >
      <Animated.View style={[styles.iconWrap, compact && styles.iconWrapCompact, { transform: [{ scale: tabScale }] }]}>
        {renderIcon()}
      </Animated.View>
      <Text style={[styles.label, active && styles.labelActive, compact && styles.labelCompact]}>{label}</Text>
    </Pressable>
  );
}

const LEFT: NavControlConfig[] = [
  { id: 'home',    label: 'Home',    testID: 'cb-bottom-nav-home',    accessibilityLabel: 'Counter boy bottom navigation home' },
  { id: 'product', label: 'Product', testID: 'cb-bottom-nav-product', accessibilityLabel: 'Counter boy bottom navigation product' },
];
const RIGHT: NavControlConfig[] = [
  { id: 'wallet',  label: 'Wallet',  testID: 'cb-bottom-nav-wallet',  accessibilityLabel: 'Counter boy bottom navigation wallet' },
  { id: 'profile', label: 'Account', testID: 'cb-bottom-nav-profile', accessibilityLabel: 'Counter boy bottom navigation profile' },
];

export function BottomNav({ currentScreen, onNavigate }: { currentScreen: Screen; onNavigate: (screen: Screen) => void }) {
  const { darkMode, tx } = usePreferenceContext();
  const { appSettings } = useAppData();
  const insets = useSafeAreaInsets();
  const { wp, isSmallDevice, isShortDevice } = useResponsive();
  const rolePageControls = useMemo(
    () => resolveRolePageControls(appSettings?.rolePageControls),
    [appSettings?.rolePageControls]
  );
  const allowedScreens = useMemo(
    () => new Set(getAllowedBottomNavScreens(rolePageControls, 'counterboy', ['home', 'product', 'wallet', 'profile'])),
    [rolePageControls]
  );
  const bottomPad = isShortDevice ? Math.max(insets.bottom, 4) : isSmallDevice ? Math.max(insets.bottom, 6) : Math.max(insets.bottom, 8);
  const topPad = isShortDevice ? 6 : 10;
  const navItems = useMemo(
    () => [...LEFT, ...RIGHT].filter((item) => allowedScreens.has(item.id)),
    [allowedScreens]
  );

  return (
    <View style={[styles.wrap, darkMode ? styles.wrapDark : null, { paddingBottom: bottomPad, paddingTop: topPad, paddingHorizontal: wp(8), minHeight: isShortDevice ? 52 : 54 }]}>
      {navItems.map((item) => (
        <NavTab key={item.id} id={item.id} label={tx(item.label)} active={currentScreen === item.id}
          onPress={() => onNavigate(item.id)} testID={item.testID} accessibilityLabel={item.accessibilityLabel} compact={isShortDevice} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFDFC', borderTopWidth: 1, borderTopColor: '#E0D0C0',
    ...createShadow({ color: '#6F4E37', offsetY: -4, blur: 14, opacity: 0.08, elevation: 12 }),
  },
  wrapDark: { backgroundColor: cb.darkBg, borderTopColor: cb.darkBorder, ...createShadow({ color: '#020617', offsetY: -4, blur: 14, opacity: 0.08, elevation: 12 }) },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minWidth: 50 },
  tabCompact: { minWidth: 44 },
  iconWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  iconWrapCompact: { width: 20, height: 20 },
  label: { fontSize: 9, fontWeight: '600', color: cb.muted, marginTop: 2 },
  labelCompact: { fontSize: 8, marginTop: 1 },
  labelActive: { color: CB_PRIMARY, fontWeight: '800' },
});
