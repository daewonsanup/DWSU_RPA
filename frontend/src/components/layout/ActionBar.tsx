import { clsx } from 'clsx'
import type { ActionKey, Permission } from '@/types'

interface ActionDef {
  key: ActionKey
  label: string
  icon: string
  variant: string
  group: number
}

const ACTION_DEFS: ActionDef[] = [
  { key: 'search', label: '조회',      icon: '🔍', variant: 'primary',   group: 1 },
  { key: 'create', label: '등록',      icon: '➕', variant: 'success',   group: 2 },
  { key: 'update', label: '수정',      icon: '✏️', variant: 'warning',   group: 2 },
  { key: 'delete', label: '삭제',      icon: '🗑️', variant: 'danger',    group: 2 },
  { key: 'print',  label: '출력',      icon: '🖨️', variant: 'secondary', group: 3 },
  { key: 'export', label: '엑셀 출력', icon: '📥', variant: 'export',    group: 3 },
]

const VARIANT: Record<string, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white border-blue-700',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700',
  warning:   'bg-amber-500 hover:bg-amber-600 text-white border-amber-600',
  danger:    'bg-red-600 hover:bg-red-700 text-white border-red-700',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
  export:    'bg-green-700 hover:bg-green-800 text-white border-green-800',
}

function Btn({
  def, enabled, onAction,
}: {
  def: ActionDef
  enabled: boolean
  onAction: (k: ActionKey) => void
}) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-all active:scale-95'
  if (!enabled) {
    return (
      <button
        disabled
        title={`${def.label} — 권한 없음`}
        className={clsx(base, 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed')}
      >
        <span className="grayscale opacity-40">{def.icon}</span>
        <span>{def.label}</span>
        <span className="text-[10px] bg-gray-200 px-1 rounded font-mono">LOCK</span>
      </button>
    )
  }
  return (
    <button
      onClick={() => onAction(def.key)}
      className={clsx(base, 'shadow-sm', VARIANT[def.variant])}
    >
      <span>{def.icon}</span>
      <span>{def.label}</span>
    </button>
  )
}

interface Props {
  permissions: Permission
  onAction: (key: ActionKey) => void
}

export default function ActionBar({ permissions, onAction }: Props) {
  const groups = ACTION_DEFS.reduce<Record<number, ActionDef[]>>((acc, d) => {
    ;(acc[d.group] ??= []).push(d)
    return acc
  }, {})

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 shadow-sm flex-shrink-0">
      {Object.entries(groups).map(([g, defs], i) => (
        <div key={g} className="flex items-center gap-1.5">
          {i > 0 && <div className="w-px h-6 bg-gray-200 mx-0.5" />}
          {defs.map((def) => (
            <Btn key={def.key} def={def} enabled={permissions[def.key]} onAction={onAction} />
          ))}
        </div>
      ))}
    </div>
  )
}
