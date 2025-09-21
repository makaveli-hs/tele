'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Users, BarChart3, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 바로 대시보드로 리다이렉트
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            텔레마케팅
            <span className="text-blue-600"> 플랫폼</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            리드 관리, 통화 추적, 성과 분석으로
            영업 운영을 최적화하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">
                시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/register">
                회원가입
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Users className="h-8 w-8 text-blue-600" />}
            title="리드 관리"
            description="모든 리드를 중앙 시스템에서 체계적으로 관리하세요"
            href="/dashboard/leads"
          />
          <FeatureCard
            icon={<Phone className="h-8 w-8 text-green-600" />}
            title="통화 추적"
            description="통화 결과를 모니터링하고 상세한 기록을 유지하세요"
            href="/dashboard/calls"
          />
          <FeatureCard
            icon={<Target className="h-8 w-8 text-purple-600" />}
            title="스크립트 관리"
            description="효과적인 스크립트를 작성하고 관리하세요"
            href="/dashboard/scripts"
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8 text-orange-600" />}
            title="성과 분석"
            description="종합적인 보고서와 분석으로 인사이트를 얻으세요"
            href="/dashboard/reports"
          />
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">관리 중인 리드</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">통화 성공률</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">플랫폼 가용성</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function FeatureCard({ icon, title, description, href }: FeatureCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <Link href={href}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardContent>
      </Link>
    </Card>
  );
}
