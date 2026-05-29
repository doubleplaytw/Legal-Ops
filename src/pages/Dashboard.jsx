import { useState } from 'react'
import CasePieChart from '../components/modules/CasePieChart'
import DateRangePicker from '../components/ui/DateRangePicker'
import KpiCard from '../components/ui/KpiCard'
import { useDemoMode } from '../hooks/useDemoMode'
import {
  MOCK_ACTIVE_CASES,
  MOCK_RETAINED_CASES,
  MOCK_CONSULTATION_CASES,
  MOCK_KPI,
  MOCK_UPCOMING_DEADLINES,
  DEADLINE_CATEGORIES,
  MOCK_CASES,
  MOCK_CLIENT_HEALTH,
} from '../constants/mockData'

function filterByDateRange(data, from, to) {
  if (!from && !to) return data
  return data.filter((d) => {
    if (from && d.date < from) return false
    if (to && d.date > to) return false
    return true
  })
}

function aggregateByType(data) {
  const map = {}
  data.forEach(({ type, count }) => {
    map[type] = (map[type] || 0) + count
  })
  return Object.entries(map).map(([type, count]) => ({ type, count }))
}

function ChartCard({ title, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-[#1E3480] tracking-widest uppercase">
          {title}
        </h2>
        {badge && (
          <span className="text-xs font-medium bg-[#E8A020]/10 text-[#B87010] px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

const PIPELINE_STAGES = [
  { key: 'appointment', label: '預約諮詢', color: '#94A3B8' },
  { key: 'meeting',     label: '進行會晤', color: '#8B5CF6' },
  { key: 'quote',       label: '報價',     color: '#0D9488' },
  { key: 'signing',     label: '簽約',     color: '#F97316' },
  { key: 'active',      label: '進行中',   color: '#1E3480' },
  { key: 'closed',      label: '結案',     color: '#22C55E' },
]

function PipelineChart() {
  const counts = PIPELINE_STAGES.map((s) => {
    const keys = s.merge || [s.key]
    return { ...s, count: MOCK_CASES.filter((c) => keys.includes(c.status)).length }
  })
  const max = Math.max(...counts.map((s) => s.count), 1)
  const total = counts.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="flex flex-col gap-2.5">
      {counts.map((s) => (
        <div key={s.key} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-16 shrink-0 text-right leading-tight">{s.label}</span>
          <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: s.count === 0 ? '0%' : `${Math.max((s.count / max) * 100, 4)}%`, backgroundColor: s.color + 'CC' }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 w-10 shrink-0">
            {s.count} 件
          </span>
          <span className="text-xs text-gray-300 w-8 shrink-0 text-right">
            {total > 0 ? Math.round((s.count / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  )
}

function calcTrend(current, last, unit, lowerIsBetter = false) {
  const diff = current - last
  if (diff === 0) return null
  const up = diff > 0
  const positive = lowerIsBetter ? !up : up
  const label = `${diff > 0 ? '+' : ''}${diff}${unit}`
  return { label, up, positive }
}

function daysLeftColor(days) {
  if (days <= 2) return 'text-red-500 bg-red-50'
  if (days <= 4) return 'text-orange-500 bg-orange-50'
  return 'text-yellow-600 bg-yellow-50'
}

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10)
  const firstOfYear = `${new Date().getFullYear()}-01-01`

  const isDemoMode = useDemoMode()
  const [retainedRange, setRetainedRange] = useState({ from: firstOfYear, to: today })
  const [consultRange, setConsultRange] = useState({ from: firstOfYear, to: today })

  const retainedData = aggregateByType(
    filterByDateRange(MOCK_RETAINED_CASES, retainedRange.from, retainedRange.to)
  )
  const consultData = aggregateByType(
    filterByDateRange(MOCK_CONSULTATION_CASES, consultRange.from, consultRange.to)
  )
  const noData = [{ type: '無資料', count: 1 }]

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const followUpEvents = MOCK_CLIENT_HEALTH.flatMap((client) =>
    client.followUps
      .filter((f) => !f.done && f.date)
      .map((f) => ({
        id: `fu-${client.id}-${f.id}`,
        taskTitle: f.task,
        date: f.date,
        daysLeft: Math.floor((new Date(f.date) - todayDate) / 86400000),
        category: f.category,
        caseNo: client.caseNo,
        parties: client.parties,
        cause: client.cause,
        relief: client.relief,
        caseType: client.caseType,
        lawyer: client.lawyer,
      }))
  )
  const allEvents = [...MOCK_UPCOMING_DEADLINES, ...followUpEvents]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10)

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">

        {/* Page title */}
        <div className="flex items-end gap-4">
          <div>
            <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Overview</p>
            <h1 className="text-2xl font-bold text-[#1E3480]">案件總覽</h1>
          </div>
          <div className="mb-1 h-px flex-1 bg-gradient-to-r from-[#1E3480]/20 to-transparent" />
        </div>

        {/* Section: 案件概況 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">案件概況</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="本月預計結案" value={MOCK_KPI.plannedCloseThisMonth} unit="件" sub="較上月底" trend={calcTrend(MOCK_KPI.plannedCloseThisMonth, MOCK_KPI.plannedCloseLastMonth, ' 件')} />
            <KpiCard label="本月實際結案" value={MOCK_KPI.closedThisMonth} unit="件" sub="較上月底" trend={calcTrend(MOCK_KPI.closedThisMonth, MOCK_KPI.closedLastMonth, ' 件')} />
            <KpiCard label="委任轉換率" value={MOCK_KPI.conversionRate} unit="%" sub="較上月底" trend={calcTrend(MOCK_KPI.conversionRate, MOCK_KPI.conversionRateLastMonth, '%')} />
            <KpiCard label="七天內到期事件" value={MOCK_KPI.upcomingDeadlines} unit="件" />
          </div>
        </div>

        {/* Section: 帳務概況 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">帳務概況</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KpiCard label="尚未請款案件" value={MOCK_KPI.uninvoiced} unit="件" sub="較上月" trend={MOCK_KPI.uninvoicedTrend} amount={MOCK_KPI.uninvoicedAmount} />
            <KpiCard label="已請款尚未付款" value={MOCK_KPI.invoicedUnpaid} unit="件" sub="較上月" trend={MOCK_KPI.invoicedUnpaidTrend} amount={MOCK_KPI.invoicedUnpaidAmount} />
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {!isDemoMode && (
          <ChartCard title="下一個事件時間點">
            <div className="overflow-y-auto max-h-[400px] flex flex-col divide-y divide-gray-50 pr-1">
              {allEvents.map((item) => {
                  const cat = DEADLINE_CATEGORIES[item.category]
                  return (
                    <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${cat.color}`}>
                            {cat.label}
                          </span>
                          <span className="text-sm font-semibold text-[#1E3480]">
                            {item.taskTitle || item.cause}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 pl-0.5">
                          <span className="text-xs text-gray-600">{item.parties}</span>
                          {item.taskTitle && (
                            <span className="text-xs font-semibold text-[#1E3480]">{item.cause}</span>
                          )}
                          <span className="text-xs text-gray-600">{item.relief}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-300">{item.caseNo}</span>
                            <span className="text-xs text-gray-200">·</span>
                            <span className="text-xs text-gray-300">{item.lawyer}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-xs text-gray-400">{item.date}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${daysLeftColor(item.daysLeft)}`}>
                          {item.daysLeft} 天後
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </ChartCard>
        )}

        {/* Pipeline Distribution */}
        {!isDemoMode && (
          <ChartCard title="案件流程分布">
            <PipelineChart />
          </ChartCard>
        )}

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="進行中案件" badge="即時">
            <div className="h-[36px]" />
            <CasePieChart data={MOCK_ACTIVE_CASES} />
          </ChartCard>

          <ChartCard title="確定委任案件">
            <DateRangePicker
              from={retainedRange.from}
              to={retainedRange.to}
              onChange={setRetainedRange}
            />
            <CasePieChart data={retainedData.length ? retainedData : noData} />
          </ChartCard>

          <ChartCard title="諮詢案件">
            <DateRangePicker
              from={consultRange.from}
              to={consultRange.to}
              onChange={setConsultRange}
            />
            <CasePieChart data={consultData.length ? consultData : noData} />
          </ChartCard>
        </div>

      </div>
    </div>
  )
}
