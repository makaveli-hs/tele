'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Phone, Clock, Calendar, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface CallLog {
  id: string
  call_time: string
  duration: number
  notes: string
  lead: {
    contact_name: string
    company_name: string
    phone: string
  }
  outcome: {
    name: string
    is_success: boolean
    requires_followup: boolean
  }
  script: {
    title: string
  } | null
}

export function CallHistory() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchCallLogs()
  }, [dateFilter])

  const fetchCallLogs = async () => {
    try {
      // 임시로 첫 번째 직원 사용
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()

      const companyId = companies?.id
      if (!companyId) {
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
      if (!employeeId) {
        setLoading(false)
        return
      }

      let query = supabase
        .from('call_logs')
        .select(`
          *,
          lead:leads!inner(contact_name, company_name, phone),
          outcome:outcomes!inner(name, is_success, requires_followup),
          script:scripts(title)
        `)
        .eq('employee_id', employeeId)
        .order('call_time', { ascending: false })

      // Date filter
      const now = new Date()
      if (dateFilter === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        query = query.gte('call_time', today.toISOString())
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        query = query.gte('call_time', weekAgo.toISOString())
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        query = query.gte('call_time', monthAgo.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      setCallLogs(data || [])
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '데이터 로드 실패',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}분 ${secs}초`
  }

  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = 
      log.lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.lead.phone.includes(searchTerm) ||
      log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesOutcome = 
      outcomeFilter === 'all' ||
      (outcomeFilter === 'success' && log.outcome.is_success) ||
      (outcomeFilter === 'followup' && log.outcome.requires_followup) ||
      (outcomeFilter === 'failed' && !log.outcome.is_success && !log.outcome.requires_followup)

    return matchesSearch && matchesOutcome
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">로딩중...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="이름, 회사, 메모로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="기간" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="today">오늘</SelectItem>
            <SelectItem value="week">이번 주</SelectItem>
            <SelectItem value="month">이번 달</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="결과" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 결과</SelectItem>
            <SelectItem value="success">성공</SelectItem>
            <SelectItem value="followup">후속필요</SelectItem>
            <SelectItem value="failed">실패</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜/시간</TableHead>
              <TableHead>고객</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>통화시간</TableHead>
              <TableHead>결과</TableHead>
              <TableHead>스크립트</TableHead>
              <TableHead>메모</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  통화 기록이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {format(new Date(log.call_time), 'MM/dd', { locale: ko })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.call_time), 'HH:mm')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.lead.contact_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {log.lead.company_name || '개인'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{log.lead.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{formatDuration(log.duration)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.outcome.is_success
                          ? 'default'
                          : log.outcome.requires_followup
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {log.outcome.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.script ? (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span className="text-sm">{log.script.title}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm line-clamp-2">
                      {log.notes || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          총 {filteredLogs.length}개의 통화 기록
        </div>
        <div>
          총 통화 시간: {formatDuration(filteredLogs.reduce((sum, log) => sum + log.duration, 0))}
        </div>
      </div>
    </div>
  )
}