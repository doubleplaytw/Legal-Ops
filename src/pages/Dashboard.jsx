import { useState } from 'react'
import CasePieChart from '../components/modules/CasePieChart'
import KpiCard from '../components/ui/KpiCard'
import LossReasonBar from '../components/ui/LossReasonBar'
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
  CASE_STATUSES,
  MOCK_CLIENT_HEALTH,
  MOCK_CYCLE_DAYS_BY_TYPE,
  MOCK_CONVERSION_FUNNEL,
  MOCK_APPEAL_FUNNEL,
  MOCK_RETAINER_FUNNEL,
  MOCK_CONVERSION_LOSS_REASONS,
  MOCK_APPEAL_LOSS_REASONS,
  MOCK_RETAINER_LOSS_REASONS,
  MOCK_QUARTERLY_REVENUE,
  MOCK_CONSULTATION_HOURS,
  MOCK_LAWYERS,
} from '../constants/mockData'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

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

function calcTrendNTD(currentWan, lastWan) {
  const diff = (currentWan - lastWan) * 10000
  if (diff === 0) return null
  return { label: `${diff > 0 ? '+' : '-'}NT$ ${Math.abs(diff).toLocaleString()}`, up: diff > 0, positive: diff > 0 }
}

function lawyerLoadColor(pct) {
  if (pct >= 90) return { bar: 'bg-red-400',     text: 'text-red-500',     badge: 'bg-red-50' }
  if (pct >= 70) return { bar: 'bg-amber-400',   text: 'text-amber-500',   badge: 'bg-amber-50' }
  return              { bar: 'bg-emerald-400', text: 'text-emerald-600', badge: 'bg-emerald-50' }
}

function LawyerWorkloadPanel() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
      {MOCK_LAWYERS.map(l => {
        const pct = Math.round((l.activeCases / l.caseCapacity) * 100)
        const { bar, text, badge } = lawyerLoadColor(pct)
        return (
          <div key={l.id} className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full ${badge} ${text} text-sm font-bold flex items-center justify-center shrink-0`}>
              {l.id}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className={`text-xs font-bold ${text}`}>{pct}%</span>
                <span className="text-xs text-gray-400">{l.activeCases}/{l.caseCapacity} 件</span>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5">
                <div className={`${bar} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
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

function ChartCard({ title, badge, headerRight, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col gap-4 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-[#1E3480] tracking-widest uppercase">{title}</h2>
        {headerRight && <div>{headerRight}</div>}
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

const PIPELINE_STAGES = CASE_STATUSES.slice(0, 5)

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

function ConversionFunnelChart() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0"><FunnelChart data={MOCK_CONVERSION_FUNNEL} /></div>
      <LossReasonBar title="未簽約原因分布" reasons={MOCK_CONVERSION_LOSS_REASONS} />
    </div>
  )
}
function AppealFunnelChart() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0"><FunnelChart data={MOCK_APPEAL_FUNNEL} /></div>
      <LossReasonBar title="未委任原因分布" reasons={MOCK_APPEAL_LOSS_REASONS} />
    </div>
  )
}
function RetainerFunnelChart() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0"><FunnelChart data={MOCK_RETAINER_FUNNEL} /></div>
      <LossReasonBar title="未續約原因分布" reasons={MOCK_RETAINER_LOSS_REASONS} />
    </div>
  )
}

function BarTooltip({ label, value }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 pointer-events-none">
      <div className="bg-gray-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
        {label}：{value}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-[5px] border-transparent border-t-gray-800" />
    </div>
  )
}

