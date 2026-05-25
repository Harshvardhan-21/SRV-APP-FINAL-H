import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon, C, IconName, PageHeader } from '../components/ProfileShared';
import { type AppLanguage, usePreferenceContext } from '@/shared/preferences';
import { useAuth } from '@/shared/context/AuthContext';
import { useAppPageContent } from '@/shared/hooks';

export function AppSettingsPage({ onBack }: { onBack: () => void }) {
  const { language, setLanguage, darkMode, setDarkMode, t, theme } = usePreferenceContext();
  const { role } = useAuth();
  const pageContent = useAppPageContent((role ?? 'electrician') as any, 'app_settings');
  const [notifEnabled, setNotifEnabled] = useState(true);

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <TouchableOpacity
      style={[styles.toggle, val && styles.toggleOn]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={[styles.thumb, val && styles.thumbOn]} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={pageContent.pageTitle || t('appSettings')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t('preferences')}</Text>
          {[
            {
              label: t('pushNotifications'),
              sub: t('receiveAlerts'),
              val: notifEnabled,
              toggle: () => setNotifEnabled((v) => !v),
              icon: 'notification' as IconName,
            },
            {
              label: t('darkMode'),
              sub: t('switchTheme'),
              val: darkMode,
              toggle: () => setDarkMode(!darkMode),
              icon: 'moon' as IconName,
            },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.row,
                i < arr.length - 1 && [styles.rowBorder, { borderBottomColor: theme.border }],
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: item.val ? C.primaryLight : theme.soft },
                ]}
              >
                <AppIcon
                  name={item.icon}
                  size={20}
                  color={item.val ? C.primary : theme.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>{item.sub}</Text>
              </View>
              <Toggle val={item.val} onToggle={item.toggle} />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t('language')}</Text>
          {(['English', 'Hindi', 'Punjabi'] as AppLanguage[]).map((l) => (
            <TouchableOpacity
              key={l}
              style={styles.row}
              onPress={() => setLanguage(l)}
              activeOpacity={0.8}
            >
              <Text style={[styles.rowLabel, { flex: 1, color: theme.textPrimary }]}>
                {l === 'English' ? t('english') : l === 'Hindi' ? t('hindi') : t('punjabi')}
              </Text>
              {language === l && <AppIcon name="check" size={18} color={C.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },
  card: { borderRadius: 24, padding: 18, borderWidth: 1, gap: 4 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: C.primary },
  thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  thumbOn: { alignSelf: 'flex-end' },
});
