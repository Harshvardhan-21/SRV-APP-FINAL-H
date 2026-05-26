import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ProfileShared';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';
import type { UserRole } from '@/shared/types/navigation';

type ApprovalPendingScreenProps = {
  role: Extract<UserRole, 'dealer'>;
  accountStatus?: string | null;
  approvalRejectionReason?: string | null;
  supportPhone?: string | null;
  whatsappNumber?: string | null;
  onUseAnotherNumber?: () => void;
  onReapply?: () => void;
};

const ROLE_THEME = {
  dealer: {
    shell: '#F4F8FF',
    hero: ['#F8FBFF', '#E2ECFF', '#D4E3FF'] as [string, string, string],
    rejectedHero: ['#FFF8F8', '#FFE8E8', '#FFD4D4'] as [string, string, string],
    accent: '#214D99',
    accentDeep: '#173E80',
    soft: '#EAF3FF',
    chip: '#DCEAFF',
    rejectedChip: '#FFE0E0',
    rejectedAccent: '#C0392B',
    rejectedAccentDeep: '#922B21',
    glow: 'rgba(33,77,153,0.18)',
    rejectedGlow: 'rgba(192,57,43,0.15)',
    support: '#0F766E',
  },
} as const;

function sanitizePhone(value?: string | null) {
  return String(value ?? '').replace(/[^0-9+]/g, '');
}

function sanitizeWhatsapp(value?: string | null) {
  return String(value ?? '').replace(/[^0-9]/g, '');
}