function CycleDaysChart() {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const max = Math.max(...MOCK_CYCLE_DAYS_BY_TYPE.map((d) => d.avgDays))
  const overall = Math.round(MOCK_CYCLE_DAYS_BY_TYPE.reduce((s, d) => s + d.avgDays, 0) / MOCK_CYCLE_DAYS_BY_TYPE.length)
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">全所平均</span>
        <span className="text-base font-bold text-[#1E3480]">{overall} 天</span>
      </div>
      {MOCK_CYCLE_DAYS_BY_TYPE.map((d, i) => {
        const pct = (d.avgDays / max) * 100
        const inside = pct >= 5
        return (
          <div
            key={d.type}
            className="flex items-center gap-3 relative"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="text-sm text-gray-500 w-16 shrink-0 text-right leading-tight">{d.type}</span>
            <div className="flex-1 h-7 bg-gray-50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                style={{ width: `${pct}%`, backgroundColor: CASE_TYPE_COLORS[i] + 'CC' }}
              >
                {inside && <span className="text-xs font-semibold text-white whitespace-nowrap">{d.avgDays} 天</span>}
              </div>
            </div>
            {hoveredIdx === i && <BarTooltip label={d.type} value={`${d.avgDays} 天`} />}
          </div>
        )
      })}
    </div>
  )
}


// ── Proposal chart components ─────────────────────────────────────────────────

