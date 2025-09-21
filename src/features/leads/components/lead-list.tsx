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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Phone, Mail, Edit, Trash } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Lead {
  id: string
  contact_name: string
  phone: string
  email: string
  company_name: string
  status: string
  priority_level: number
  notes: string
  created_at: string
  last_contact_date: string
}

const statusColors: Record<string, string> = {
  new: 'default',
  contacted: 'secondary',
  qualified: 'success',
  converted: 'success',
  lost: 'destructive',
}

const statusLabels: Record<string, string> = {
  new: '신규',
  contacted: '연락함',
  qualified: '적격',
  converted: '전환',
  lost: '실패',
}

export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      // 임시로 첫 번째 회사의 데이터를 사용
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

      // Fetch leads
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setLeads(data || [])
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

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 리드를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: '삭제 완료',
        description: '리드가 삭제되었습니다',
      })

      setLeads(leads.filter(lead => lead.id !== id))
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '삭제 실패',
        description: error.message,
      })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          last_contact_date: newStatus === 'contacted' ? new Date().toISOString() : undefined
        })
        .eq('id', id)

      if (error) throw error

      toast({
        title: '상태 변경',
        description: '리드 상태가 업데이트되었습니다',
      })

      setLeads(leads.map(lead => 
        lead.id === id 
          ? { ...lead, status: newStatus }
          : lead
      ))
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '업데이트 실패',
        description: error.message,
      })
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesStatus
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
            placeholder="이름, 회사, 연락처로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="new">신규</SelectItem>
            <SelectItem value="contacted">연락함</SelectItem>
            <SelectItem value="qualified">적격</SelectItem>
            <SelectItem value="converted">전환</SelectItem>
            <SelectItem value="lost">실패</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>담당자</TableHead>
              <TableHead>회사</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>우선순위</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  리드가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.contact_name}</TableCell>
                  <TableCell>{lead.company_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-sm">{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{lead.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">신규</SelectItem>
                        <SelectItem value="contacted">연락함</SelectItem>
                        <SelectItem value="qualified">적격</SelectItem>
                        <SelectItem value="converted">전환</SelectItem>
                        <SelectItem value="lost">실패</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.priority_level >= 8 ? 'destructive' : lead.priority_level >= 5 ? 'secondary' : 'outline'}>
                      {lead.priority_level}/10
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(lead.created_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>액션</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          통화하기
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}