import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { CollectionPage } from './pages/CollectionPage'
import { DetailPage } from './pages/DetailPage'
import { GachaPage } from './pages/GachaPage'
import { BossPage } from './pages/BossPage'
import { AdminPage } from './pages/AdminPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/collection" replace />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/card/:id" element={<DetailPage />} />
          <Route path="/gacha" element={<GachaPage />} />
          <Route path="/boss" element={<BossPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/collection" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
