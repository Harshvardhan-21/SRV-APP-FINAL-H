import { Alert } from 'react-native';
import { Linking } from 'react-native';

export function useCatalogDownload() {
  const openCatalog = (url: string | null | undefined) => {
    if (!url) {
      Alert.alert('Not Available', 'Product catalog has not been uploaded yet.');
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open catalog link.');
    });
  };

  return { openCatalog, downloading: false, progress: 0 };
}
