import { useMemo } from 'react';
import {
  getAppPageContent,
  resolveAppPageContent,
  type AppContentPage,
  type AppContentRole,
} from '@/shared/config/appPageContent';
import { useAppData } from '@/shared/context/AppDataContext';

export function useAppPageContent(role: AppContentRole, page: AppContentPage) {
  const { appSettings } = useAppData();

  return useMemo(
    () => getAppPageContent(resolveAppPageContent(appSettings?.appPageContent), role, page),
    [appSettings?.appPageContent, page, role]
  );
}
