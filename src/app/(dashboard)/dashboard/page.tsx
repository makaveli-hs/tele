'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import {
  Phone,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  PhoneCall,
  UserCheck,
} from 'lucide-react'

interface DashboardStats {
  totalCalls: number
  successfulCalls: number
  totalLeads: number
  activeEmployees: number
  avgCallDuration: number
  todayCalls: number
  conversionRate: number
  pendingCallbacks: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    successfulCalls: 0,
    totalLeads: 0,
    activeEmployees: 0,
    avgCallDuration: 0,
    todayCalls: 0,
    conversionRate: 0,
    pendingCallbacks: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // 임시로 첫 번째 회사의 데이터를 사용 (나중에 인증 추가 시 수정)
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()

      const companyId = companies?.id
      if (!companyId) {
        // 회사가 없으면 기본값 표시
        setLoading(false)
        return
      }

      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', companyId)
        .limit(1)
        .single()

      const employeeId = employees?.id

      // Fetch stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Total calls
      const { count: totalCalls } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId || '')

      // Successful calls
      const { data: successOutcomes } = await supabase
        .from('outcomes')
        .select('id')
        .eq('is_success', true)

      const successOutcomeIds = successOutcomes?.map(o => o.id) || []
      
      const { count: successfulCalls } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .in('outcome_id', successOutcomeIds)
        .eq('employee_id', employeeId || '')

      // Total leads
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)

      // Active employees
      const { count: activeEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active')

      // Today's calls
      const { count: todayCalls } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId || '')
        .gte('call_time', today.toISOString())

      // Average call duration
      const { data: callDurations } = await supabase
        .from('call_logs')
        .select('duration')
        .eq('employee_id', employeeId || '')
        .not('duration', 'is', null)

      const avgCallDuration = callDurations && callDurations.length > 0
        ? callDurations.reduce((sum, call) => sum + (call.duration || 0), 0) / callDurations.length
        : 0

      // Pending callbacks
      const { data: followupOutcomes } = await supabase
        .from('outcomes')
        .select('id')
        .eq('requires_followup', true)

      const followupOutcomeIds = followupOutcomes?.map(o => o.id) || []

      const { count: pendingCallbacks } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .in('outcome_id', followupOutcomeIds)
        .eq('employee_id', employeeId || '')

      // Calculate conversion rate
      const conversionRate = totalCalls && totalCalls > 0
        ? (successfulCalls || 0) / totalCalls * 100
        : 0

      setStats({
        totalCalls: totalCalls || 0,
        successfulCalls: successfulCalls || 0,
        totalLeads: totalLeads || 0,
        activeEmployees: activeEmployees || 0,
        avgCallDuration,
        todayCalls: todayCalls || 0,
        conversionRate,
        pendingCallbacks: pendingCallbacks || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}분 ${secs.toFixed(0)}초`
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">로딩중...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">실시간 성과 지표를 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 통화</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCalls}</div>
            <p className="text-xs text-muted-foreground">
              전체 {stats.totalCalls}건 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulCalls}건 성공
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 통화시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgCallDuration)}</div>
            <p className="text-xs text-muted-foreground">
              평균 통화 시간
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재통화 예정</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCallbacks}</div>
            <p className="text-xs text-muted-foreground">
              후속 조치 필요
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 리드</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">관리 중인 고객</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활동 중인 직원</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">현재 활동 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">통화 성과</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{stats.successfulCalls}</span>
              </div>
              <div className="flex items-center space-x-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">{stats.totalCalls - stats.successfulCalls}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">성공 / 실패</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            최근 통화 기록이 여기에 표시됩니다
          </div>
        </CardContent>
      </Card>
    </div>
  )
}