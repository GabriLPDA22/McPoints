import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './AppShell.jsx';
import { HomeScreen } from '@/features/home/HomeScreen.jsx';
import { CollectionScreen } from '@/features/collection/CollectionScreen.jsx';
import { NumberDetailScreen } from '@/features/collection/NumberDetailScreen.jsx';
import { ScannerScreen } from '@/features/scanner/ScannerScreen.jsx';
import { HistoryScreen } from '@/features/history/HistoryScreen.jsx';
import { SettingsScreen } from '@/features/settings/SettingsScreen.jsx';

export function AppRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomeScreen />} />
          <Route path="collection" element={<CollectionScreen />} />
          <Route path="number/:key" element={<NumberDetailScreen />} />
          <Route path="scan" element={<ScannerScreen />} />
          <Route path="history" element={<HistoryScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
