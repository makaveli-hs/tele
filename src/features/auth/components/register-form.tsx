'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, '회사명을 입력해주세요'),
  name: z.string().min(2, '이름을 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      name: '',
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company_name: data.companyName,
          },
        },
      })

      if (authError) {
        toast({
          variant: 'destructive',
          title: '회원가입 실패',
          description: authError.message,
        })
        return
      }

      if (!authData.user) {
        toast({
          variant: 'destructive',
          title: '오류가 발생했습니다',
          description: '사용자 생성에 실패했습니다',
        })
        return
      }

      // 2. Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.companyName,
        })
        .select()
        .single()

      if (companyError) {
        toast({
          variant: 'destructive',
          title: '회사 생성 실패',
          description: companyError.message,
        })
        return
      }

      // 3. Create employee
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .insert({
          company_id: company.id,
          name: data.name,
          email: data.email,
          role: 'admin', // First user is admin
        })
        .select()
        .single()

      if (employeeError) {
        toast({
          variant: 'destructive',
          title: '직원 정보 생성 실패',
          description: employeeError.message,
        })
        return
      }

      // 4. Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          employee_id: employee.id,
        })
        .eq('id', authData.user.id)

      if (profileError) {
        toast({
          variant: 'destructive',
          title: '프로필 업데이트 실패',
          description: profileError.message,
        })
        return
      }

      toast({
        title: '회원가입 성공',
        description: '이메일 인증 후 로그인해주세요',
      })

      router.push('/login')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류가 발생했습니다',
        description: '잠시 후 다시 시도해주세요',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>회사명</FormLabel>
              <FormControl>
                <Input
                  placeholder="회사명을 입력하세요"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input
                  placeholder="이름을 입력하세요"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 확인</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          회원가입
        </Button>
      </form>
    </Form>
  )
}