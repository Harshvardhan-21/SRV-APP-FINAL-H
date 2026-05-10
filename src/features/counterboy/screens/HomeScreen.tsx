import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Image, Linking, Pressable, ScrollView,
  StyleSheet, Text, TouchableOpacity, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useAppData } from '@/shared/context/AppDataContext';
import { useAuth } from '@/shared/context/AuthContext';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';
import { BannerCarousel } from '@/shared/components/BannerCarousel';
import {
  TESTIMONIAL_FALLBACK_COPY,
  getTestimonialTheme,
  TestimonialShowcase,
  type TestimonialItem,
} from '@/shared/components/TestimonialShowcase';
import { WebsitePromoSection } from '@/shared/components/WebsitePromoSection';
import ProfileFlipCard from '@/shared/components/ProfileFlipCard';
import type { Screen } from '@/shared/types/navigation';
import { useCatalogDownload } from '@/shared/hooks';
import { counterboyTheme as cb } from '@/features/counterboy/theme';

const CB_PRIMARY = cb.primary;
const CB_DARK = cb.primaryDeep;
const CB_LIGHT = cb.bg;
const CB_SOFT = cb.soft;

const logoImage = require('../../../../assets/srv logo white.jpeg');

function BellIcon({ color = '#10254A', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 16.5V11a6 6 0 1112 0v5.5l1.2 1.2a.8.8 0 01-.57 1.36H5.37a.8.8 0 01-.57-1.36L6 16.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M10 20a2 2 0 004 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ScanIcon({ color = CB_PRIMARY, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="6" height="6" rx="1.2" stroke={color} strokeWidth={1.8} />
      <Rect x="14" y="4" width="6" height="6" rx="1.2" stroke={color} strokeWidth={1.8} />
      <Rect x="4" y="14" width="6" height="6" rx="1.2" stroke={color} strokeWidth={1.8} />
      <Path d="M14 14h2v2h-2zM18 14h2v6h-6v-2h4v-4z" fill={color} />
    </Svg>
  );
}

function WalletIcon({ color = CB_PRIMARY, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="13" rx="2.4" stroke={color} strokeWidth={1.8} />
      <Path d="M15.5 11.5H21V16h-5.5a2.25 2.25 0 010-4.5z" stroke={color} strokeWidth={1.8} />
      <Circle cx="16.8" cy="13.75" r="1.05" fill={color} />
      <Path d="M7 6V4.8A1.8 1.8 0 018.8 3h7.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function DownloadIcon({ color = '#1D4ED8', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Book/catalog body */}
      <Path d="M4 4.5A1.5 1.5 0 015.5 3H19a1 1 0 011 1v14a1 1 0 01-1 1H5.5A1.5 1.5 0 014 17.5v-13z" stroke={color} strokeWidth={1.7} />
      {/* Spine line */}
      <Path d="M8 3v16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {/* Price tag lines */}
      <Path d="M11 8h6M11 11h6M11 14h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {/* Bottom download arrow */}
      <Path d="M2 20h6M5 17.5v5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.5 21.5L5 23l1.5-1.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProductIcon({ color = CB_PRIMARY, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function WhatsAppIcon({ color = '#1A8F58', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4.25A7.75 7.75 0 005.21 15.7L4 19.75l4.17-1.1A7.75 7.75 0 1012 4.25z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
      <Path d="M9.15 8.95c.18-.4.39-.42.57-.42h.49c.15 0 .36.06.54.46.18.4.6 1.45.66 1.56.06.11.1.24.02.38-.08.15-.13.25-.25.38-.11.13-.24.29-.34.39-.11.11-.22.22-.09.42.13.2.58.95 1.25 1.54.86.76 1.58 1 1.8 1.1.22.1.35.09.48-.07.13-.16.54-.64.68-.86.14-.22.29-.18.48-.11.2.07 1.24.59 1.45.7.21.1.35.16.4.25.05.09.05.54-.13 1.04-.18.51-1.02.98-1.42 1.03-.37.06-.85.09-1.36-.07-.31-.1-.71-.23-1.23-.46-2.15-.94-3.56-3.16-3.67-3.32-.11-.16-.89-1.18-.89-2.25 0-1.07.56-1.6.76-1.82z" fill={color} />
    </Svg>
  );
}

function ChevronRight({ color = CB_PRIMARY, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M6 3.5L10.5 8 6 12.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HomeScreen({
  onNavigate,
  onOpenProductCategory,
  profilePhotoUri,
  hasUnreadNotif = false,
}: {
  onNavigate: (screen: Screen) => void;
  onOpenProductCategory: (category: string) => void;
  profilePhotoUri?: string | null;
  hasUnreadNotif?: boolean;
}) {
  const { darkMode, tx } = usePreferenceContext();
  const { user: authUser } = useAuth();
  const { banners: ctxBanners, testimonials: ctxTestimonials, appSettings } = useAppData();
  const { openCatalog, downloading } = useCatalogDownload();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [apiBannerSlides, setApiBannerSlides] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [supportWhatsapp, setSupportWhatsapp] = useState('918837684004');
  const heroImageHeight = Math.round((width - 28) * 0.56);

  useEffect(() => {
    const filtered = ctxBanners.filter((b) => b.isActive !== false && b.imageUrl);
    const mapped = filtered.map((b) => ({
      image: { uri: b.imageUrl! },
      resizeMode: 'cover' as const,
      backgroundColor: b.bgColor ?? '#1A0000',
    }));
    const uris = mapped.map((b) => b.image.uri);
    Promise.all(uris.map((uri) => Image.prefetch(uri).catch(() => null))).finally(() => {
      setApiBannerSlides(mapped);
    });
  }, [ctxBanners]);

  useEffect(() => {
    if (appSettings?.whatsappNumber) setSupportWhatsapp(appSettings.whatsappNumber);
  }, [appSettings]);

  useEffect(() => {
    if (ctxTestimonials.length > 0) {
      setTestimonials(
        ctxTestimonials.map((t, index) => {
          const themed = getTestimonialTheme(index);
          const fallback = TESTIMONIAL_FALLBACK_COPY[index % TESTIMONIAL_FALLBACK_COPY.length];
          return {
            initials: t.initials ?? t.personName.slice(0, 2).toUpperCase() ?? fallback.initials,
            name: t.personName || fallback.name,
            location: t.location || fallback.location,
            tier: t.tier || fallback.tier,
            yearsWithUs:
              t.yearsConnected != null
                ? `Connected for ${t.yearsConnected} year${t.yearsConnected !== 1 ? 's' : ''}`
                : fallback.yearsWithUs,
            quote: t.quote?.trim() || fallback.quote,
            highlight: t.highlight?.trim() || fallback.highlight,
            colors: themed.colors,
            ring: themed.ring,
            glow: themed.glow,
          };
        })
      );
      return;
    }

    setTestimonials(
      TESTIMONIAL_FALLBACK_COPY.map((item, index) => {
        const themed = getTestimonialTheme(index);
        return { ...item, colors: themed.colors, ring: themed.ring, glow: themed.glow };
      })
    );
  }, [ctxTestimonials]);

  const quickActions = [
    {
      title: tx('Products'),
      sub: tx('Browse catalog'),
      icon: ProductIcon,
      iconColors: [cb.soft, cb.peachSoft] as const,
      iconTint: cb.primary,
      onPress: () => onNavigate('product'),
    },
    {
      title: tx('Product Catalog'),
      sub: tx('Download PDF for latest updated prices'),
      icon: DownloadIcon,
      iconColors: [cb.blushSoft, cb.soft] as const,
      iconTint: cb.primaryDeep,
      onPress: () => openCatalog(appSettings?.catalogPdfUrl),
    },
    {
      title: tx('WhatsApp'),
      sub: tx('Support'),
      icon: WhatsAppIcon,
      iconColors: [cb.successSoft, '#CDE7DB'] as const,
      iconTint: cb.success,
      onPress: () => Linking.openURL(`https://wa.me/${supportWhatsapp}?text=Hello%20SRV%20Team`),
    },
  ];

  const cardW = (width - 28 - 12) / 2;

  return (
    <ScrollView
      style={[styles.screen, darkMode ? styles.screenDark : null]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={darkMode ? cb.heroDark : cb.heroLight}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroShell, { marginTop: -insets.top, paddingTop: 26 + insets.top }]}
      >
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.brandBlock}>
            <View style={[styles.logoWrap, darkMode ? styles.logoWrapDark : null]}>
              <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate('notification')}
            style={[styles.topActionBtn, darkMode ? styles.topActionBtnDark : null]}
            activeOpacity={0.85}
          >
            <View style={[styles.topIconCore, styles.notificationCore, darkMode ? styles.notificationCoreDark : null]}>
              <BellIcon color={darkMode ? '#FDBA74' : '#C2410C'} />
            </View>
            {hasUnreadNotif && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>

        {authUser ? (
          <ProfileFlipCard
            profile={{
              name: authUser?.name ?? '',
              phone: authUser?.phone ?? '',
              dealer_code: authUser?.dealerCode ?? '',
              counterboy_code: authUser?.counterboyCode ?? '',
              town: authUser?.city ?? '',
              district: authUser?.district ?? '',
              state: authUser?.state ?? '',
              address: authUser?.address ?? '',
              electrician_code: authUser?.electricianCode ?? '',
              dealer_name: authUser?.dealerName ?? '',
              dealer_town: authUser?.dealerTown ?? '',
              dealer_phone: authUser?.dealerPhone ?? '',
            }}
            role="counterboy"
            photoUri={profilePhotoUri}
            apiPhotoUri={authUser?.profileImage ?? null}
          />
        ) : null}

        {apiBannerSlides.length > 0 ? (
          <View style={styles.heroBannerWrap}>
            <BannerCarousel slides={apiBannerSlides} height={heroImageHeight} darkMode={darkMode} />
          </View>
        ) : null}
      </LinearGradient>

      <View style={styles.body}>
        {/* Quick Actions */}
        <View style={styles.quickGrid}>
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.title}
                style={[styles.quickCard, darkMode ? styles.quickCardDark : null, { width: cardW }]}
                onPress={item.onPress}
                activeOpacity={0.9}
              >
                <LinearGradient colors={item.iconColors} style={styles.quickIconBox}>
                  <Icon color={item.iconTint} size={24} />
                </LinearGradient>
                <Text style={[styles.quickTitle, darkMode ? styles.quickTitleDark : null]}>{item.title}</Text>
                <Text style={[styles.quickSub, darkMode ? styles.quickSubDark : null]}>{item.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TestimonialShowcase
          eyebrow={tx('Electrician Testimonials')}
          title={tx('What Members Say')}
          subtitle={tx('Trusted feedback from the SRV network')}
          items={testimonials}
          darkMode={darkMode}
        />

        <WebsitePromoSection darkMode={darkMode} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EEF3F8' },
  screenDark: { backgroundColor: cb.darkBg },
  heroShell: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    overflow: 'hidden',
    ...createShadow({ color: CB_PRIMARY, offsetY: 8, blur: 20, opacity: 0.12, elevation: 6 }),
  },
  heroGlowOne: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(232,69,60,0.18)', top: -60, right: -40 },
  heroGlowTwo: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,107,107,0.18)', bottom: -30, left: -20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...createShadow({ color: CB_PRIMARY, offsetY: 2, blur: 8, opacity: 0.12, elevation: 3 }) },
  logoWrapDark: { backgroundColor: cb.darkSurface },
  logoImage: { width: 48, height: 48 },
  topActionBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: CB_LIGHT, alignItems: 'center', justifyContent: 'center', ...createShadow({ color: CB_PRIMARY, offsetY: 2, blur: 6, opacity: 0.1, elevation: 2 }) },
  topActionBtnDark: { backgroundColor: cb.darkSurface },
  topIconCore: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  notificationCore: { backgroundColor: '#FFEDD5' },
  notificationCoreDark: { backgroundColor: 'rgba(194,65,12,0.18)' },
  redDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: CB_PRIMARY, borderWidth: 1.5, borderColor: '#FFFFFF' },
  heroBannerWrap: { marginTop: 8, marginBottom: 4 },
  body: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 120 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  quickCard: {
    borderRadius: 20, backgroundColor: '#FFFFFF', padding: 14,
    ...createShadow({ color: CB_PRIMARY, offsetY: 4, blur: 10, opacity: 0.07, elevation: 3 }),
  },
  quickCardDark: { backgroundColor: cb.darkSurface, borderColor: cb.darkBorder },
  quickIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickTitle: { fontSize: 13, fontWeight: '800', color: cb.text },
  quickTitleDark: { color: cb.darkText },
  quickSub: { marginTop: 3, fontSize: 11, color: cb.muted },
  quickSubDark: { color: cb.darkMuted },
});
