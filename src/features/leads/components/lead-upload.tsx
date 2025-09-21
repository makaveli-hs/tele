'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface LeadData {
  company_name: string
  department: string
  position: string
  contact_name: string
  phone: string
  email: string
  address: string
  notes: string
}

export function LeadUpload() {
  const [preview, setPreview] = useState<LeadData[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const { toast } = useToast()
  const supabase = createClient()

  const processExcel = (file: File) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        
        // 여러 방법으로 데이터 읽기 시도
        let jsonData: any[] = []
        
        // 방법 1: 일반적인 방식
        try {
          jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' })
          console.log('방법 1 성공:', jsonData.length, '행')
        } catch (e) {
          console.log('방법 1 실패')
        }
        
        // 방법 2: 3번째 행부터 시작
        if (jsonData.length === 0) {
          try {
            jsonData = XLSX.utils.sheet_to_json(sheet, { range: 2, defval: '' })
            console.log('방법 2 성공:', jsonData.length, '행')
          } catch (e) {
            console.log('방법 2 실패')
          }
        }
        
        // 방법 3: Raw 데이터로 읽기
        if (jsonData.length === 0) {
          try {
            jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
            // 첫 번째 비어있지 않은 행을 헤더로 찾기
            let headerIndex = 0
            for (let i = 0; i < Math.min(5, jsonData.length); i++) {
              if (jsonData[i] && jsonData[i].length > 0 && jsonData[i].some((cell: any) => cell)) {
                headerIndex = i
                break
              }
            }
            
            const headers = jsonData[headerIndex] || []
            const dataRows = jsonData.slice(headerIndex + 1)
            
            jsonData = dataRows.map((row: any[]) => {
              const obj: any = {}
              headers.forEach((header: string, index: number) => {
                if (header) {
                  obj[header] = row[index] || ''
                }
              })
              return obj
            })
            console.log('방법 3 성공:', jsonData.length, '행')
          } catch (e) {
            console.log('방법 3 실패')
          }
        }
        
        console.log('읽은 데이터 샘플:', jsonData[0])
        
        // 실제 데이터가 있는 행 찾기 (처음 몇 행은 헤더나 제목일 수 있음)
        let dataStartIndex = 0
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
          const row = jsonData[i]
          // 실제 데이터가 있는 행 찾기 (전화번호 패턴이나 이메일이 있는 행)
          const values = Object.values(row).filter(v => v)
          const hasPhonePattern = values.some((v: any) => 
            String(v).match(/\d{2,4}-\d{2,4}-\d{4}/) || 
            String(v).match(/010-\d{4}-\d{4}/)
          )
          if (hasPhonePattern || values.length > 5) {
            dataStartIndex = i
            console.log('실제 데이터 시작 행:', i, row)
            break
          }
        }
        
        // 실제 데이터만 추출
        const actualData = jsonData.slice(dataStartIndex)
        
        // Map Excel columns to database fields - 위치 기반 매핑
        const mappedData: LeadData[] = actualData.map((row: any) => {
          // 모든 값을 배열로 변환
          const values = Object.values(row).filter(v => v !== '' && v !== null && v !== undefined)
          
          // 표준 열 이름으로 매핑 시도
          let mapped: LeadData = {
            company_name: row['업데이트일'] || row['회사명'] || row['Company'] || row['업체명'] || '',
            department: row['기업별'] || row['부서'] || row['Department'] || row['소속'] || '',
            position: row['비고'] || row['직급'] || row['Position'] || row['직위'] || '',
            contact_name: row['사업자번호'] || row['담당자명'] || row['Contact'] || row['담당자'] || row['이름'] || '',
            phone: row['연락처'] || row['전화번호'] || row['Phone'] || row['휴대폰'] || row['전화'] || '',
            email: row['이메일'] || row['Email'] || row['메일'] || '',
            address: row['신업본부'] || row['주소'] || row['Address'] || row['위치'] || '',
            notes: row['지역'] || row['메모'] || row['Notes'] || row['비고'] || row['기타'] || '',
          }
          
          // 만약 모든 필드가 비어있다면, __EMPTY 필드들을 사용
          if (!mapped.company_name && !mapped.contact_name && !mapped.phone) {
            // 전화번호 패턴 찾기
            const phoneValue = values.find((v: any) => 
              String(v).match(/\d{2,4}-\d{2,4}-\d{4}/) || 
              String(v).match(/010-\d{4}-\d{4}/)
            )
            
            // 이메일 패턴 찾기
            const emailValue = values.find((v: any) => 
              String(v).includes('@')
            )
            
            mapped = {
              company_name: row['*작업일 기재'] || row['__EMPTY'] || values[0] || '',
              department: row['__EMPTY_1'] || values[1] || '',
              position: row['__EMPTY_2'] || values[2] || '',
              contact_name: row['개인\'인 경우 기재'] || row['__EMPTY_3'] || values[3] || '미확인',
              phone: phoneValue || row['__EMPTY_4'] || row['__EMPTY_5'] || values[4] || '',
              email: emailValue || row['__EMPTY_6'] || values[5] || '',
              address: row['__EMPTY_7'] || row['__EMPTY_8'] || values[6] || '',
              notes: row['__EMPTY_9'] || row['__EMPTY_10'] || values.slice(7).join(' ') || '',
            }
          }
          
          return mapped
        })
        
        // 모든 데이터 허용 (빈 행만 제외)
        const validData = mappedData.filter(
          lead => Object.values(lead).some(value => value && value.trim() !== '')
        )
        
        if (validData.length === 0) {
          toast({
            variant: 'destructive',
            title: '데이터가 없습니다',
            description: 'Excel 파일에 데이터가 없습니다',
          })
          return
        }
        
        setPreview(validData)
        setFileName(file.name)
        
        toast({
          title: '파일 읽기 성공',
          description: `${validData.length}개의 리드를 발견했습니다`,
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '파일 처리 실패',
          description: '올바른 Excel 파일인지 확인해주세요',
        })
      }
    }
    
    reader.readAsArrayBuffer(file)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processExcel(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (preview.length === 0) return
    
    setIsUploading(true)
    
    try {
      // 임시로 첫 번째 회사 사용
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()
      
      const companyId = companies?.id
      if (!companyId) throw new Error('회사 정보를 찾을 수 없습니다')
      
      // Prepare leads data
      const leadsToInsert = preview.map(lead => ({
        company_id: companyId,
        contact_name: lead.contact_name || '미확인',  // 담당자명이 없으면 '미확인'으로 저장
        phone: lead.phone || '',
        email: lead.email || null,
        company_name: lead.company_name || null,
        status: 'new',
        priority_level: 5,
        notes: `${lead.department ? `부서: ${lead.department}\n` : ''}${lead.position ? `직급: ${lead.position}\n` : ''}${lead.address ? `주소: ${lead.address}\n` : ''}${lead.notes || ''}`.trim() || null,
      }))
      
      // Insert leads
      const { data, error } = await supabase
        .from('leads')
        .insert(leadsToInsert)
        .select()
      
      if (error) throw error
      
      toast({
        title: '업로드 성공',
        description: `${data.length}개의 리드가 추가되었습니다`,
      })
      
      // Clear preview
      setPreview([])
      setFileName('')
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '업로드 실패',
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setPreview([])
    setFileName('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Excel 파일 업로드</CardTitle>
          <CardDescription>
            Excel 파일을 드래그하거나 클릭하여 리드를 대량으로 등록하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors hover:bg-muted/50
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
            `}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">파일을 놓으세요...</p>
            ) : (
              <>
                <p className="text-lg mb-2">
                  Excel 파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p className="text-sm text-muted-foreground">
                  지원 형식: .xlsx, .xls, .csv
                </p>
              </>
            )}
          </div>

          {fileName && (
            <Alert className="mt-4">
              <Check className="h-4 w-4" />
              <AlertDescription>
                파일 선택됨: {fileName}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
            <CardDescription>
              {preview.length}개의 리드가 업로드될 예정입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회사명</TableHead>
                    <TableHead>담당자</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>부서/직급</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.slice(0, 10).map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell>{lead.company_name}</TableCell>
                      <TableCell>{lead.contact_name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>
                        {[lead.department, lead.position].filter(Boolean).join(' / ')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {preview.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        ... 그 외 {preview.length - 10}개
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>업로드 중...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    리드 등록
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={isUploading}
              >
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Excel 파일 형식:</strong><br />
          회사명 | 부서 | 직급 | 담당자명 | 연락처 | 이메일 | 주소 | 메모
        </AlertDescription>
      </Alert>
    </div>
  )
}