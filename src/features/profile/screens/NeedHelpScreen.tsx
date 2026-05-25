import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MailComposer from 'expo-mail-composer';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon, C, PageHeader } from '../components/ProfileShared';
import { usePreferenceContext } from '@/shared/preferences';
import { settingsApi } from '@/shared/api';
import { useAppData } from '@/shared/context/AppDataContext';
import { useAuth } from '@/shared/context/AuthContext';
import { useAppPageContent } from '@/shared/hooks';

export function NeedHelpPage({ onBack }: { onBack: () => void }) {
  const { t, tx, theme } = usePreferenceContext();
  const { role } = useAuth();
  const { submitSupportTicket } = useAppData();
  const pageContent = useAppPageContent((role ?? 'electrician') as any, 'need_help');
  const [subject, setSubject] = useState('');
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [supportMail, setSupportMail] = useState('info@srvelectricals.com');
  const [supportWhatsapp, setSupportWhatsapp] = useState('918837684004');
  const [submitting, setSubmitting] = useState(false);
  const subjectOptions = [
    tx('Normal Inquiry'),
    tx('Bulk Inquiry'),
    tx('Electrician Related Inquiry'),
    tx('QR Related Inquiry'),
  ];

  useEffect(() => {
    settingsApi.getAppSettings()
      .then((settings) => {
        if (settings.supportEmail) setSupportMail(settings.supportEmail);
        if (settings.whatsappNumber) setSupportWhatsapp(settings.whatsappNumber);
      })
      .catch(() => {});
  }, []);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert(tx('Permission required'), tx('Please allow gallery access.'));
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) setPendingPhoto(res.assets[0].uri);
  };

  const confirmPhoto = () => {
    if (!pendingPhoto) return;
    setPhoto(pendingPhoto);
    setPendingPhoto(null);
  };

  const cancelPhoto = () => {
    setPendingPhoto(null);
  };

  const buildSupportMessage = () =>
    `SRV ${tx('Support Request')}\n${tx('Subject')}: ${subject.trim()}\n\n${tx('Comment')}:\n${comment.trim()}`;

  const toDataUri = async (assetUri: string) => {
    if (assetUri.startsWith('data:image/')) {
      return assetUri;
    }

    const base64 = await LegacyFileSystem.readAsStringAsync(assetUri, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    return `data:image/jpeg;base64,${base64}`;
  };

  const submitToSrv = async () => {
    if (!subject.trim() || !comment.trim()) {
      return Alert.alert(tx('incompleteForm'), tx('fillSubjectComment'));
    }

    setSubmitting(true);
    try {
      const photoUrl = photo ? await toDataUri(photo) : undefined;
      await submitSupportTicket({
        subject: subject.trim(),
        comment: comment.trim(),
        photoUrl,
      });
      setSubject('');
      setComment('');
      setPhoto(null);
      Alert.alert(tx('Support Request'), tx('Your request has been submitted successfully.'));
    } catch {
      Alert.alert(
        tx('Support Request'),
        tx('We could not submit your request right now. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsapp = async () => {
    if (!subject.trim() || !comment.trim()) {
      return Alert.alert(tx('incompleteForm'), tx('fillSubjectComment'));
    }
    const message = encodeURIComponent(buildSupportMessage());
    const appUrl = `whatsapp://send?phone=${supportWhatsapp}&text=${message}`;
    const webUrl = `https://wa.me/${supportWhatsapp}?text=${message}`;
    const canOpenApp = await Linking.canOpenURL(appUrl);
    if (canOpenApp) {
      await Linking.openURL(appUrl);
      if (photo) {
        Alert.alert(
          tx('Photo ready'),
          tx(
            'WhatsApp chat has opened on the SRV number. Please attach the selected photo manually inside WhatsApp.'
          )
        );
      }
      return;
    }
    const canOpenWeb = await Linking.canOpenURL(webUrl);
    if (!canOpenWeb) {
      return Alert.alert(
        tx('WhatsApp unavailable'),
        tx('Please install or enable WhatsApp to send your request.')
      );
    }
    await Linking.openURL(webUrl);
    if (photo) {
      Alert.alert(
        tx('Photo ready'),
        tx(
          'WhatsApp chat has opened on the SRV number. Please attach the selected photo manually inside WhatsApp.'
        )
      );
    }
  };

  const openMail = async () => {
    if (!subject.trim() || !comment.trim()) {
      return Alert.alert(tx('incompleteForm'), tx('fillSubjectComment'));
    }
    try {
      await MailComposer.composeAsync({
        recipients: [supportMail],
        subject: `SRV Support: ${subject.trim()}`,
        body: buildSupportMessage(),
        attachments: photo ? [photo] : [],
      });
      return;
    } catch {
      const mailSubject = encodeURIComponent(`SRV Support: ${subject.trim()}`);
      const mailBody = encodeURIComponent(buildSupportMessage());
      const fallbackUrl = `mailto:${supportMail}?subject=${mailSubject}&body=${mailBody}`;
      const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
      if (!canOpenFallback) {
        return Alert.alert(
          tx('Mail unavailable'),
          tx('Please configure a mail app to send your request.')
        );
      }
      await Linking.openURL(fallbackUrl);
      if (photo) {
        Alert.alert(
          tx('Attachment note'),
          tx(
            'Mail app opened, but attachment support is only available when the native mail composer is enabled on the device.'
          )
        );
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={pageContent.pageTitle || t('needHelp')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <AppIcon name="support" size={24} color={C.teal} />
            </View>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {pageContent.cardTitle || tx('Support Request')}
              </Text>
              <Text style={[styles.sub, { color: theme.textMuted }]}>
                {pageContent.cardSubtitle || tx('We typically respond within 24 hours')}
              </Text>
            </View>
          </View>
          <Text style={[styles.label, { color: theme.textMuted }]}>{tx('Subject')}</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dropdownTrigger,
              { backgroundColor: theme.soft, borderColor: theme.border },
            ]}
            onPress={() => setShowSubjectDropdown(true)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.dropdownValue,
                { color: subject ? theme.textPrimary : theme.textMuted },
              ]}
              numberOfLines={1}
            >
              {subject || tx('Select subject')}
            </Text>
            <AppIcon name="chevronDown" size={18} color={theme.textMuted} />
          </TouchableOpacity>
          <Text style={[styles.label, { color: theme.textMuted }]}>{tx('Comment')}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.soft,
                borderColor: theme.border,
                color: theme.textPrimary,
                height: 110,
                textAlignVertical: 'top',
                paddingTop: 14,
              },
            ]}
            placeholder={tx('Describe your issue in detail...')}
            placeholderTextColor={theme.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.uploadBox, { backgroundColor: theme.soft, borderColor: theme.border }]}
            onPress={pickPhoto}
            activeOpacity={0.8}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.previewImage} />
            ) : (
              <View style={styles.uploadInner}>
                <AppIcon name="gallery" size={20} color={C.muted} />
                <Text style={styles.uploadText}>{tx('Upload Photo')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.primaryAction,
            { backgroundColor: C.primary },
            submitting && { opacity: 0.7 },
          ]}
          onPress={() => void submitToSrv()}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>
            {submitting ? tx('Submitting...') : pageContent.primaryCtaLabel || tx('Submit Request')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.helperText, { color: theme.textMuted }]}>
          {pageContent.helperText || tx('This saves your issue in the SRV system so admin can track and resolve it.')}
        </Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity onPress={() => void openWhatsapp()} activeOpacity={0.9}>
            <LinearGradient
              colors={['#E8FFF1', '#C6F3D8', '#E0F2FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionBtn}
            >
              <View style={[styles.actionIconWrap, styles.whatsappIconWrap]}>
                <AppIcon name="whatsapp" size={18} color="#16A34A" />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{tx('Send to WhatsApp')}</Text>
                <Text style={styles.actionSub}>{pageContent.supportText || tx('Open SRV support chat')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => void openMail()} activeOpacity={0.9}>
            <LinearGradient
              colors={['#FFF4EE', '#FFE1D6', '#FDE7F3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionBtn}
            >
              <View style={[styles.actionIconWrap, styles.mailIconWrap]}>
                <AppIcon name="mail" size={18} color={C.primary} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{tx('Send to Mail')}</Text>
                <Text style={styles.actionSub}>
                  {tx('Send to')} {supportMail}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showSubjectDropdown}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSubjectDropdown(false)}
      >
        <Pressable style={styles.dropdownOverlay} onPress={() => setShowSubjectDropdown(false)}>
          <View
            style={[
              styles.dropdownSheet,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.dropdownTitle, { color: theme.textPrimary }]}>
              {tx('Select Subject')}
            </Text>
            {subjectOptions.map((option, index) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  index < subjectOptions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => {
                  setSubject(option);
                  setShowSubjectDropdown(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.dropdownItemText, { color: theme.textPrimary }]}>
                  {option}
                </Text>
                {subject === option ? <AppIcon name="check" size={16} color={C.primary} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={!!pendingPhoto} animationType="fade" transparent onRequestClose={cancelPhoto}>
        <View style={styles.dropdownOverlay}>
          <View
            style={[
              styles.dropdownSheet,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {pendingPhoto ? (
              <Image source={{ uri: pendingPhoto }} style={styles.confirmPreview} />
            ) : null}
            <Text style={[styles.dropdownTitle, { color: theme.textPrimary }]}>
              {tx('Use this photo?')}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={cancelPhoto}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmCancelText}>{tx('Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDoneBtn}
                onPress={confirmPhoto}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmDoneText}>{tx('Done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },
  card: { borderRadius: 28, padding: 20, borderWidth: 1, gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: C.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '900' },
  sub: { fontSize: 11, marginTop: 2 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownValue: { flex: 1, fontSize: 14, fontWeight: '500', marginRight: 12 },
  uploadBox: {
    height: 110,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadText: { fontSize: 14, color: C.muted, fontWeight: '600' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,17,32,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownSheet: { borderRadius: 24, borderWidth: 1, padding: 20 },
  dropdownTitle: { fontSize: 17, fontWeight: '900', marginBottom: 12 },
  dropdownItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  dropdownItemText: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 12 },
  confirmPreview: {
    width: 220,
    height: 220,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  confirmActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  confirmCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: { fontSize: 15, fontWeight: '700', color: C.dark },
  confirmDoneBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDoneText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  primaryAction: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  primaryActionText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  helperText: { fontSize: 12, lineHeight: 18, marginTop: -2 },
  actionGrid: { gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  mailIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  actionCopy: { flex: 1 },
  actionTitle: { color: '#152238', fontSize: 15, fontWeight: '800' },
  actionSub: { color: '#6B7A93', fontSize: 11.5, marginTop: 3, lineHeight: 16 },
});
