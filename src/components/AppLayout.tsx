import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Boxes,
  Crown,
  Flame,
  Home,
  Shield,
  Swords,
  UserCog,
} from 'lucide-react'
import { AppStateProvider, useAppState } from '../lib/appState'
import { classNames } from '../lib/utils'

function TopBar() {
  const { user, canViewAll } = useAppState()
  const loc = useLocation()

  const title =
    loc.pathname.startsWith('/collection')
      ? 'Collection'
      : loc.pathname.startsWith('/gacha')
        ? 'Daily Gacha'
        : loc.pathname.startsWith('/boss')
          ? 'Daily BOSS'
          : loc.pathname.startsWith('/admin')
            ? 'Admin'
            : loc.pathname.startsWith('/settings')
              ? 'Settings'
              : 'Knot Gacha'

  return (
    <div className="sticky top-0 z-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur" />
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/30 via-sky-400/25 to-fuchsia-400/25 ring-1 ring-white/10">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white/95">{title}</div>
            <div className="text-xs text-white/60">
              Role: <span className="font-medium text-white/80">{user.role}</span>
              {canViewAll ? (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200 ring-1 ring-amber-300/20">
                  <Crown className="h-3 w-3" />
                  全圖鑑模式
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <a
            href="https://www.notion.so"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10 hover:bg-white/10"
          >
            Notion Backend
          </a>
        </div>
      </div>
    </div>
  )
}

function BottomNav() {
  const items = [
    { to: '/collection', label: '圖鑑', icon: BookOpen },
    { to: '/gacha', label: '抽卡', icon: Swords },
    { to: '/boss', label: 'BOSS', icon: Flame },
    { to: '/settings', label: '設定', icon: Shield },
    { to: '/admin', label: '管理', icon: UserCog },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid grid-cols-5 gap-2 rounded-2xl bg-black/40 p-2 ring-1 ring-white/10 backdrop-blur">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                classNames(
                  'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition',
                  isActive
                    ? 'bg-white/10 text-white ring-1 ring-white/10'
                    : 'text-white/70 hover:bg-white/5',
                )
              }
            >
              <it.icon className="h-4 w-4" />
              <span className="leading-none">{it.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

function Shell() {
  return (
    <div className="min-h-dvh bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-400/18 blur-3xl" />
        <div className="absolute top-20 right-[-120px] h-[420px] w-[420px] rounded-full bg-sky-400/14 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[-160px] h-[520px] w-[520px] rounded-full bg-fuchsia-500/12 blur-3xl" />
      </div>

      <TopBar />
      <main className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-3 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <BottomNav />

      <div className="hidden sm:fixed sm:bottom-6 sm:left-1/2 sm:z-50 sm:block sm:-translate-x-1/2">
        <div className="flex items-center gap-2 rounded-2xl bg-black/35 p-2 ring-1 ring-white/10 backdrop-blur">
          <NavLink
            to="/collection"
            className={({ isActive }) =>
              classNames(
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                isActive ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-white/75 hover:bg-white/5',
              )
            }
          >
            <Home className="h-4 w-4" />
            圖鑑
          </NavLink>
          <NavLink
            to="/gacha"
            className={({ isActive }) =>
              classNames(
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                isActive ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-white/75 hover:bg-white/5',
              )
            }
          >
            <Swords className="h-4 w-4" />
            抽卡
          </NavLink>
          <NavLink
            to="/boss"
            className={({ isActive }) =>
              classNames(
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                isActive ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-white/75 hover:bg-white/5',
              )
            }
          >
            <Flame className="h-4 w-4" />
            BOSS
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              classNames(
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                isActive ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-white/75 hover:bg-white/5',
              )
            }
          >
            <Shield className="h-4 w-4" />
            設定
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              classNames(
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                isActive ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-white/75 hover:bg-white/5',
              )
            }
          >
            <UserCog className="h-4 w-4" />
            管理
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  )
}