function HBarChart({ data, valueKey = 'count', labelKey = 'type', unit = '', formatFn }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
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
        const labelInside = pct >= 5
        return (
          <div
            key={d[labelKey]}
            className="flex items-center gap-3 relative"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="text-sm text-gray-500 w-16 shrink-0 text-right leading-tight">{d[labelKey]}</span>
            <div className="flex-1 h-7 bg-gray-50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color + 'CC' }}
              >
                {labelInside && <span className="text-xs font-semibold text-white whitespace-nowrap">{label}</span>}
              </div>
            </div>
            {hoveredIdx === i && <BarTooltip label={d[labelKey]} value={label} />}
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


  const followUpEvents = MOCK_CLIENT_HEALTH.flatMap((client) =>
    client.followUps.filter((f) => !f.done && f.date).map((f) => ({
      id: `fu-${client.id}-${f.id}`,
      taskTitle: f.task,
      date: f.date,
      daysLeft: Math.floor((new Date(f.date) - TODAY) / 86400000),
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
      daysLeft: Math.floor((new Date(e.date) - TODAY) / 86400000),
      taskTitle: e.action,
    })),
    ...followUpEvents,
  ].sort((a, b) => a.daysLeft - b.daysLeft)

  const eventOverdueCount = allEventsRaw.filter((e) => e.daysLeft < 0).length
  const eventWarningCount = allEventsRaw.filter((e) => e.daysLeft >= 0 && e.daysLeft <= 7).length
  const allEvents = allEventsRaw.slice(0, 10)

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

          <ChartCard title="客戶轉換漏斗" className="col-span-12 lg:col-span-4 h-[440px]">
            <ConversionFunnelChart />
          </ChartCard>
          <ChartCard title="上訴未委任追蹤" className="col-span-12 lg:col-span-4 h-[440px]">
            <AppealFunnelChart />
          </ChartCard>
          <ChartCard title="常年法顧續約追蹤" className="col-span-12 lg:col-span-4 h-[440px]">
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

          <ChartCard title="案件流程分布" className="col-span-12 md:col-span-6 lg:col-span-4 h-[330px]">
            <CasePieChart
              data={PIPELINE_STAGES.map((s) => ({ type: s.label, count: MOCK_CASES.filter((c) => c.status === s.key).length })).filter((s) => s.count > 0)}
              colors={PIPELINE_STAGES.filter((s) => MOCK_CASES.some((c) => c.status === s.key)).map((s) => s.color)}
            />
          </ChartCard>
          <ChartCard title="進行中案件" className="col-span-12 md:col-span-6 lg:col-span-4 h-[330px]">
            <CasePieChart data={MOCK_ACTIVE_CASES} />
          </ChartCard>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 self-stretch">
            <KpiCard label="預計結案" value={MOCK_KPI.plannedCloseThisMonth} unit="件" className="flex-1" />
            <KpiCard label="實際結案" value={MOCK_KPI.closedThisMonth}       unit="件" sub="與上月比較" trend={calcTrend(MOCK_KPI.closedThisMonth, MOCK_KPI.closedLastMonth, ' 件')} className="flex-1" />
          </div>

          {/* ── Row 5：營收分布 + 帳務 KPI ───────────────────────────────── */}

          <ChartCard title="本月營收分布" className="col-span-6">
            <HBarChart data={MOCK_QUARTERLY_REVENUE} valueKey="amount" formatFn={(v) => `${Math.round(v / 10000)} 萬`} />
          </ChartCard>
          <div className="col-span-6 flex flex-col gap-4 self-stretch">
            <div className="grid grid-cols-2 gap-4">
              <KpiCard label="尚未請款數量"       value={MOCK_KPI.uninvoiced}     unit="件" sub="與上月比較" trend={MOCK_KPI.uninvoicedTrend}     amount={MOCK_KPI.uninvoicedAmount}     amountPrimary />
              <KpiCard label="已請款尚未付款數量" value={MOCK_KPI.invoicedUnpaid} unit="件" sub="與上月比較" trend={MOCK_KPI.invoicedUnpaidTrend} amount={MOCK_KPI.invoicedUnpaidAmount} amountPrimary />
            </div>
            <KpiCard
              label="本月收款數量"
              value={MOCK_KPI.monthlyRevenueCount}
              unit="件"
              sub="與上月比較"
              trend={calcTrendNTD(MOCK_KPI.monthlyRevenueCurrent, MOCK_KPI.monthlyRevenueLastMonth)}
              amount={MOCK_KPI.monthlyRevenueCurrent * 10000}
              amountPrimary
              className="flex-1"
            />
          </div>

          <ChartCard title="下一個事件時間點" className="col-span-6 h-[330px]">
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col divide-y divide-gray-50 pr-1">
              {allEvents.map((item) => {
                const cat = DEADLINE_CATEGORIES[item.category]
                return (
                  <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${cat.color}`}>{cat.label}</span>
                        <span className="text-base font-semibold text-[#1E3480] truncate">{item.taskTitle || item.cause}</span>
                      </div>
                      <div className="flex flex-col gap-1 pl-0.5">
                        <span className="text-sm text-gray-600 truncate">{item.parties}</span>
                        {item.taskTitle && <span className="text-sm text-gray-500 truncate">{item.cause}</span>}
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-sm text-gray-400 whitespace-nowrap shrink-0">{item.caseNo}</span>
                          <span className="text-sm text-gray-300 shrink-0">·</span>
                          <span className="text-sm text-gray-400 whitespace-nowrap">{item.lawyer}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-gray-500 whitespace-nowrap">{item.date}</span>
                      <span className={`text-base font-semibold px-3 py-1 rounded-full whitespace-nowrap ${daysLeftColor(item.daysLeft)}`}>
                        {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)} 天前` : `${item.daysLeft} 天後`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>
          <div className="col-span-6 grid grid-cols-2 gap-4 self-stretch">
            <KpiCard label="上訴待委任"     value={judgmentPendingCases.length} unit="件" variant={judgmentPendingCases.length > 0 ? 'warning' : undefined} />
            <KpiCard label="常年合約待續約" value={retainerPendingCases.length} unit="件" variant={retainerPendingCases.length > 0 ? 'warning' : undefined} />
            <KpiCard label="事件已逾期"     value={eventOverdueCount}           unit="件" variant={eventOverdueCount > 0 ? 'danger'  : undefined} />
            <KpiCard label="事件即將逾期"   value={eventWarningCount}           unit="件" variant={eventWarningCount > 0 ? 'warning' : undefined} />
          </div>

          {/* ── 全寬分析 ───────────────────────────────────────────────────── */}

          <ChartCard
            title="律師負載狀態"
            className="col-span-12"
            headerRight={
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />正常 &lt;70%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />繁忙 70–89%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />過載 ≥90%</span>
              </div>
            }
          >
            <LawyerWorkloadPanel />
          </ChartCard>

          <ChartCard title="各案件類型平均結案週期" className="col-span-12">
            <CycleDaysChart />
          </ChartCard>

        </div>
      </div>
      </div>
    </div>
  )
}
