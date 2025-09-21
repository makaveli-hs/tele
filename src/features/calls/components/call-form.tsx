'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Phone, PhoneOff, Clock, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Lead {
  id: string
  contact_name: string
  company_name: string
  phone: string
}

interface Outcome {
  id: string
  name: string
  is_success: boolean
  requires_followup: boolean
}

interface Script {
  id: string
  title: string
  content: string
}

export function CallForm() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [scripts, setScripts] = useState<Script[]>([])
  const [selectedLead, setSelectedLead] = useState<string>('')
  const [selectedOutcome, setSelectedOutcome] = useState<string>('')
  const [selectedScript, setSelectedScript] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isCallActive, setIsCallActive] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callStartTime, setCallStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (isCallActive) {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isCallActive])

  const fetchData = async () => {
    try {
      // 임시로 첫 번째 회사 사용
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()

      const companyId = companies?.id
      if (!companyId) return

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('id, contact_name, company_name, phone')
        .eq('company_id', companyId)
        .in('status', ['new', 'contacted', 'qualified'])
        .order('priority_level', { ascending: false })

      setLeads(leadsData || [])

      // Fetch outcomes
      const { data: outcomesData } = await supabase
        .from('outcomes')
        .select('*')
        .order('name')

      setOutcomes(outcomesData || [])

      // Fetch scripts
      const { data: scriptsData } = await supabase
        .from('scripts')
        .select('id, title, content')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      setScripts(scriptsData || [])
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '데이터 로드 실패',
        description: error.message,
      })
    }
  }

  const startCall = () => {
    if (!selectedLead) {
      toast({
        variant: 'destructive',
        title: '리드를 선택해주세요',
        description: '통화할 고객을 먼저 선택해야 합니다',
      })
      return
    }

    setIsCallActive(true)
    setCallStartTime(new Date())
    setCallDuration(0)
    
    toast({
      title: '통화 시작',
      description: '타이머가 시작되었습니다',
    })
  }

  const endCall = async () => {
    if (!selectedOutcome) {
      toast({
        variant: 'destructive',
        title: '통화 결과를 선택해주세요',
        description: '통화 결과를 반드시 선택해야 합니다',
      })
      return
    }

    setIsCallActive(false)

    try {
      // 임시로 첫 번째 직원 사용
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()

      const companyId = companies?.id
      if (!companyId) throw new Error('회사 정보를 찾을 수 없습니다')

      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', companyId)
        .limit(1)
        .single()

      const employeeId = employees?.id
      if (!employeeId) throw new Error('직원 정보를 찾을 수 없습니다')

      // Save call log
      const { error } = await supabase
        .from('call_logs')
        .insert({
          employee_id: employeeId,
          lead_id: selectedLead,
          outcome_id: selectedOutcome,
          script_id: selectedScript === 'none' ? null : selectedScript || null,
          call_time: callStartTime?.toISOString(),
          duration: callDuration,
          notes: notes || null,
        })

      if (error) throw error

      // Update lead status if contacted
      const outcome = outcomes.find(o => o.id === selectedOutcome)
      if (outcome?.name === 'success' || outcome?.name === 'interested') {
        await supabase
          .from('leads')
          .update({ 
            status: 'contacted',
            last_contact_date: new Date().toISOString()
          })
          .eq('id', selectedLead)
      }

      // Update script usage count
      if (selectedScript && selectedScript !== 'none') {
        await supabase.rpc('increment', {
          table_name: 'scripts',
          row_id: selectedScript,
          column_name: 'usage_count'
        })
      }

      toast({
        title: '통화 기록 저장',
        description: `통화 시간: ${formatDuration(callDuration)}`,
      })

      // Reset form
      setSelectedLead('')
      setSelectedOutcome('')
      setSelectedScript('')
      setNotes('')
      setCallDuration(0)
      setCallStartTime(null)

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '저장 실패',
        description: error.message,
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const selectedLeadInfo = leads.find(l => l.id === selectedLead)
  const selectedScriptContent = selectedScript && selectedScript !== 'none' 
    ? scripts.find(s => s.id === selectedScript)
    : null

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>새 통화</CardTitle>
            <CardDescription>고객을 선택하고 통화를 시작하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lead">고객 선택</Label>
              <Select value={selectedLead} onValueChange={setSelectedLead} disabled={isCallActive}>
                <SelectTrigger id="lead">
                  <SelectValue placeholder="통화할 고객을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.contact_name} - {lead.company_name || '개인'} ({lead.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLeadInfo && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedLeadInfo.contact_name}</p>
                <p className="text-sm text-muted-foreground">{selectedLeadInfo.company_name}</p>
                <p className="text-sm font-mono">{selectedLeadInfo.phone}</p>
              </div>
            )}

            <div>
              <Label htmlFor="script">스크립트 선택 (선택사항)</Label>
              <Select value={selectedScript} onValueChange={setSelectedScript}>
                <SelectTrigger id="script">
                  <SelectValue placeholder="스크립트를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">스크립트 없음</SelectItem>
                  {scripts.map((script) => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-4xl font-mono mb-4">
                  {formatDuration(callDuration)}
                </div>
                {!isCallActive ? (
                  <Button size="lg" onClick={startCall} className="w-40">
                    <Phone className="mr-2 h-5 w-5" />
                    통화 시작
                  </Button>
                ) : (
                  <Button size="lg" variant="destructive" onClick={endCall} className="w-40">
                    <PhoneOff className="mr-2 h-5 w-5" />
                    통화 종료
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="outcome">통화 결과</Label>
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger id="outcome">
                  <SelectValue placeholder="통화 결과를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {outcomes.map((outcome) => (
                    <SelectItem key={outcome.id} value={outcome.id}>
                      {outcome.name}
                      {outcome.is_success && ' ✅'}
                      {outcome.requires_followup && ' 🔄'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                placeholder="통화 내용을 메모하세요..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {selectedScriptContent && (
          <Card>
            <CardHeader>
              <CardTitle>스크립트</CardTitle>
              <CardDescription>{selectedScriptContent.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {selectedScriptContent.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>빠른 메모</CardTitle>
            <CardDescription>자주 사용하는 응답</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setNotes(notes + '\n관심 있음 - 자료 발송 예정')}
              >
                관심 있음 - 자료 발송
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setNotes(notes + '\n재통화 요청 - 다음 주')}
              >
                재통화 요청
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setNotes(notes + '\n예산 부족')}
              >
                예산 부족
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setNotes(notes + '\n담당자 변경')}
              >
                담당자 변경
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}