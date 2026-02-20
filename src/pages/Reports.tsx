import { useAuth } from '@/hooks/useAuth'
import { MonthlySummary } from '@/components/reports/MonthlySummary'
import { CustomDateRange } from '@/components/reports/CustomDateRange'
import { BySpender } from '@/components/reports/BySpender'
import { CategoryTrend } from '@/components/reports/CategoryTrend'
import { exportToCsv, exportToPdf } from '@/utils/export'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ExpenseWithRelations } from '@/types/database'

export default function Reports() {
  const { profile } = useAuth()
  const currency = profile?.currency || 'USD'

  function handleExportCsv(expenses: unknown[]) {
    exportToCsv(expenses as ExpenseWithRelations[], currency)
  }

  function handleExportPdf(expenses: unknown[], startDate: string, endDate: string) {
    exportToPdf(expenses as ExpenseWithRelations[], currency, startDate, endDate)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reports</h2>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="custom">Custom Range</TabsTrigger>
          <TabsTrigger value="spender">By Spender</TabsTrigger>
          <TabsTrigger value="trend">Category Trend</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly" className="mt-4">
          <MonthlySummary onExportCsv={handleExportCsv} onExportPdf={handleExportPdf} />
        </TabsContent>
        <TabsContent value="custom" className="mt-4">
          <CustomDateRange onExportCsv={handleExportCsv} onExportPdf={handleExportPdf} />
        </TabsContent>
        <TabsContent value="spender" className="mt-4">
          <BySpender />
        </TabsContent>
        <TabsContent value="trend" className="mt-4">
          <CategoryTrend />
        </TabsContent>
      </Tabs>
    </div>
  )
}
