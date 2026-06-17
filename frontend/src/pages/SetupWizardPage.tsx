import { useState, useEffect } from 'react'
import client from '@/api/client'

// ── Constants ────────────────────────────────────────────────────────────────
const FORBIDDEN_DB_PORTS  = new Set([5432, 3306, 1433, 1521, 80, 443, 22, 25, 21])
const FORBIDDEN_WEB_PORTS = new Set([80, 443, 3000, 8000, 8080])
const FORBIDDEN_USERNAMES = new Set([
  'admin', 'root', 'administrator', 'superuser', 'sysadmin',
  'sa', 'dba', 'test', 'guest', 'user', 'manager', 'system',
  'ops', 'operator', 'service', 'daemon',
])

const STEP_LABELS = ['DB 연결', '포트 설정', '관리자 계정']

// ── Password strength ────────────────────────────────────────────────────────
interface PwResult {
  score: number
  checks: { label: string; ok: boolean }[]
}

function scorePassword(pw: string): PwResult {
  const rules = [
    { label: '12자 이상',    ok: pw.length >= 12 },
    { label: '대문자 포함',  ok: /[A-Z]/.test(pw) },
    { label: '소문자 포함',  ok: /[a-z]/.test(pw) },
    { label: '숫자 포함',    ok: /[0-9]/.test(pw) },
    { label: '특수문자 포함', ok: /[!@#$%^&*()\-_=+[\]{};:'",./<>?\\|`~]/.test(pw) },
  ]
  return { score: rules.filter(r => r.ok).length, checks: rules }
}

// ── Port validation ──────────────────────────────────────────────────────────
function validatePort(val: string, forbiddenSet: Set<number>): string {
  const n = Number(val)
  if (!val || isNaN(n)) return '포트 번호를 입력하세요'
  if (n < 1024 || n > 65535) return '1024 ~ 65535 범위를 사용하세요'
  if (forbiddenSet.has(n))   return `${n}번은 표준/금지 포트입니다. 비표준 포트를 사용하세요`
  return ''
}

// ── Sub-components ───────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  )
}

function Field({
  value, onChange, placeholder, type = 'text', hasError = false, autoFocus = false,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  hasError?: boolean
  autoFocus?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      autoFocus={autoFocus}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors
        ${hasError ? 'border-red-300 bg-red-50 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-400'}`}
    />
  )
}

function ErrMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-[11px] mt-1">{msg}</p>
}

function OkMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return <p className="text-emerald-600 text-[11px] mt-1">✓ {msg}</p>
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1
        const done   = idx < current
        const active = idx === current
        return (
          <div key={idx} className="flex items-start">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                ${done   ? 'bg-emerald-500 border-emerald-500 text-white'
                : active ? 'bg-blue-600   border-blue-600   text-white ring-4 ring-blue-100'
                         : 'bg-white      border-gray-300   text-gray-400'}`}>
                {done ? '✓' : idx}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap
                ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-20 h-0.5 mt-4 mx-1 transition-all duration-500
                ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Types ────────────────────────────────────────────────────────────────────
interface DbConfig {
  host: string; port: string; dbName: string; dbUser: string; dbPassword: string
}
interface TestState {
  status: 'idle' | 'testing' | 'ok' | 'fail'
  msg: string
}
interface AdminConfig {
  username: string; displayName: string; password: string; confirmPassword: string
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SetupWizardPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep]     = useState<1 | 2 | 3>(1)
  const [finished, setFinished] = useState(false)

  // Step 1
  const [db, setDb] = useState<DbConfig>({
    host: 'localhost', port: '15432', dbName: 'dwsu_erp', dbUser: '', dbPassword: '',
  })
  const [dbTest, setDbTest] = useState<TestState>({ status: 'idle', msg: '' })

  // Step 2
  const [webPort, setWebPort] = useState('8585')

  // Step 3
  const [admin, setAdmin] = useState<AdminConfig>({
    username: '', displayName: '', password: '', confirmPassword: '',
  })
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Derived validation ─────────────────────────────────────
  const dbPortErr  = validatePort(db.port, FORBIDDEN_DB_PORTS)
  const webPortErr = validatePort(webPort, FORBIDDEN_WEB_PORTS)

  const usernameForbidden = FORBIDDEN_USERNAMES.has(admin.username.toLowerCase())
  const usernameFormatErr = admin.username.length > 0 && !/^[a-zA-Z0-9_.\-]{4,50}$/.test(admin.username)
  const usernameOk = admin.username.length >= 4 && !usernameForbidden && !usernameFormatErr
  const { score: pwScore, checks: pwChecks } = scorePassword(admin.password)
  const passwordsMatch = admin.password === admin.confirmPassword && admin.password.length > 0

  const step1Valid = !dbPortErr && db.host && db.dbUser && db.dbPassword && dbTest.status === 'ok'
  const step2Valid = !webPortErr
  const step3Valid = usernameOk && admin.displayName.length >= 2 && pwScore === 5 && passwordsMatch

  // ── DB connection test ─────────────────────────────────────
  const runDbTest = async () => {
    setDbTest({ status: 'testing', msg: '' })
    try {
      const res = await client.post('/system/test-db', {
        host: db.host, port: Number(db.port),
        db_name: db.dbName, db_user: db.dbUser, db_password: db.dbPassword,
      })
      setDbTest(res.data.success
        ? { status: 'ok',   msg: res.data.version ?? '연결 성공' }
        : { status: 'fail', msg: res.data.error   ?? '연결 실패' })
    } catch {
      setDbTest({ status: 'fail', msg: '서버에 연결할 수 없습니다.' })
    }
  }

  // ── Final submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setSubmitError('')
    try {
      await client.post('/system/configure', {
        db_host: db.host, db_port: Number(db.port),
        db_name: db.dbName, db_user: db.dbUser, db_password: db.dbPassword,
        web_port: Number(webPort),
      })
      await client.post('/system/initialize', {
        admin_username: admin.username,
        password: admin.password,
        confirm_password: admin.confirmPassword,
        display_name: admin.displayName,
      })
      setFinished(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
      setSubmitError(msg ?? '초기화에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  // ── Complete screen ────────────────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">초기 설정 완료!</h2>
          <p className="text-gray-500 text-sm mb-6">
            시스템이 성공적으로 초기화되었습니다.<br />
            아래 계정으로 로그인할 수 있습니다.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs font-mono text-slate-600 mb-6 space-y-2">
            <p className="font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">설정 요약</p>
            <p>🌐 Web URL  : <span className="text-blue-600 font-bold">http://[서버IP]:{webPort}</span></p>
            <p>🗄️  DB Port  : <span className="text-blue-600 font-bold">:{db.port}</span></p>
            <p>🏠 DB Host  : <span className="text-blue-600">{db.host}</span></p>
            <p>👤 Admin ID : <span className="text-blue-600 font-bold">{admin.username}</span></p>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            로그인 화면으로 →
          </button>
        </div>
      </div>
    )
  }

  // ── Wizard ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">⚙️</div>
          <h1 className="text-xl font-bold text-white">DWSU Mini-ERP</h1>
          <p className="text-slate-400 text-sm mt-0.5">초기 설정 마법사 — 최초 1회만 실행됩니다</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <StepBar current={step} />

          {/* ── STEP 1: Database ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🗄️</span>
                <div>
                  <h2 className="text-base font-bold text-gray-800">데이터베이스 연결 설정</h2>
                  <p className="text-xs text-gray-400">PostgreSQL 접속 정보를 입력하고 연결을 테스트하세요</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label>호스트</Label>
                  <Field value={db.host} onChange={v => setDb(p => ({...p, host: v}))} placeholder="localhost" autoFocus />
                </div>
                <div>
                  <Label>포트 *</Label>
                  <Field value={db.port} onChange={v => { setDb(p => ({...p, port: v})); setDbTest({status:'idle',msg:''}) }} placeholder="15432" hasError={!!dbPortErr} />
                  <ErrMsg msg={dbPortErr} />
                </div>
              </div>

              <div>
                <Label>데이터베이스 이름</Label>
                <Field value={db.dbName} onChange={v => setDb(p => ({...p, dbName: v}))} placeholder="dwsu_erp" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>DB 사용자</Label>
                  <Field value={db.dbUser} onChange={v => { setDb(p => ({...p, dbUser: v})); setDbTest({status:'idle',msg:''}) }} placeholder="erp_app" />
                </div>
                <div>
                  <Label>DB 비밀번호</Label>
                  <Field type="password" value={db.dbPassword} onChange={v => { setDb(p => ({...p, dbPassword: v})); setDbTest({status:'idle',msg:''}) }} placeholder="••••••••" />
                </div>
              </div>

              {/* Rule callout */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-800">
                ⚠️ <strong>보안 규칙</strong> — DB 포트는 표준 포트(5432)를 사용할 수 없습니다.
                비표준 포트 <code className="bg-amber-100 px-1 rounded">15432</code> 를 권장합니다.
              </div>

              {/* Test button */}
              <button
                onClick={runDbTest}
                disabled={!db.host || !db.dbUser || !db.dbPassword || !!dbPortErr || dbTest.status === 'testing'}
                className="w-full py-2.5 rounded-lg border-2 border-blue-500 text-blue-600 font-semibold text-sm
                  hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {dbTest.status === 'testing' ? '⏳ 연결 테스트 중...' : '🔗 DB 연결 테스트'}
              </button>

              {dbTest.status === 'ok' && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-xs text-green-800">
                  ✅ <strong>연결 성공</strong> — {dbTest.msg}
                </div>
              )}
              {dbTest.status === 'fail' && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">
                  ❌ <strong>연결 실패</strong> — {dbTest.msg}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Network ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🌐</span>
                <div>
                  <h2 className="text-base font-bold text-gray-800">네트워크 포트 설정</h2>
                  <p className="text-xs text-gray-400">사용자가 브라우저에서 접속할 웹 포트를 설정합니다</p>
                </div>
              </div>

              <div>
                <Label>웹 서비스 포트 *</Label>
                <div className="flex gap-3 items-center">
                  <div className="w-40">
                    <Field value={webPort} onChange={setWebPort} placeholder="8585" hasError={!!webPortErr} autoFocus />
                  </div>
                  <span className="text-sm text-gray-400">→ http://[서버IP]:<strong>{webPort || '????'}</strong></span>
                </div>
                <ErrMsg msg={webPortErr} />
                {!webPortErr && webPort && <OkMsg msg={`포트 ${webPort} 사용 가능`} />}
              </div>

              {/* Forbidden ports table */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                <p className="font-semibold mb-2">⚠️ 사용 금지 포트 목록</p>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-amber-600 border-b border-amber-200">
                      <th className="text-left py-1 font-semibold">포트</th>
                      <th className="text-left py-1 font-semibold">금지 이유</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {[
                      ['80, 443', 'HTTP/HTTPS 표준 — 외부 노출 위험'],
                      ['3000',    'Node.js 기본 개발 포트'],
                      ['8000, 8080', '일반 개발/프록시 포트'],
                    ].map(([p, r]) => (
                      <tr key={p}>
                        <td className="py-1 font-mono pr-4">{p}</td>
                        <td className="py-1 text-amber-700">{r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Architecture preview */}
              <div className="bg-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-1.5">
                <p className="font-sans font-semibold text-slate-400 text-[11px] uppercase tracking-wider mb-2">
                  배포 구성 미리보기
                </p>
                <p>🌐 <span className="text-slate-500">Web  </span> http://[서버IP]:<span className="text-green-400">{webPort || '????'}</span></p>
                <p>⚙️  <span className="text-slate-500">API  </span> http://[서버IP]:<span className="text-green-400">{webPort || '????'}</span>/api/</p>
                <p>🗄️  <span className="text-slate-500">DB   </span> [서버IP]:<span className="text-green-400">{db.port || '????'}</span> (내부망 전용)</p>
              </div>
            </div>
          )}

          {/* ── STEP 3: Admin ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🔐</span>
                <div>
                  <h2 className="text-base font-bold text-gray-800">최초 관리자 계정 생성</h2>
                  <p className="text-xs text-gray-400">기본 계정명(admin, root 등)은 절대 사용할 수 없습니다</p>
                </div>
              </div>

              {/* Username */}
              <div>
                <Label>관리자 아이디 *</Label>
                <Field
                  value={admin.username}
                  onChange={v => setAdmin(p => ({...p, username: v.toLowerCase()}))}
                  placeholder="예: dwsu_manager (4자 이상)"
                  hasError={usernameForbidden || usernameFormatErr}
                  autoFocus
                />
                {usernameForbidden && (
                  <ErrMsg msg={`❌ '${admin.username}'은(는) 사용 금지된 기본 계정명입니다`} />
                )}
                {usernameFormatErr && !usernameForbidden && (
                  <ErrMsg msg="영문·숫자·_·.·- 만 사용 가능, 4~50자" />
                )}
                {usernameOk && <OkMsg msg="사용 가능한 아이디" />}
              </div>

              {/* Display name */}
              <div>
                <Label>표시 이름</Label>
                <Field
                  value={admin.displayName}
                  onChange={v => setAdmin(p => ({...p, displayName: v}))}
                  placeholder="홍길동 시스템관리자"
                />
              </div>

              {/* Password */}
              <div>
                <Label>비밀번호 *</Label>
                <Field
                  type="password"
                  value={admin.password}
                  onChange={v => setAdmin(p => ({...p, password: v}))}
                  placeholder="최소 12자, 대·소문자·숫자·특수문자 포함"
                  hasError={admin.password.length > 0 && pwScore < 5}
                />
                {/* Strength meter */}
                {admin.password.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300
                          ${i <= pwScore
                            ? pwScore <= 2 ? 'bg-red-400' : pwScore <= 3 ? 'bg-amber-400' : 'bg-emerald-500'
                            : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-semibold
                      ${pwScore <= 2 ? 'text-red-500' : pwScore <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {pwScore <= 2 ? '취약' : pwScore === 3 ? '보통' : pwScore === 4 ? '강함' : '매우 강함'}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {pwChecks.map(({ label, ok }) => (
                        <p key={label} className={`text-[11px] ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {ok ? '✓' : '○'} {label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <Label>비밀번호 확인 *</Label>
                <Field
                  type="password"
                  value={admin.confirmPassword}
                  onChange={v => setAdmin(p => ({...p, confirmPassword: v}))}
                  placeholder="비밀번호 재입력"
                  hasError={admin.confirmPassword.length > 0 && !passwordsMatch}
                />
                {admin.confirmPassword.length > 0 && !passwordsMatch && <ErrMsg msg="비밀번호가 일치하지 않습니다" />}
                {passwordsMatch && <OkMsg msg="비밀번호 일치" />}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  ⚠️ {submitError}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep(s => (s - 1) as 1|2|3)}
              disabled={step === 1}
              className="px-5 py-2 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-0 transition-colors rounded-lg hover:bg-gray-50"
            >
              ← 이전
            </button>

            <div className="flex items-center gap-2 text-[10px] text-gray-300">
              {[1,2,3].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-blue-500' : 'bg-gray-200'}`} />
              ))}
            </div>

            {step < 3 ? (
              <button
                onClick={() => setStep(s => (s + 1) as 1|2|3)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold
                  hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                다음 →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!step3Valid || loading}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold
                  hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '⏳ 초기화 중...' : '✅ 설정 완료'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          이 마법사는 시스템 초기화 완료 후 자동으로 비활성화됩니다
        </p>
      </div>
    </div>
  )
}
