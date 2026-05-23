import { useMemo } from 'react';
import {
  getAppPageContent,
  resolveAppPageContent,
  type AppContentPage,
  type AppContentRole,
} from '@/shared/config/appPageContent';
import { useAppData } from '@/shared/context/AppDataContext';
import { useAppPreviewState } from '@/shared/preview/appPreviewStore';

export function useAppPageContent(role: AppContentRole, page: AppContentPage) {
  const { appSettings } = useAppData();
  const previewState = useAppPreviewState();

  return useMemo(
    () =>
      getAppPageContent(
        resolveAppPageContent(
          previewState.enabled && previewState.appPageContent
            ? previewState.appPageContent
            : appSettings?.appPageContent
        ),
        role,
        page
      ),
    [appSettings?.appPageContent, page, previewState.appPageContent, previewState.enabled, role]
  );
}
