export const DEADLINE_TYPES = [
  { value: '無',   label: '無',   days: null },
  { value: '上訴期', label: '上訴期', days: 20 },
  { value: '抗告期', label: '抗告期', days: 10 },
  { value: '答辯期', label: '答辯期', days: 20 },
  { value: '異議期', label: '異議期', days: 10 },
  { value: '聲請期', label: '聲請期', days: 10 },
]

export const INCOMING_DOC_TYPES = [
  '法院送達－判決書',
  '法院送達－裁定',
  '法院送達－開庭通知',
  '法院送達－支付命令',
  '對造律師函',
  '客戶提送文件',
  '其他收文',
]

export const OUTGOING_DOC_TYPES = [
  '向法院遞狀',
  '發函對造',
  '回覆客戶',
  '其他發文',
]
