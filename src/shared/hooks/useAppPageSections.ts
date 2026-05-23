import { useMemo } from 'react';
import {
  resolvePageSectionOrder,
  DEFAULT_PAGE_SECTION_ORDER,
  type AppContentPage,
  type AppContentRole,
  type PageSectionKey,
} from '@/shared/config/appPageContent';
import { useAppData } from '@/shared/context/AppDataContext';
import { useAppPreviewState } from '@/shared/preview/appPreviewStore';

export function useAppPageSections(
  role: AppContentRole,
  page: AppContentPage
): PageSectionKey[] {
  const { appSettings } = useAppData();
  const previewState = useAppPreviewState();

  return useMemo(() => {
    const order = resolvePageSectionOrder(
      previewState.enabled && previewState.pageSectionOrder
        ? previewState.pageSectionOrder
        : appSettings?.pageSectionOrder
    );
    return order[role]?.[page]
      ?? DEFAULT_PAGE_SECTION_ORDER[role]?.[page]
      ?? [];
  }, [appSettings?.pageSectionOrder, page, previewState.enabled, previewState.pageSectionOrder, role]);
}
