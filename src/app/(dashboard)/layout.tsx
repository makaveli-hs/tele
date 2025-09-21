'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Phone,
  Users,
  FileText,
  BarChart3,
  Settings,
  Home,
  PhoneCall,
} from 'lucide-react'
import { cn } from '@/lib/utils'
interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: Home },
  { name: '통화 관리', href: '/dashboard/calls', icon: PhoneCall },
  { name: '리드 관리', href: '/dashboard/leads', icon: Users },
  { name: '스크립트', href: '/dashboard/scripts', icon: FileText },
  { name: '리포트', href: '/dashboard/reports', icon: BarChart3 },
  { name: '설정', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Phone className="h-8 w-8" />
            <span className="text-xl font-bold">TelePlatform</span>
          </div>
        </div>

        <nav className="px-4 pb-6">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-50">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}