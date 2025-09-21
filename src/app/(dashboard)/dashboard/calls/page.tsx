'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, History } from 'lucide-react'
import { CallForm } from '@/features/calls/components/call-form'
import { CallHistory } from '@/features/calls/components/call-history'

export default function CallsPage() {
  const [activeTab, setActiveTab] = useState('new')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">통화 관리</h1>
        <p className="text-muted-foreground">통화를 기록하고 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new">
            <Phone className="mr-2 h-4 w-4" />
            새 통화
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            통화 기록
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="mt-6">
          <CallForm />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <CallHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}