export function ApprovalPendingScreen({
  role,
  accountStatus,
  approvalRejectionReason,
  supportPhone,
  whatsappNumber,
  onUseAnotherNumber,
  onReapply,
}: ApprovalPendingScreenProps) {
  const { tx, theme } = usePreferenceContext();
  const roleTheme = ROLE_THEME[role];
  const safePhone = sanitizePhone(supportPhone);
  const safeWhatsapp = sanitizeWhatsapp(whatsappNumber || supportPhone);

  const isRejected = accountStatus === 'inactive';
  const roleLabel = 'Dealer';

  const heroColors = isRejected ? roleTheme.rejectedHero : roleTheme.hero;
  const chipBg = isRejected ? roleTheme.rejectedChip : roleTheme.chip;
  const accentColor = isRejected ? roleTheme.rejectedAccent : roleTheme.accent;
  const accentDeepColor = isRejected ? roleTheme.rejectedAccentDeep : roleTheme.accentDeep;
  const glowColor = isRejected ? roleTheme.rejectedGlow : roleTheme.glow;
  const softColor = isRejected ? '#FFE8E8' : roleTheme.soft;

  const statusRows = useMemo(() => {
    if (isRejected) {
      return [
        'Your account application was reviewed',
        'Admin has rejected your registration',
        'You can reapply or contact support for help',
      ];
    }
    return [
      'Your account request has been received',
      'Admin approval is required before access',
      'You can contact support for urgent queries',
    ];
  }, [isRejected]);

  const handleCall = () => {
    if (!safePhone) return;
    void Linking.openURL(`tel:${safePhone}`).catch(() => {});
  };

  const handleWhatsapp = () => {
    if (!safeWhatsapp) return;
    const message = encodeURIComponent(
      isRejected
        ? `Hello SRV Team, my ${roleLabel.toLowerCase()} account registration was rejected. I would like to understand the reason and reapply.`
        : `Hello SRV Team, my ${roleLabel.toLowerCase()} account is waiting for admin approval.`
    );
    void Linking.openURL(`https://wa.me/${safeWhatsapp}?text=${message}`).catch(() => {});
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: isRejected ? '#FFF5F5' : roleTheme.shell }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={heroColors} style={styles.heroCard}>
        <View style={[styles.heroGlow, { backgroundColor: glowColor }]} />

        <View style={styles.topRow}>
          <View style={[styles.statusChip, { backgroundColor: chipBg }]}>
            <AppIcon
              name={isRejected ? 'close' : 'warning'}
              size={15}
              color={accentDeepColor}
            />
            <Text style={[styles.statusChipText, { color: accentDeepColor }]}>
              {isRejected ? 'Application Rejected' : 'Approval Pending'}
            </Text>
          </View>
          <View style={[styles.roleChip, { backgroundColor: '#FFFFFF' }]}>
            <AppIcon name="building" size={15} color={accentColor} />
            <Text style={[styles.roleChipText, { color: accentDeepColor }]}>{roleLabel}</Text>
          </View>
        </View>

        <Text style={[styles.eyebrow, { color: accentDeepColor }]}>
          {isRejected ? 'Registration Rejected' : 'Admin Review'}
        </Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {isRejected
            ? 'Your dealer account has been rejected'
            : 'Wait for admin approval to access your account'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isRejected
            ? 'Your registration was reviewed and rejected by the admin. Please check the reason below and reapply or contact support.'
            : `Your ${roleLabel.toLowerCase()} account is created, but the next pages will unlock only after admin approval.`}
        </Text>

        {/* Rejection reason box */}
        {isRejected && approvalRejectionReason ? (
          <View style={styles.rejectionReasonBox}>
            <View style={styles.rejectionReasonHeader}>
              <AppIcon name="warning" size={14} color={roleTheme.rejectedAccentDeep} />
              <Text style={[styles.rejectionReasonLabel, { color: roleTheme.rejectedAccentDeep }]}>
                Reason for Rejection
              </Text>
            </View>
            <Text style={[styles.rejectionReasonText, { color: roleTheme.rejectedAccentDeep }]}>
              {approvalRejectionReason}
            </Text>
          </View>
        ) : null}

        <View style={[styles.progressCard, isRejected && styles.progressCardRejected]}>
          {statusRows.map((item, index) => (
            <View key={item} style={styles.progressRow}>
              <View
                style={[
                  styles.progressIcon,
                  {
                    backgroundColor:
                      index === statusRows.length - 1
                        ? `${accentColor}14`
                        : softColor,
                  },
                ]}
              >
                <AppIcon
                  name={
                    isRejected
                      ? index === 1
                        ? 'close'
                        : index === statusRows.length - 1
                        ? 'message'
                        : 'check'
                      : index === statusRows.length - 1
                      ? 'message'
                      : 'check'
                  }
                  size={13}
                  color={accentDeepColor}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Reapply card — only shown when rejected */}
      {isRejected ? (
        <View style={[styles.reapplyCard, { borderColor: `${roleTheme.rejectedAccent}30` }]}>
          <View style={styles.reapplyHeader}>
            <View style={[styles.reapplyIconWrap, { backgroundColor: roleTheme.rejectedChip }]}>
              <AppIcon name="refresh" size={18} color={roleTheme.rejectedAccentDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.reapplyTitle, { color: theme.textPrimary }]}>
                Want to reapply?
              </Text>
              <Text style={[styles.reaplyCopy, { color: theme.textSecondary }]}>
                Fix the issue mentioned above and submit a new application with the correct details.
              </Text>
            </View>
          </View>
          {onReapply ? (
            <Pressable onPress={onReapply} style={styles.reapplyButtonShell}>
              <LinearGradient
                colors={[roleTheme.rejectedAccent, roleTheme.rejectedAccentDeep]}
                style={styles.reapplyButton}
              >
                <AppIcon name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.reapplyButtonText}>Reapply Now</Text>
              </LinearGradient>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.supportCard}>
        <Text style={[styles.supportTitle, { color: theme.textPrimary }]}>Need help right now?</Text>
        <Text style={[styles.supportCopy, { color: theme.textSecondary }]}>
          {isRejected
            ? 'Contact our team to understand the rejection reason or get help with reapplying.'
            : 'For any queries, contact our team and we will help you with the approval status.'}
        </Text>

        {safePhone ? (
          <Pressable onPress={handleCall} style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: isRejected ? '#FFE8E8' : roleTheme.soft }]}>
              <AppIcon name="phone" size={16} color={accentDeepColor} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Support Number</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{safePhone}</Text>
            </View>
            <AppIcon name="chevronRight" size={18} color={accentColor} />
          </Pressable>
        ) : null}

        {safeWhatsapp ? (
          <Pressable onPress={handleWhatsapp} style={styles.buttonShell}>
            <LinearGradient colors={['#16A34A', roleTheme.support]} style={styles.whatsappButton}>
              <AppIcon name="whatsapp" size={18} color="#FFFFFF" />
              <Text style={styles.whatsappButtonText}>{tx('Chat on WhatsApp')}</Text>
            </LinearGradient>
          </Pressable>
        ) : null}

        {onUseAnotherNumber ? (
          <Pressable onPress={onUseAnotherNumber} style={styles.secondaryShell}>
            <View style={[styles.secondaryButton, { borderColor: `${accentColor}30` }]}>
              <AppIcon name="chevronLeft" size={16} color={accentColor} />
              <Text style={[styles.secondaryText, { color: accentDeepColor }]}>
                {tx('Use another number')}
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  heroCard: {
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    overflow: 'hidden',
    ...createShadow({ color: '#0F172A', offsetY: 12, blur: 24, opacity: 0.09, elevation: 6 }),
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -72,
    right: -42,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '900',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    maxWidth: 280,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 290,
  },
  rejectionReasonBox: {
    marginTop: 14,
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  rejectionReasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rejectionReasonLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rejectionReasonText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  progressCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  progressCardRejected: {
    backgroundColor: '#FFF8F8',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  reapplyCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
    borderWidth: 1,
    ...createShadow({ color: '#C0392B', offsetY: 6, blur: 18, opacity: 0.07, elevation: 4 }),
  },
  reapplyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reapplyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reapplyTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  reaplyCopy: {
    fontSize: 12,
    lineHeight: 18,
  },
  reapplyButtonShell: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  reapplyButton: {
    minHeight: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reapplyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  supportCard: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    ...createShadow({ color: '#0F172A', offsetY: 10, blur: 22, opacity: 0.08, elevation: 5 }),
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  supportCopy: {
    fontSize: 13,
    lineHeight: 19,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAFBFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  buttonShell: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  whatsappButton: {
    minHeight: 52,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryShell: {
    marginTop: 2,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
