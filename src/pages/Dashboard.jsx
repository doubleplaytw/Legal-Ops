import { useState } from 'react'
import CasePieChart from '../components/modules/CasePieChart'
import KpiCard from '../components/ui/KpiCard'
import { useDemoMode } from '../hooks/useDemoMode'
import { CASE_TYPE_COLORS, CASE_TYPES } from '../constants/caseTypes'
import {
  MOCK_ACTIVE_CASES,
  MOCK_RETAINED_CASES,
  MOCK_CONSULTATION_CASES,
  MOCK_KPI,
  MOCK_UPCOMING_DEADLINES,
  DEADLINE_CATEGORIES,
  MOCK_CASES,
  MOCK_CLIENT_HEALTH,
  MOCK_CYCLE_DAYS_BY_TYPE,
  MOCK_CONVERSION_FUNNEL,
  MOCK_APPEAL_FUNNEL,
  MOCK_RETAINER_FUNNEL,
  MOCK_QUARTERLY_REVENUE,
  MOCK_CONSULTATION_HOURS,
} from '../constants/mockData'

// ── helpers ───────────────────────────────────────────────────────────────────

function aggregateByType(data) {
  const map = {}
  data.forEach(({ type, count }) => { map[type] = (map[type] || 0) + count })
  return Object.entries(map).map(([type, count]) => ({ type, count }))
}

function calcTrend(current, last, unit) {
  const diff = current - last
  if (diff === 0) return null
  return { label: `${diff > 0 ? '+' : ''}${diff}${unit}`, up: diff > 0, positive: diff > 0 }
}

function daysLeftColor(days) {
  if (days <= 2) return 'text-red-500 bg-red-50'
  if (days <= 4) return 'text-orange-500 bg-orange-50'
  return 'text-yellow-600 bg-yellow-50'
}

// ── sub-components ────────────────────────────────────────────────────────────

function GoalCard({ title, pct, target, current, lastMonth, unit, color, className = '' }) {
  const R = 66, cx = 100, cy = 90, SW = 15
  const C = Math.PI * R
  const fill = Math.min(pct, 1) * C
  const path = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`
  const pctInt = Math.round(pct * 100)

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col gap-4 overflow-hidden h-[330px] ${className}`}>
      <div className="shrink-0">
        <h2 className="text-sm font-semibold text-[#1E3480] tracking-widest uppercase">{title}</h2>
      </div>
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {/* Gauge */}
        <div className="flex-1 min-h-0">
          <svg viewBox="0 0 200 100" width="100%" height="100%">
            <path d={path} fill="none" stroke="#F3F4F6" strokeWidth={SW} strokeLinecap="round" />
            {fill > 0 && (
              <path d={path} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round"
                strokeDasharray={`${fill} 9999`} />
            )}
            <text x="100" y="72" textAnchor="middle" fill={color}
              fontSize="26" fontWeight="800" fontFamily="system-ui, sans-serif">{pctInt}%</text>
            <text x="100" y="86" textAnchor="middle" fill="#9CA3AF"
              fontSize="11" fontFamily="system-ui, sans-serif">達成率</text>
          </svg>
        </div>

        {/* Stats */}
        <div className="shrink-0 grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          {[
            { label: '目標',   value: target    },
            { label: '目前實際', value: current  },
            { label: '上月實際', value: lastMonth },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-lg font-bold text-[#1E3480] leading-tight">
                {value}<span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, badge, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col gap-4 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-[#1E3480] tracking-widest uppercase">{title}</h2>
        {badge && (
          <span className="text-sm font-medium bg-[#E8A020]/10 text-[#B87010] px-2.5 py-1 rounded-full">{badge}</span>
        )}
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  )
}

