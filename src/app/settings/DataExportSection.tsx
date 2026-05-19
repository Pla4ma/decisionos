import { Text, View, Alert, Pressable, Platform, Share } from 'react-native';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { styles } from './styles';
import { useState, useCallback } from 'react';

export function DataExportSection(): JSX.Element {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-user-data');
      if (error) throw error;
      const json = JSON.stringify(data, null, 2);
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decisionos-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ message: json, title: 'DecisionOS Export' });
      }
      Alert.alert('Export Complete', 'Your decision history has been downloaded.');
    } catch { Alert.alert('Export Failed', 'Unable to export data. Please try again.'); }
    finally { setIsExporting(false); }
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Data & Privacy</Text>
      <Card style={styles.settingsCard}>
        <Pressable onPress={handleExport} style={styles.settingAction} disabled={isExporting}>
          <Text style={styles.settingActionText}>{isExporting ? 'Exporting...' : 'Export Decision History'}</Text>
        </Pressable>
      </Card>
      <Text style={styles.privacyNote}>
        When you request AI analysis, your decision content is sent to our secure backend for processing.
        We do not sell your data or use it for ads. You can delete your data at any time.
      </Text>
    </View>
  );
}
