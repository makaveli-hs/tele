'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Upload } from 'lucide-react'
import { LeadList } from '@/features/leads/components/lead-list'
import { LeadUpload } from '@/features/leads/components/lead-upload'

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState('list')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">리드 관리</h1>
          <p className="text-muted-foreground">고객 정보를 관리하고 추적하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab('upload')}>
            <Upload className="mr-2 h-4 w-4" />
            Excel 업로드
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 리드 추가
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">리드 목록</TabsTrigger>
          <TabsTrigger value="upload">대량 업로드</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <LeadList />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-6">
          <LeadUpload />
        </TabsContent>
      </Tabs>
    </div>
  )
}