import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';
import { Platform } from 'react-native';

export const csvUtils = {
  /**
   * Converts JSON data to CSV string
   */
  jsonToCsv(
    data: Record<string, string | number | boolean | null | undefined>[]
  ): string {
    return Papa.unparse(data);
  },

  /**
   * Converts CSV string to JSON data
   */
  csvToJson<T>(csvString: string): T[] {
    const result = Papa.parse<T>(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    return result.data;
  },

  /**
   * Exports data to a CSV file and opens the share dialog
   */
  async exportToCsv(
    data: Record<string, string | number | boolean | null | undefined>[],
    filename: string
  ): Promise<void> {
    try {
      const csvContent = this.jsonToCsv(data);
      const fileUri = `${FileSystem.documentDirectory}${filename}.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });

      if (Platform.OS === 'web') {
        // Fallback for web if needed, but this is mainly for mobile as per user request
        console.warn('Web export not fully implemented via Sharing API');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: `Exportar ${filename}`,
            UTI: 'public.comma-separated-values-text'
          });
        } else {
          throw new Error('Compartilhamento não disponível neste dispositivo');
        }
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },

  /**
   * Picks a CSV file and converts it to JSON
   */
  async importFromCsv<T>(): Promise<T[] | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return null;

      const fileUri = result.assets[0].uri;
      const csvContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8
      });

      return this.csvToJson<T>(csvContent);
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  }
};
