import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, C } from '@/features/profile/components/ProfileShared';
import {
  supportsNativeAnimatedDriver,
  withWebSafeNativeDriver,
} from '@/shared/animations/nativeDriver';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';

interface GetStartedScreenProps {
  onComplete: (role: 'electrician' | 'dealer' | 'user') => void;
}

// Animated product ticker — cycles through real SRV products inside the stat card
const PRODUCTS = [
  { label: 'Fan Box', color: '#E8453C', bg: '#FEE2E2' },
  { label: 'Concealed Box', color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Module Box', color: '#2563EB', bg: '#DBEAFE' },
  { label: 'Junction Box', color: '#059669', bg: '#D1FAE5' },
  { label: 'Change Over', color: '#D97706', bg: '#FEF3C7' },
  { label: 'Bus Bar', color: '#0891B2', bg: '#CFFAFE' },
  { label: 'Axial Fans', color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Kitchen Fan', color: '#E8453C', bg: '#FEE2E2' },
  { label: 'LED Flood Light', color: '#059669', bg: '#D1FAE5' },
  { label: '5 Pin Multi Plug', color: '#2563EB', bg: '#DBEAFE' },
  { label: '2 Pin Tops', color: '#D97706', bg: '#FEF3C7' },
  { label: 'MCB Box', color: '#0891B2', bg: '#CFFAFE' },
  { label: 'Switch Board', color: '#E8453C', bg: '#FEE2E2' },
  { label: 'Ceiling Rose', color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Batten Holder', color: '#059669', bg: '#D1FAE5' },
  { label: 'Extension Board', color: '#2563EB', bg: '#DBEAFE' },
  { label: 'Surface Box', color: '#D97706', bg: '#FEF3C7' },
  { label: 'Conduit Box', color: '#0891B2', bg: '#CFFAFE' },
  { label: 'Weatherproof Box', color: '#E8453C', bg: '#FEE2E2' },
  { label: 'Round Box', color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Modular Plate', color: '#059669', bg: '#D1FAE5' },
  { label: 'Cable Clip', color: '#2563EB', bg: '#DBEAFE' },
  { label: 'PVC Casing', color: '#D97706', bg: '#FEF3C7' },
  { label: 'Exhaust Fan', color: '#0891B2', bg: '#CFFAFE' },
  { label: 'Industrial Plug', color: '#E8453C', bg: '#FEE2E2' },
];

function ProductTickerCard() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [bgIdx, setBgIdx] = useState(0); // bg changes after name exits
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled) return;
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: supportsNativeAnimatedDriver }),
        Animated.timing(slideAnim, { toValue: -8, duration: 200, useNativeDriver: supportsNativeAnimatedDriver }),
      ]).start(() => {
        if (cancelled) return;
        const next = (activeIdx + 1) % PRODUCTS.length;
        setActiveIdx(next);
        setBgIdx(next);
        slideAnim.setValue(8);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: supportsNativeAnimatedDriver }),
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: supportsNativeAnimatedDriver, tension: 70, friction: 9 }),
        ]).start();
      });
    }, 1800);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeIdx, fadeAnim, slideAnim]);

  const product = PRODUCTS[activeIdx];
  const bgProduct = PRODUCTS[bgIdx];

  return (
    <View style={[tickerCardStyles.card, { backgroundColor: bgProduct.bg }]}>
      {/* Pinned to top — never moves */}
      <Text style={[tickerCardStyles.ourProducts, { color: bgProduct.color }]}>
        Our Products
      </Text>
      {/* Centered in remaining space — only this animates */}
      <View style={tickerCardStyles.nameWrap}>
        <Animated.Text
          style={[
            tickerCardStyles.label,
            { color: product.color, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
          numberOfLines={2}
        >
          {product.label}
        </Animated.Text>
      </View>
    </View>
  );
}

const tickerCardStyles = StyleSheet.create({
  card: {
    flex: 1.6,
    borderRadius: 12,
    minHeight: 56,
    overflow: 'hidden',
    paddingTop: 5,
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  ourProducts: {
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.7,
    textAlign: 'center',
  },
  nameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export function GetStartedScreen({ onComplete }: GetStartedScreenProps) {
  const { tx, theme, darkMode } = usePreferenceContext();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth <= 360;
  const isMediumScreen = screenWidth > 360 && screenWidth <= 768;
  const isCompactScreen = screenWidth <= 380;
  const bottomSectionPaddingBottom = isSmallScreen ? 18 : isMediumScreen ? 24 : 28;
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAudience, setSelectedAudience] = useState<'user' | 'dealer' | 'electrician' | null>(
    null
  );
  const scrollX = useRef(new Animated.Value(0)).current;

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Individual sparkle animations (from file 1)
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const sparkle4 = useRef(new Animated.Value(0)).current;
  const sparkle5 = useRef(new Animated.Value(0)).current;
  const sparkle6 = useRef(new Animated.Value(0)).current;
  const sparkle7 = useRef(new Animated.Value(0)).current;
  const sparkle8 = useRef(new Animated.Value(0)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  const totalSlides = 4;

  // One-time entry animation
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    logoScale.setValue(0.8);
    logoOpacity.setValue(0);

    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: supportsNativeAnimatedDriver,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: supportsNativeAnimatedDriver,
        tension: 55,
        friction: 9,
      }),
    ];

    animations.push(
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: supportsNativeAnimatedDriver,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: supportsNativeAnimatedDriver,
      })
    );

    Animated.parallel(animations).start();
  }, [fadeAnim, logoOpacity, logoScale, slideAnim]);

  // Individual sparkle animations (from file 1)
  useEffect(() => {
    let rotateAnimLoop: Animated.CompositeAnimation | null = null;
    const sparkleAnims: Animated.CompositeAnimation[] = [];

    if (currentIndex === 0) {
      sparkleRotate.setValue(0);
      rotateAnimLoop = Animated.loop(
        Animated.timing(
          sparkleRotate,
          withWebSafeNativeDriver({
            toValue: 1,
            duration: 4000,
          })
        )
      );
      rotateAnimLoop.start();

      const makeSparkleAnim = (
        sparkle: Animated.Value,
        delay: number,
        duration: number = 1200
      ): Animated.CompositeAnimation => {
        sparkle.setValue(0);
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(
              sparkle,
              withWebSafeNativeDriver({
                toValue: 1,
                duration: duration * 0.5,
              })
            ),
            Animated.timing(
              sparkle,
              withWebSafeNativeDriver({
                toValue: 0,
                duration: duration * 0.5,
              })
            ),
          ])
        );
      };

      sparkleAnims.push(makeSparkleAnim(sparkle1, 0, 1200));
      sparkleAnims.push(makeSparkleAnim(sparkle2, 150, 1000));
      sparkleAnims.push(makeSparkleAnim(sparkle3, 300, 1100));
      sparkleAnims.push(makeSparkleAnim(sparkle4, 450, 900));
      sparkleAnims.push(makeSparkleAnim(sparkle5, 200, 1300));
      sparkleAnims.push(makeSparkleAnim(sparkle6, 350, 1400));
      sparkleAnims.push(makeSparkleAnim(sparkle7, 100, 800));
      sparkleAnims.push(makeSparkleAnim(sparkle8, 400, 1100));

      sparkleAnims.forEach((anim) => anim.start());
    }

    return () => {
      if (rotateAnimLoop) rotateAnimLoop.stop();
      sparkleAnims.forEach((anim) => anim.stop());
    };
  }, [
    currentIndex,
    sparkle1,
    sparkle2,
    sparkle3,
    sparkle4,
    sparkle5,
    sparkle6,
    sparkle7,
    sparkle8,
    sparkleRotate,
  ]);

  const handleMomentumScrollEnd = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / screenWidth);
    if (index !== currentIndex && index >= 0 && index < totalSlides) {
      setCurrentIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  };

  const handleRoleSelect = (audience: 'user' | 'dealer' | 'electrician') => {
    setSelectedAudience(audience);
    if (audience === 'user') {
      goToSlide(1);
      return;
    }

    goToSlide(audience === 'dealer' ? 2 : 3);
  };

  const handleContinue = () => {
    if (currentIndex === 2) {
      onComplete('dealer');
      return;
    }

    if (currentIndex === 3) {
      onComplete('electrician');
    }
  };

  const slideGradients = [
    { start: '#E8453C', end: '#FF6B6B', icon: 'star' as const },
    { start: '#2563EB', end: '#60A5FA', icon: 'star' as const },
    { start: '#7C3AED', end: '#A78BFA', icon: 'refer' as const },
    { start: '#059669', end: '#34D399', icon: 'redeem' as const },
  ];

  const currentGradient = slideGradients[currentIndex];

  useEffect(() => {
    if (currentIndex !== 1 || selectedAudience !== 'user') {
      return;
    }

    const timer = setTimeout(() => {
      onComplete('user');
    }, 1100);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete, selectedAudience]);

  const showContinueButton = currentIndex === 2 || currentIndex === 3;

  // --- Slide 1: Individual animated sparkles from file 1, content from file 2 ---
  const Slide1 = () => {
    const rotate = sparkleRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const sparkleValues = [
      sparkle1,
      sparkle2,
      sparkle3,
      sparkle4,
      sparkle5,
      sparkle6,
      sparkle7,
      sparkle8,
    ];

    const dotSparkleData = [
      { size: 12, color: C.gold, pos: styles.sparkleTopLeft },
      { size: 8, color: C.primary, pos: styles.sparkleTopRight },
      { size: 10, color: C.teal, pos: styles.sparkleBottomLeft },
      { size: 6, color: C.gold, pos: styles.sparkleBottomRight },
      { size: 9, color: C.primary, pos: styles.sparkleLeft },
      { size: 7, color: C.teal, pos: styles.sparkleRight },
      { size: 8, color: C.gold, pos: styles.sparkleTop },
      { size: 6, color: C.primary, pos: styles.sparkleBottom },
    ];

    const starSparkleData = [
      { color: C.gold, pos: styles.starTopLeft, sparkleIdx: 0 },
      { color: C.primary, pos: styles.starTopRight, sparkleIdx: 1 },
      { color: C.teal, pos: styles.starBottomLeft, sparkleIdx: 2 },
      { color: C.gold, pos: styles.starBottomRight, sparkleIdx: 3 },
    ];

    return (
      <View>
        <View style={[styles.cardHeader, { backgroundColor: '#FFFFFF' }]}>
          <Animated.View
            style={{
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            }}
          >
            <Animated.View style={styles.logoGlow}>
              <Image
                source={require('../../../assets/srv-login-logo.png')}
                style={styles.cardLogo}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>

          {/* Dot sparkles */}
          {dotSparkleData.map((item, i) => {
            const scale = sparkleValues[i];
            return (
              <Animated.View
                key={`dot-sparkle-${i}`}
                style={[
                  {
                    position: 'absolute',
                    width: item.size,
                    height: item.size,
                    borderRadius: item.size / 2,
                    backgroundColor: item.color,
                  },
                  item.pos,
                  {
                    opacity: scale,
                    transform: [{ rotate }, { scale }],
                  },
                ]}
              />
            );
          })}

          {/* Star sparkles */}
          {starSparkleData.map((item, i) => {
            const scale = sparkleValues[item.sparkleIdx];
            return (
              <Animated.View
                key={`star-sparkle-${i}`}
                style={[
                  { position: 'absolute' },
                  item.pos,
                  {
                    opacity: scale,
                    transform: [{ rotate }, { scale }],
                  },
                ]}
              >
                <Text style={[styles.starText, { color: item.color }]}>✦</Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Content from file 2 */}
        <View style={styles.cardBody}>
          <View style={styles.tricolorWrapper}>
            <View style={styles.tricolorContainer}>
              <View style={[styles.tricolorBar, { backgroundColor: '#FF9933' }]} />
              <View style={[styles.tricolorBar, { backgroundColor: '#FFFFFF' }]} />
              <View style={[styles.tricolorBar, { backgroundColor: '#138808' }]} />
            </View>
          </View>

          <Text style={[styles.welcomeText, { color: C.primary }]}>{tx('Welcome to SRV')}</Text>
          <Text style={[styles.sinceText, { color: theme.textPrimary }]}>
            {tx('North India Largest')}
          </Text>

          <View style={styles.roleSelectorWrap}>
            {/* Animated "Choose your profile" heading */}
            <View style={styles.roleSelectorTitleRow}>
              <View style={[styles.roleSelectorTitleLine, { backgroundColor: C.primary }]} />
              <Text style={[styles.roleSelectorTitle, { color: theme.textPrimary }]}>
                {tx('Choose your profile')}
              </Text>
              <View style={[styles.roleSelectorTitleLine, { backgroundColor: C.primary }]} />
            </View>
            <View style={styles.roleSelectorRow}>
              {(
                [
                  {
                    key: 'user' as const,
                    label: tx('User'),
                    sub: tx('Browse products'),
                    image: require('../../../assets/user.png'),
                    color: '#2563EB',
                    bg: '#EFF6FF',
                    activeBg: '#DBEAFE',
                    border: '#93C5FD',
                  },
                  {
                    key: 'dealer' as const,
                    label: tx('Dealer'),
                    sub: tx('Manage network'),
                    image: require('../../../assets/new dealer.png'),
                    color: '#7C3AED',
                    bg: '#F5F3FF',
                    activeBg: '#EDE9FE',
                    border: '#C4B5FD',
                  },
                  {
                    key: 'electrician' as const,
                    label: tx('Electrician'),
                    sub: tx('Scan & earn'),
                    image: require('../../../assets/new electrician.png'),
                    color: '#059669',
                    bg: '#ECFDF5',
                    activeBg: '#D1FAE5',
                    border: '#6EE7B7',
                  },
                ] as const
              ).map((role, idx) => {
                const isActive = selectedAudience === role.key;
                const scaleAnim = useRef(new Animated.Value(1)).current;
                const entryAnim = useRef(new Animated.Value(0)).current;
                const entrySlide = useRef(new Animated.Value(20)).current;

                useEffect(() => {
                  Animated.parallel([
                    Animated.timing(entryAnim, {
                      toValue: 1,
                      duration: 400,
                      delay: 120 + idx * 100,
                      useNativeDriver: supportsNativeAnimatedDriver,
                    }),
                    Animated.spring(entrySlide, {
                      toValue: 0,
                      delay: 120 + idx * 100,
                      useNativeDriver: supportsNativeAnimatedDriver,
                      tension: 60,
                      friction: 9,
                    }),
                  ]).start();
                }, [entryAnim, entrySlide]);

                const handlePressIn = () => {
                  Animated.spring(scaleAnim, {
                    toValue: 0.93,
                    useNativeDriver: supportsNativeAnimatedDriver,
                    tension: 120,
                    friction: 8,
                  }).start();
                };
                const handlePressOut = () => {
                  Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: supportsNativeAnimatedDriver,
                    tension: 80,
                    friction: 6,
                  }).start();
                };

                return (
                  <Pressable
                    key={role.key}
                    onPress={() => handleRoleSelect(role.key)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={{ flex: 1 }}
                  >
                    <Animated.View
                      style={{
                        transform: [{ scale: scaleAnim }, { translateY: entrySlide }],
                        opacity: entryAnim,
                      }}
                    >
                      <View
                        style={[
                          styles.roleCard,
                          {
                            borderColor: isActive ? role.color : role.border,
                            borderWidth: isActive ? 2 : 1,
                          },
                        ]}
                      >
                        <Image
                          source={role.image}
                          style={[
                            styles.roleCardImage,
                            role.key === 'electrician' && styles.roleCardImageCover,
                          ]}
                          resizeMode="cover"
                        />
                        {isActive && (
                          <View style={[styles.roleCardCheck, { backgroundColor: role.color }]}>
                            <Text style={styles.roleCardCheckText}>✓</Text>
                          </View>
                        )}
                      </View>

                      {/* Stylish label below card */}
                      <View style={styles.roleCardLabelWrap}>
                        <View
                          style={[
                            styles.roleCardPill,
                            {
                              backgroundColor: isActive ? role.color : role.bg,
                              borderColor: isActive ? role.color : role.border,
                            },
                          ]}
                        >
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={[styles.roleCardLabel, { color: isActive ? '#fff' : role.color }]}
                          >
                            {role.label}
                          </Text>
                        </View>
                        <Text style={[styles.roleCardSub, { color: isActive ? role.color : '#94A3B8' }]}>
                          {role.sub}
                        </Text>
                      </View>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.statsHighlightRow}>
            <View style={[styles.statsHighlightCard, styles.statsHighlightCardSmall, { backgroundColor: C.primaryLight }]}>
              <Text style={[styles.statsHighlightNum, { color: C.primary }]}>25+</Text>
              <Text style={[styles.statsHighlightLabel, { color: C.primary }]}>{tx('Years')}</Text>
            </View>
            <ProductTickerCard />
            <View style={[styles.statsHighlightCard, styles.statsHighlightCardSmall, { backgroundColor: C.goldLight }]}>
              <Text style={[styles.statsHighlightNum, { color: C.gold }]}>250+</Text>
              <Text style={[styles.statsHighlightLabel, { color: C.gold }]}>{tx('Products')}</Text>
            </View>
          </View>

          <Text style={[styles.trustText, { color: C.gold }]}>
            ✦ {tx('25 Years of Trust & Improvement')} ✦
          </Text>

        </View>
      </View>
    );
  };

  const Slide2 = () => (
    <View>
      <View style={[styles.bannerHeader, styles.userBannerHeader]}>
        <View style={styles.userHeroBadge}>
          <AppIcon name="star" size={26} color="#2563EB" />
        </View>
      </View>

      <View style={[styles.cardBody, isCompactScreen && styles.cardBodyCompact]}>
        <Text style={[styles.centeredChip, { color: '#2563EB' }]}>{tx('For Every Home User')}</Text>
        <Text
          style={[
            styles.cardTitle,
            isCompactScreen && styles.cardTitleCompact,
            { color: theme.textPrimary },
          ]}
        >
          {tx('Opening SRV Home Experience')}
        </Text>
        <Text
          style={[
            styles.cardDesc,
            isCompactScreen && styles.cardDescCompact,
            { color: theme.textSecondary },
          ]}
        >
          {tx('Taking you directly to the app home screen')}
        </Text>

        <View style={styles.userInfoCard}>
          <Text style={[styles.userInfoTitle, { color: theme.textPrimary }]}>
            {tx('No login needed right now')}
          </Text>
          <Text style={[styles.userInfoText, { color: theme.textMuted }]}>
            {tx('You will be redirected automatically in a moment.')}
          </Text>
        </View>
      </View>
    </View>
  );

  // --- Slide 3: Dealer ---
  const Slide3 = ({
    gradient,
  }: {
    gradient: { start: string; end: string; icon: 'star' | 'refer' | 'redeem' };
  }) => (
    <View>
      <View style={styles.bannerHeader}>
        <Image
          source={require('../../../assets/dealer_banner.png')}
          style={[styles.headerBannerImage, isCompactScreen && styles.headerBannerImageCompact]}
          resizeMode="cover"
        />
        <View style={styles.roleBadge}>
          <AppIcon name="building" size={16} color={gradient.start} />
        </View>
      </View>

      <View style={[styles.cardBody, isCompactScreen && styles.cardBodyCompact]}>
        <Text style={[styles.centeredChip, { color: gradient.start }]}>
          {tx('For OUR VALUABLE Dealers')}
        </Text>
        <Text
          style={[
            styles.cardTitle,
            isCompactScreen && styles.cardTitleCompact,
            { color: theme.textPrimary },
          ]}
        >
          {tx('Grow your business with SRV')}
        </Text>
        <Text
          style={[
            styles.cardDesc,
            isCompactScreen && styles.cardDescCompact,
            { color: theme.textSecondary },
          ]}
        >
          {tx('Connect with electricians Track sales')}
        </Text>

        <View style={[styles.statsRow, isCompactScreen && styles.statsRowCompact]}>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[
                styles.statNum,
                isCompactScreen && styles.statNumCompact,
                { color: gradient.start },
              ]}
            >
              1000+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('Dealers')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[
                styles.statNum,
                isCompactScreen && styles.statNumCompact,
                { color: C.primary },
              ]}
            >
              20K+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('Electricians')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[styles.statNum, isCompactScreen && styles.statNumCompact, { color: C.teal }]}
            >
              8+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('States')}</Text>
          </View>
        </View>

        <View style={[styles.features, isCompactScreen && styles.featuresCompact]}>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: '#DDD6FE' },
              ]}
            >
              <AppIcon name="refer" size={18} color={gradient.start} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Manage Network')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Connect with your all Electrician')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.primaryLight },
              ]}
            >
              <AppIcon name="redeem" size={18} color={C.primary} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Grow Revenue')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Cash out')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.goldLight },
              ]}
            >
              <AppIcon name="offer" size={18} color={C.gold} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Dealer Bonus')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Exclusive offers for steady growth')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.pills, styles.rolePills]}>
          <View style={[styles.pill, { backgroundColor: C.goldLight }]}>
            <Text style={[styles.pillText, { color: C.gold }]}>{tx('Vouchers')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: C.tealLight }]}>
            <Text style={[styles.pillText, { color: C.teal }]}>{tx('No expiry')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: '#DDD6FE' }]}>
            <Text style={[styles.pillText, { color: gradient.start }]}>{tx('Partner')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // --- Slide 4: Electrician ---
  const Slide4 = ({
    gradient,
  }: {
    gradient: { start: string; end: string; icon: 'star' | 'refer' | 'redeem' };
  }) => (
    <View>
      <View style={styles.bannerHeader}>
        <Image
          source={require('../../../assets/electrician_banner1.jpg')}
          style={[
            styles.electricianBannerImage,
            isCompactScreen && styles.electricianBannerImageCompact,
          ]}
          resizeMode="cover"
        />
        <View style={styles.roleBadge}>
          <AppIcon name="scan" size={16} color={gradient.start} />
        </View>
      </View>

      <View style={[styles.cardBody, isCompactScreen && styles.cardBodyCompact]}>
        <Text style={[styles.centeredChip, { color: C.teal }]}>{tx('For OUR Electricians')}</Text>
        <Text
          style={[
            styles.cardTitle,
            isCompactScreen && styles.cardTitleCompact,
            { color: theme.textPrimary },
          ]}
        >
          {tx('Scan Earn Redeem')}
        </Text>
        <Text
          style={[
            styles.cardDesc,
            isCompactScreen && styles.cardDescCompact,
            { color: theme.textSecondary },
          ]}
        >
          {tx('QR scan instant points redeem')}
        </Text>

        <View style={[styles.statsRow, isCompactScreen && styles.statsRowCompact]}>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[styles.statNum, isCompactScreen && styles.statNumCompact, { color: C.teal }]}
            >
              100k+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('Rewards Paid')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[
                styles.statNum,
                isCompactScreen && styles.statNumCompact,
                { color: C.primary },
              ]}
            >
              20K+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('Electricians')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[styles.statNum, isCompactScreen && styles.statNumCompact, { color: C.gold }]}
            >
              8+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('States')}</Text>
          </View>
        </View>

        <View style={[styles.features, isCompactScreen && styles.featuresCompact]}>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.tealLight },
              ]}
            >
              <AppIcon name="scan" size={18} color={C.teal} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Scan Earn')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('QR scan rewards')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.goldLight },
              ]}
            >
              <AppIcon name="redeem" size={18} color={C.gold} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Redeem Rewards')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Cash vouchers')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.primaryLight },
              ]}
            >
              <AppIcon name="star" size={18} color={C.primary} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Level Up Rewards')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Unlock better benefits as you scan')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.pills, styles.rolePills]}>
          <View style={[styles.pill, { backgroundColor: C.goldLight }]}>
            <Text style={[styles.pillText, { color: C.gold }]}>{tx('Vouchers')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: C.tealLight }]}>
            <Text style={[styles.pillText, { color: C.teal }]}>{tx('No expiry')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: C.primaryLight }]}>
            <Text style={[styles.pillText, { color: C.primary }]}>{tx('Free to join')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#0F172A' : '#F8FAFC' }]}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        snapToInterval={screenWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        bounces={false}
        directionalLockEnabled
        overScrollMode="never"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          withWebSafeNativeDriver({})
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="normal"
        style={styles.slider}
        contentContainerStyle={{ width: screenWidth * totalSlides }}
      >
        {[0, 1, 2, 3].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.slide,
              { width: screenWidth, backgroundColor: theme.surface },
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingTop: insets.top, paddingBottom: showContinueButton ? 100 : 24 }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {i === 0 && <Slide1 />}
              {i === 1 && <Slide2 />}
              {i === 2 && <Slide3 gradient={slideGradients[2]} />}
              {i === 3 && <Slide4 gradient={slideGradients[3]} />}
            </ScrollView>
          </Animated.View>
        ))}
      </Animated.ScrollView>

      {showContinueButton && (
        <View
          style={[
            styles.bottomSection,
            { paddingBottom: insets.bottom + bottomSectionPaddingBottom },
          ]}
        >
          <Pressable
            style={styles.nextBtn}
            onPress={handleContinue}
            testID="get-started-continue"
            accessible
            accessibilityRole="button"
            accessibilityLabel="Get started continue"
          >
            <View style={[styles.nextBtnGradient, { backgroundColor: currentGradient.start }]}>
              {slideGradients.map((gradient, i) => (
                <Animated.View
                  key={`next-gradient-${i}`}
                  style={[
                    styles.nextBtnGradientLayer,
                    {
                      opacity: scrollX.interpolate({
                        inputRange: [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
                        outputRange: [0, 1, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[gradient.start, gradient.end]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.nextBtnGradientFill}
                  />
                </Animated.View>
              ))}
              <View style={styles.nextBtnContent}>
                <Text style={styles.nextBtnText}>{tx('Continue')}</Text>
                <AppIcon name="chevronRight" size={20} color="#fff" />
              </View>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slider: { flex: 1 },
  slide: { flex: 1 },
  userBannerHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },
  userHeroBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#EFF6FF',
    gap: 6,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  userInfoText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    ...createShadow({ color: '#000', offsetY: 6, blur: 16, opacity: 0.1, elevation: 6 }),
    position: 'relative',
  },
  cardSheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 110,
    backgroundColor: '#FFFFFF',
    opacity: 0.12,
    transform: [{ skewX: '-14deg' }],
  },
  cardHeader: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardLogo: { width: 170, height: 75 },
  logoGlow: {
    ...createShadow({ color: '#fff', offsetY: 0, blur: 20, opacity: 0.5, elevation: 10 }),
  },
  // Dot sparkle positions
  sparkleTopLeft: { top: 15, left: 30 },
  sparkleTopRight: { top: 20, right: 35 },
  sparkleBottomLeft: { bottom: 25, left: 40 },
  sparkleBottomRight: { bottom: 20, right: 45 },
  sparkleLeft: { left: 15, top: 70 },
  sparkleRight: { right: 20, top: 63 },
  sparkleTop: { top: 8, left: '50%' as any },
  sparkleBottom: { bottom: 8, left: '50%' as any },
  // Star sparkle positions
  starText: { fontSize: 14 },
  starTopLeft: { top: 25, left: 55 },
  starTopRight: { top: 30, right: 55 },
  starBottomLeft: { bottom: 35, left: 60 },
  starBottomRight: { bottom: 30, right: 60 },
  // Header (slides 2 & 3)
  headerContent: { alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleHeroWrap: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  roleHeroImage: {
    width: 92,
    height: 92,
  },
  bannerHeader: {
    height: 140,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  headerBannerImage: {
    width: '100%',
    height: '100%',
  },
  headerBannerImageCompact: {
    width: '100%',
    height: '100%',
  },
  electricianBannerImage: {
    width: '112%',
    height: '118%',
    marginLeft: '-6%',
    marginTop: -4,
    transform: [{ translateY: 8 }, { scale: 1.18 }],
  },
  electricianBannerImageCompact: {
    width: '118%',
    height: '122%',
    marginLeft: '-9%',
    marginTop: -2,
    transform: [{ translateY: 8 }, { scale: 1.14 }],
  },
  roleHeroImageCompact: {
    width: 82,
    height: 82,
  },
  dealerHeroImage: {
    width: 102,
    height: 102,
  },
  dealerHeroImageCompact: {
    width: 92,
    height: 92,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Card body
  cardBody: { padding: 24, paddingTop: 12 },
  cardBodyCompact: { padding: 18, paddingTop: 10 },
  // Slide 1 content styles
  tricolorWrapper: { marginBottom: 14 },
  tricolorContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  tricolorBar: { flex: 1, height: '100%' },
  welcomeText: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  sinceText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.4,
  },
  statsHighlightRow: { flexDirection: 'row', gap: 8, marginBottom: 14, marginTop: 6 },
  statsHighlightCard: { flex: 1, padding: 9, borderRadius: 12, alignItems: 'center' },
  statsHighlightCardSmall: { flex: 0.7 },
  statsHighlightNum: { fontSize: 17, fontWeight: '900', marginBottom: 1 },
  statsHighlightLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  // Slides 2 & 3 content styles
  centeredChip: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
    lineHeight: 26,
    textAlign: 'center',
  },
  cardTitleCompact: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: 'center',
  },
  cardDescCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statsRowCompact: { gap: 6, marginBottom: 10 },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNum: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  statNumCompact: { fontSize: 14 },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
    textAlign: 'center',
  },
  // Shared feature styles
  features: { gap: 8, marginBottom: 12 },
  featuresCompact: { gap: 6, marginBottom: 10 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    minHeight: 64,
    borderRadius: 14,
  },
  featureItemCompact: {
    gap: 10,
    padding: 10,
    minHeight: 56,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconCompact: {
    width: 34,
    height: 34,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '800' },
  featureTitleCompact: { fontSize: 13 },
  featureSub: { fontSize: 11, marginTop: 2 },
  featureSubCompact: { fontSize: 10, marginTop: 1 },
  // Pills
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  roleSelectorWrap: {
    marginTop: 24,
    marginBottom: 14,
    gap: 10,
  },
  roleSelectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleSelectorTitleLine: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
    opacity: 0.25,
  },
  roleSelectorTitle: {
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  roleSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleSelectorChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8E2F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  roleSelectorChipActive: {
    borderColor: '#E8453C',
    backgroundColor: '#FFF1EF',
  },
  roleSelectorChipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  roleSelectorChipTextActive: {
    color: '#E8453C',
  },
  roleCard: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    aspectRatio: 0.85,
    width: '100%',
  },
  roleCardImage: {
    width: '110%',
    height: '110%',
    marginLeft: '-5%',
    marginTop: '-5%',
  },
  roleCardImageCover: {
    width: '110%',
    height: '145%',
    marginLeft: '-5%',
    marginTop: '-8%',
  },
  roleCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 1,
  },
  roleCardLabelWrap: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 4,
  },
  roleCardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  roleCardLabel: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  roleCardSub: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  roleCardCheck: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardCheckText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  rolePills: {
    marginTop: 'auto',
    marginBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pillText: { fontSize: 10, fontWeight: '700' },
  // Bottom navigation
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 12,
  },
  nextBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow({ color: '#000', offsetY: 3, blur: 6, opacity: 0.12, elevation: 3 }),
  },
  nextBtnGradient: {
    height: 52,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  nextBtnGradientLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextBtnGradientFill: {
    flex: 1,
    borderRadius: 16,
  },
  nextBtnContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
