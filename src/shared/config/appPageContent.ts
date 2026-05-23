import type { UserRole } from '@/shared/types/navigation';

export type AppContentRole = UserRole;

export type AppContentPage =
  | 'home'
  | 'product'
  | 'play'
  | 'categories'
  | 'cart'
  | 'wallet'
  | 'profile'
  | 'notifications'
  | 'rewards'
  | 'scan'
  | 'electricians'
  | 'call_electrician'
  | 'member_tier'
  | 'bank_details'
  | 'dealer_bonus'
  | 'need_help'
  | 'contact_support'
  | 'offers'
  | 'transfer_points'
  | 'my_orders'
  | 'my_redemption'
  | 'refer_friend'
  | 'scan_history'
  | 'privacy_policy'
  | 'password'
  | 'app_settings'
  | 'rate_us'
  | 'support';

export type AppPageContentFieldKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'heroTitle'
  | 'heroSubtitle'
  | 'sectionTitle'
  | 'sectionSubtitle'
  | 'primaryCtaLabel'
  | 'secondaryCtaLabel'
  | 'emptyStateTitle'
  | 'emptyStateSubtitle'
  | 'helperText'
  | 'supportText'
  | 'searchPlaceholder'
  | 'inputLabel'
  | 'cardTitle'
  | 'cardSubtitle';

export type AppPageContentFields = Partial<Record<AppPageContentFieldKey, string>>;

export type AppPageContentMap = Record<
  AppContentRole,
  Partial<Record<AppContentPage, AppPageContentFields>>
>;

export const APP_PAGE_CONTENT_FIELDS: AppPageContentFieldKey[] = [
  'pageTitle',
  'pageSubtitle',
  'heroTitle',
  'heroSubtitle',
  'sectionTitle',
  'sectionSubtitle',
  'primaryCtaLabel',
  'secondaryCtaLabel',
  'emptyStateTitle',
  'emptyStateSubtitle',
  'helperText',
  'supportText',
  'searchPlaceholder',
  'inputLabel',
  'cardTitle',
  'cardSubtitle',
];

const EMPTY_FIELDS: AppPageContentFields = {};

export const DEFAULT_APP_PAGE_CONTENT: AppPageContentMap = {
  electrician: {},
  dealer: {},
  user: {},
  counterboy: {},
};

export function resolveAppPageContent(input?: unknown): AppPageContentMap {
  const normalized: AppPageContentMap = {
    electrician: {},
    dealer: {},
    user: {},
    counterboy: {},
  };

  if (!input || typeof input !== 'object') {
    return normalized;
  }

  for (const role of Object.keys(DEFAULT_APP_PAGE_CONTENT) as AppContentRole[]) {
    const roleContent = (input as Record<string, unknown>)[role];
    if (!roleContent || typeof roleContent !== 'object') {
      continue;
    }

    for (const [pageKey, pageFields] of Object.entries(roleContent as Record<string, unknown>)) {
      if (!pageFields || typeof pageFields !== 'object') {
        continue;
      }

      const nextFields: AppPageContentFields = {};
      for (const field of APP_PAGE_CONTENT_FIELDS) {
        const maybeValue = (pageFields as Record<string, unknown>)[field];
        if (typeof maybeValue === 'string') {
          const trimmed = maybeValue.trim();
          if (trimmed) {
            nextFields[field] = trimmed;
          }
        }
      }

      if (Object.keys(nextFields).length > 0) {
        normalized[role][pageKey as AppContentPage] = nextFields;
      }
    }
  }

  return normalized;
}

export function getAppPageContent(
  content: AppPageContentMap,
  role: AppContentRole,
  page: AppContentPage
) {
  return content[role]?.[page] ?? EMPTY_FIELDS;
}
