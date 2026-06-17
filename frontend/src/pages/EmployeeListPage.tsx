import { useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

const SAMPLE = [
  { id: 'EMP-001', name: '김민준', dept: '인사', position: '부장',  joined: '2018-03-15', status: '재직' },
  { id: 'EMP-002', name: '이서연', dept: '회계', position: '과장',  joined: '2019-07-22', status: '재직' },
  { id: 'EMP-003', name: '박지훈', dept: '생산', position: '대리',  joined: '2021-01-10', status: '재직' },
  { id: 'EMP-004', name: '최수아', dept: '총무', position: '사원',  joined: '2022-05-03', status: '휴직' },
  { id: 'EMP-005', name: '정도윤', dept: '인사', position: '차장',  joined: '2017-11-28', status: '재직' },
]

export default function EmployeeListPage({ subMenuId }: { subMenuId: string }) {
  const [selected, setSelected] = useState<string[]>([])
  const perm = usePermissions(subMenuId)

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-800">직원 목록</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {SAMPLE.length}건
          </span>
          {selected.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {selected.length}건 선택
            </span>
          )}
        </div>
        {!perm.create && (
          <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-lg">
            ⚠️ 읽기 전용 모드
          </span>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                disabled={!perm.delete}
                checked={selected.length === SAMPLE.length}
                onChange={() => setSelected(selected.length === SAMPLE.length ? [] : SAMPLE.map((r) => r.id))}
                className="rounded disabled:cursor-not-allowed"
              />
            </th>
            {['사원번호', '성명', '부서', '직위', '입사일', '재직상태'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {SAMPLE.map((row) => (
            <tr
              key={row.id}
              onClick={() => perm.delete && toggle(row.id)}
              className={`transition-colors ${perm.delete ? 'cursor-pointer' : ''} ${selected.includes(row.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            >
              <td className="px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  disabled={!perm.delete}
                  onChange={() => toggle(row.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded disabled:cursor-not-allowed"
                />
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{row.id}</td>
              <td className="px-4 py-2.5 font-semibold text-gray-900">{row.name}</td>
              <td className="px-4 py-2.5 text-gray-600">{row.dept}</td>
              <td className="px-4 py-2.5 text-gray-600">{row.position}</td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{row.joined}</td>
              <td className="px-4 py-2.5">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                  ${row.status === '재직' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
        <span>전체 {SAMPLE.length}건</span>
        <div className="flex gap-1">
          {['‹', '1', '›'].map((p, i) => (
            <button key={i} className={`px-2.5 py-1 border rounded-md
              ${p === '1' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-100'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