const PIPELINE_STAGES = [
  { key: 'appointment', label: '預約諮詢', color: '#94A3B8' },
  { key: 'meeting',     label: '進行會晤', color: '#8B5CF6' },
  { key: 'quote',       label: '報價',     color: '#0D9488' },
  { key: 'signing',     label: '簽約',     color: '#F97316' },
  { key: 'active',      label: '進行中',   color: '#1E3480' },
]

function FunnelChart({ data }) {
  const max = data[0]?.count || 1

  return (
    <div className="flex gap-3 h-full">

      {/* Center: connected funnel */}
      <div className="flex-1 flex flex-col">
        {data.map((s, i) => {
          const next = data[i + 1]
          const topPct = s.count / max
          const botPct = next ? next.count / max : topPct
          const tl = `${((1 - topPct) / 2) * 100}%`
          const tr = `${(1 - (1 - topPct) / 2) * 100}%`
          const bl = `${((1 - botPct) / 2) * 100}%`
          const br = `${(1 - (1 - botPct) / 2) * 100}%`
          return (
            <div key={s.stage} className="flex-1 relative">
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  clipPath: `polygon(${tl} 0%, ${tr} 0%, ${br} 100%, ${bl} 100%)`,
                  backgroundColor: s.color + 'E0',
                }}
              >
                <span className="text-sm font-bold text-white leading-none drop-shadow-sm">{s.stage}</span>
                <span className="text-xs font-semibold text-white/80 mt-0.5">{s.count} 件</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right: conversion rates — absolutely centred on each stage boundary */}
      <div className="w-14 shrink-0 relative">
        {data.map((s, i) => {
          const next = data[i + 1]
          const rate = next ? Math.round((next.count / s.count) * 100) : null
          if (rate === null) return null
          const topPct = ((i + 1) / data.length) * 100
          return (
            <div
              key={s.stage}
              className="absolute left-0 right-0 flex items-center"
              style={{ top: `${topPct}%`, transform: 'translateY(-50%)' }}
            >
              <span className="text-sm font-bold text-[#1E3480] flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 0.5v7M1 5l3.5 3L8 5"/>
                </svg>
                {rate}%
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}

function ConversionFunnelChart() { return <FunnelChart data={MOCK_CONVERSION_FUNNEL} /> }
function AppealFunnelChart()     { return <FunnelChart data={MOCK_APPEAL_FUNNEL} /> }
function RetainerFunnelChart()   { return <FunnelChart data={MOCK_RETAINER_FUNNEL} /> }

function CycleDaysChart() {
  const max = Math.max(...MOCK_CYCLE_DAYS_BY_TYPE.map((d) => d.avgDays))
  const overall = Math.round(MOCK_CYCLE_DAYS_BY_TYPE.reduce((s, d) => s + d.avgDays, 0) / MOCK_CYCLE_DAYS_BY_TYPE.length)
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">全所平均</span>
        <span className="text-base font-bold text-[#1E3480]">{overall} 天</span>
      </div>
      {MOCK_CYCLE_DAYS_BY_TYPE.map((d, i) => (
        <div key={d.type} className="flex items-center gap-3">
          <span className="text-sm text-gray-500 w-16 shrink-0 text-right leading-tight">{d.type}</span>
          <div className="flex-1 h-7 bg-gray-50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
              style={{ width: `${(d.avgDays / max) * 100}%`, backgroundColor: CASE_TYPE_COLORS[i] + 'CC' }}
            >
              <span className="text-xs font-semibold text-white whitespace-nowrap">{d.avgDays} 天</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


// ── Proposal chart components ─────────────────────────────────────────────────

function HBarChart({ data, valueKey = 'count', labelKey = 'type', unit = '', formatFn }) {
  const max = Math.max(...data.map((d) => d[valueKey]))
  const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey])
  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((d, i) => {
        const val = d[valueKey]
        const pct = (val / max) * 100
        const colorIdx = CASE_TYPES.indexOf(d[labelKey])
        const color = (colorIdx >= 0 ? CASE_TYPE_COLORS[colorIdx] : CASE_TYPE_COLORS[i % CASE_TYPE_COLORS.length])
        const label = formatFn ? formatFn(val) : `${val}${unit}`
        return (
          <div key={d[labelKey]} className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-16 shrink-0 text-right leading-tight">{d[labelKey]}</span>
            <div className="flex-1 h-7 bg-gray-50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color + 'CC' }}
              >
                <span className="text-xs font-semibold text-white whitespace-nowrap">{label}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const isDemoMode = useDemoMode()

  const retainedData = aggregateByType(MOCK_RETAINED_CASES)
  const consultData  = aggregateByType(MOCK_CONSULTATION_CASES)


  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const overdueCount = MOCK_CASES.filter((c) => {
    if (c.status === 'closed' || !c.expectedCloseDate) return false
    return new Date(c.expectedCloseDate) < todayDate
  }).length

  const warningCount = MOCK_CASES.filter((c) => {
    if (c.status === 'closed' || !c.expectedCloseDate) return false
    const d = Math.ceil((new Date(c.expectedCloseDate) - todayDate) / 86400000)
    return d >= 0 && d <= 30
  }).length

  const followUpEvents = MOCK_CLIENT_HEALTH.flatMap((client) =>
    client.followUps.filter((f) => !f.done && f.date).map((f) => ({
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
      lawyer: client.lawyer + ' 律師',
    }))
  )

  const allEventsRaw = [
    ...MOCK_UPCOMING_DEADLINES.map((e) => ({
      ...e,
      daysLeft: Math.floor((new Date(e.date) - todayDate) / 86400000),
      taskTitle: e.action,
    })),
    ...followUpEvents,
  ].sort((a, b) => a.daysLeft - b.daysLeft)

  const eventOverdueCount = allEventsRaw.filter((e) => e.daysLeft < 0).length
  const eventWarningCount = allEventsRaw.filter((e) => e.daysLeft >= 0 && e.daysLeft <= 7).length
  const allEvents = allEventsRaw.slice(0, 10)

  const closingCases = MOCK_CASES
    .filter((c) => c.status !== 'closed' && c.expectedCloseDate)
    .map((c) => ({ ...c, daysLeft: Math.ceil((new Date(c.expectedCloseDate) - todayDate) / 86400000) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const judgmentPendingCases = MOCK_CASES.filter(c => c.status === 'pending_renewal' && c.renewalReason === 'judgment')
  const retainerPendingCases = MOCK_CASES.filter(c => c.status === 'pending_renewal' && c.renewalReason === 'retainer')


  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-[#F4F6FB]/95 backdrop-blur-sm border-b border-gray-200/60 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-end gap-4">
          <div>
            <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-0.5">Overview</p>
            <h1 className="text-2xl font-bold text-[#1E3480]">案件總覽</h1>
          </div>
          <div className="mb-1 h-px flex-1 bg-gradient-to-r from-[#1E3480]/20 to-transparent" />
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* ── Dashboard Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* ── 目標指標 ─────────────────────────────────────────────────── */}
          <GoalCard
            title="本月營收目標"
            pct={MOCK_KPI.monthlyRevenueCurrent / MOCK_KPI.monthlyRevenueTarget}
            target={MOCK_KPI.monthlyRevenueTarget}
            current={MOCK_KPI.monthlyRevenueCurrent}
            lastMonth={MOCK_KPI.monthlyRevenueLastMonth}
            unit="萬"
            color="#E8A020"
            className="col-span-6"
          />
          <GoalCard
            title="本月轉換率目標"
            pct={MOCK_KPI.conversionRate / MOCK_KPI.conversionRateTarget}
            target={MOCK_KPI.conversionRateTarget}
            current={MOCK_KPI.conversionRate}
            lastMonth={MOCK_KPI.conversionRateLastMonth}
            unit="%"
            color="#2E56C8"
            className="col-span-6"
          />

          {/* ── Row 2：三漏斗圖 ──────────────────────────────────────────── */}

          <ChartCard title="客戶轉換漏斗" className="col-span-4 h-[330px]">
            <ConversionFunnelChart />
          </ChartCard>
          <ChartCard title="上訴未委任追蹤" className="col-span-4 h-[330px]">
            <AppealFunnelChart />
          </ChartCard>
          <ChartCard title="常年法顧續約追蹤" className="col-span-4 h-[330px]">
            <RetainerFunnelChart />
          </ChartCard>

          {/* ── Row 3：諮詢時數 + 確定委任 ───────────────────────────────── */}

          <ChartCard title="諮詢案件時數分布" className="col-span-6 self-start">
            <HBarChart data={MOCK_CONSULTATION_HOURS} valueKey="hours" unit=" 小時" />
          </ChartCard>
          <ChartCard title="確定委任案件" className="col-span-6 self-start h-[416px]">
            <CasePieChart data={retainedData} />
          </ChartCard>

          {/* ── Row 4：案件流程 + 進行中 + 結案 KPI（垂直堆疊） ─────────── */}

          <ChartCard title="案件流程分布" className="col-span-4 h-[330px]">
            <CasePieChart
              data={PIPELINE_STAGES.map((s) => ({ type: s.label, count: MOCK_CASES.filter((c) => c.status === s.key).length })).filter((s) => s.count > 0)}
              colors={PIPELINE_STAGES.filter((s) => MOCK_CASES.some((c) => c.status === s.key)).map((s) => s.color)}
            />
          </ChartCard>
          <ChartCard title="進行中案件" className="col-span-4 h-[330px]">
            <CasePieChart data={MOCK_ACTIVE_CASES} />
          </ChartCard>
          <div className="col-span-4 flex flex-col gap-4 self-stretch">
            <KpiCard label="預計結案" value={MOCK_KPI.plannedCloseThisMonth} unit="件" sub="上月比較" trend={calcTrend(MOCK_KPI.plannedCloseThisMonth, MOCK_KPI.plannedCloseLastMonth, ' 件')} className="flex-1" />
            <KpiCard label="實際結案" value={MOCK_KPI.closedThisMonth}       unit="件" sub="上月比較" trend={calcTrend(MOCK_KPI.closedThisMonth, MOCK_KPI.closedLastMonth, ' 件')} className="flex-1" />
          </div>

          {/* ── Row 5：營收分布 + 帳務 KPI ───────────────────────────────── */}

          <ChartCard title="本月營收分布" className="col-span-6">
            <HBarChart data={MOCK_QUARTERLY_REVENUE} valueKey="amount" formatFn={(v) => `${Math.round(v / 10000)} 萬`} />
          </ChartCard>
          <div className="col-span-6 flex flex-col gap-4 self-stretch">
            <div className="grid grid-cols-2 gap-4">
              <KpiCard label="尚未請款案件"   value={MOCK_KPI.uninvoiced}     unit="件" sub="上月比較" trend={MOCK_KPI.uninvoicedTrend}     amount={MOCK_KPI.uninvoicedAmount}     amountPrimary />
              <KpiCard label="已請款尚未付款" value={MOCK_KPI.invoicedUnpaid} unit="件" sub="上月比較" trend={MOCK_KPI.invoicedUnpaidTrend} amount={MOCK_KPI.invoicedUnpaidAmount} amountPrimary />
            </div>
            <KpiCard
              label="本月收款金額"
              value={MOCK_KPI.monthlyRevenueCurrent}
              unit="萬"
              sub="上月比較"
              trend={calcTrend(MOCK_KPI.monthlyRevenueCurrent, MOCK_KPI.monthlyRevenueLastMonth, ' 萬')}
              amount={MOCK_KPI.monthlyRevenueCurrent * 10000}
              amountPrimary
              className="flex-1"
            />
          </div>

          {/* ── 時效警示（所有告警集中） ─────────────────────────────────── */}

          <KpiCard label="結案已逾期"   value={overdueCount}      unit="件" variant={overdueCount      > 0 ? 'danger'  : undefined} className="col-span-3" />
          <KpiCard label="結案即將逾期" value={warningCount}      unit="件" variant={warningCount      > 0 ? 'warning' : undefined} className="col-span-3" />
          <KpiCard label="事件已逾期"   value={eventOverdueCount} unit="件" variant={eventOverdueCount > 0 ? 'danger'  : undefined} className="col-span-3" />
          <KpiCard label="事件即將逾期" value={eventWarningCount} unit="件" variant={eventWarningCount > 0 ? 'warning' : undefined} className="col-span-3" />

          <KpiCard label="上訴待委任"     value={judgmentPendingCases.length} unit="件"
            variant={judgmentPendingCases.length > 0 ? 'warning' : undefined} className="col-span-6" />
          <KpiCard label="常年合約待續約" value={retainerPendingCases.length} unit="件"
            variant={retainerPendingCases.length > 0 ? 'warning' : undefined} className="col-span-6" />

          {/* ── 區塊 3：期限明細 ───────────────────────────────────────────── */}

          <ChartCard title="結案期限明細" className="col-span-6 h-[330px]">
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col divide-y divide-gray-50 pr-1">
              {closingCases.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">目前無待結案件</p>
              )}
              {closingCases.map((c) => {
                const isOverdue = c.daysLeft < 0
                const isWarning = !isOverdue && c.daysLeft <= 30
                const chipClass = isOverdue ? 'bg-red-50 text-red-500' : isWarning ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-500'
                const typeColor = CASE_TYPE_COLORS[CASE_TYPES.indexOf(c.type)] || CASE_TYPE_COLORS[0]
                return (
                  <div key={c.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: typeColor + '20', color: typeColor }}>{c.type}</span>
                        <span className="text-base font-semibold text-[#1E3480]">{c.cause}</span>
                      </div>
                      <div className="flex flex-col gap-1 pl-0.5">
                        <span className="text-sm text-gray-600">{c.parties}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-gray-400">{c.id}</span>
                          <span className="text-sm text-gray-300">·</span>
                          <span className="text-sm text-gray-400">{c.lawyer} 律師</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-sm text-gray-500">{c.expectedCloseDate}</span>
                      <span className={`text-base font-semibold px-3 py-1 rounded-full ${chipClass}`}>
                        {isOverdue ? `${Math.abs(c.daysLeft)} 天前` : `${c.daysLeft} 天後`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>

          <ChartCard title="下一個事件時間點" className="col-span-6 h-[330px]">
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col divide-y divide-gray-50 pr-1">
              {allEvents.map((item) => {
                const cat = DEADLINE_CATEGORIES[item.category]
                return (
                  <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-md ${cat.color}`}>{cat.label}</span>
                        <span className="text-base font-semibold text-[#1E3480]">{item.taskTitle || item.cause}</span>
                      </div>
                      <div className="flex flex-col gap-1 pl-0.5">
                        <span className="text-sm text-gray-600">{item.parties}</span>
                        {item.taskTitle && <span className="text-sm text-gray-500">{item.cause}</span>}
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-gray-400">{item.caseNo}</span>
                          <span className="text-sm text-gray-300">·</span>
                          <span className="text-sm text-gray-400">{item.lawyer}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-sm text-gray-500">{item.date}</span>
                      <span className={`text-base font-semibold px-3 py-1 rounded-full ${daysLeftColor(item.daysLeft)}`}>
                        {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)} 天前` : `${item.daysLeft} 天後`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>

          {/* ── 全寬分析 ───────────────────────────────────────────────────── */}

          <ChartCard title="各案件類型平均結案週期" className="col-span-12">
            <CycleDaysChart />
          </ChartCard>

        </div>
      </div>
      </div>
    </div>
  )
}
