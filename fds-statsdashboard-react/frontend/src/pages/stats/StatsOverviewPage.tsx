import { useEffect, useState } from 'react'
import { fetchUserDashboard, fetchUserSummary } from '../../services/statsApi'
import { useAuth } from '../../hooks/useAuth'
import type {
  StatsRangeType,
  UserDashboardResponse,
  UserSummaryResponse,
} from '../../types/stats'
import { formatDate, formatDateTime, formatNumber, formatPercent } from './statsUtils'

function StatCard({
                    label,
                    value,
                    hint,
                  }: {
  label: string
  value: string
  hint?: string
}) {
  return (
      <div className="stat-card">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint ? <span className="stat-hint">{hint}</span> : null}
      </div>
  )
}

function StatsOverviewPage() {
  const { user } = useAuth()
  const [range, setRange] = useState<StatsRangeType>('LAST_7_DAYS')
  const [summary, setSummary] = useState<UserSummaryResponse | null>(null)
  const [dashboard, setDashboard] = useState<UserDashboardResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [summaryResult, dashboardResult] = await Promise.all([
          fetchUserSummary(range),
          fetchUserDashboard(range),
        ])
        if (!active) {
          return
        }
        setSummary(summaryResult)
        setDashboard(dashboardResult)
      } catch (err) {
        if (!active) {
          return
        }
        const message =
            err instanceof Error ? err.message : 'Failed to load overview.'
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [range])

  const rangeLabel = range === 'TODAY' ? '오늘' : '최근 7일'
  const accountList = dashboard?.accounts ?? []
  const dailyCounts = dashboard?.transactions?.dailyCounts ?? []
  const txTypeEntries = Object.entries(dashboard?.transactions?.typeCounts ?? {})
  const cardStatusEntries = Object.entries(dashboard?.cards?.statusCounts ?? {})
  const cardTypeEntries = Object.entries(dashboard?.cards?.typeCounts ?? {})
  const cardIssuerEntries = Object.entries(dashboard?.cards?.issuerCounts ?? {})
  const recentTransactions = dashboard?.transactions?.recentTransactions ?? []

  return (
      <div className="app">
        <div className="dashboard">
          <header className="dashboard__header">
            <div>
              <p className="eyebrow">FDS</p>
              <h1>사용자 대시보드</h1>
              <p className="subtitle">실시간 요약 · {rangeLabel}</p>
            </div>
            <div className="header-side">
              <div className="user-bar">
              <span className="user-chip">
                {user?.loginId ?? 'Unknown'} · {user?.role ?? 'USER'}
              </span>
              </div>
              <div className="controls">
                <label className="control">
                  <span>기간</span>
                  <select
                      value={range}
                      onChange={(event) => setRange(event.target.value as StatsRangeType)}
                  >
                    <option value="TODAY">오늘</option>
                    <option value="LAST_7_DAYS">최근 7일</option>
                  </select>
                </label>
              </div>
            </div>
          </header>

          {error ? <div className="banner banner--error">{error}</div> : null}
          {loading ? <div className="banner">Loading data...</div> : null}

          <section className="stat-grid">
            <StatCard
                label="거래 건수"
                value={formatNumber(summary?.transactionCount)}
            />
            <StatCard
                label="거래 금액 합계"
                value={formatNumber(summary?.totalAmount ?? null)}
                hint={`평균 ${formatNumber(summary?.averageAmount ?? null)}`}
            />
            <StatCard
                label="탐지 건수"
                value={formatNumber(summary?.detectedCount)}
                hint={`탐지율 ${formatPercent(summary?.detectedRate)}`}
            />
            <StatCard
                label="사기 확정"
                value={formatNumber(summary?.fraudCount)}
                hint={`확정율 ${formatPercent(summary?.fraudRate)}`}
            />
            <StatCard
                label="평균 사기확률"
                value={
                  summary?.averageFraudProbability !== null &&
                  summary?.averageFraudProbability !== undefined
                      ? summary.averageFraudProbability.toFixed(3)
                      : '-'
                }
                hint={
                  summary?.medianFraudProbability !== null &&
                  summary?.medianFraudProbability !== undefined
                      ? `중앙 ${summary.medianFraudProbability.toFixed(3)}`
                      : undefined
                }
            />
            <StatCard
                label="최신 탐지 시각"
                value={formatDateTime(summary?.latestDetectionAt)}
            />
          </section>

          <section className="panel-grid">
            <div className="panel">
              <div className="panel__header">
                <h2>프로필</h2>
                <span className="panel__meta">
                가입일 {formatDate(dashboard?.profile?.createdAt)}
              </span>
              </div>
              <div className="muted">
                <div>이름: {dashboard?.profile?.name ?? '-'}</div>
                <div>로그인 ID: {dashboard?.profile?.loginId ?? '-'}</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel__header">
                <h2>계좌</h2>
                <span className="panel__meta">내 계좌 상태 및 잔액</span>
              </div>
              {accountList.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                      <tr>
                        <th>계좌번호</th>
                        <th>상태</th>
                        <th>잔액</th>
                      </tr>
                      </thead>
                      <tbody>
                      {accountList.map((account) => (
                          <tr key={account.accountId}>
                            <td>{account.accountNumber}</td>
                            <td>{account.status ?? '-'}</td>
                            <td>{formatNumber(account.balance ?? null)}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="empty">등록된 계좌가 없습니다.</div>
              )}
            </div>
          </section>

          <section className="panel-grid">
            <div className="panel">
              <div className="panel__header">
                <h2>카드 요약</h2>
                <span className="panel__meta">
                내 카드 {formatNumber(dashboard?.cards?.cardCount)}개 · 평균{' '}
                  {formatNumber(dashboard?.cards?.averageCardsPerUser ?? null)}개
              </span>
              </div>
              <div className="split-grid">
                <div>
                  <h3>상태</h3>
                  {cardStatusEntries.length ? (
                      <ul className="reason-list">
                        {cardStatusEntries.map(([key, count]) => (
                            <li key={key}>
                              <span>{key}</span>
                              <strong>{formatNumber(count)}</strong>
                            </li>
                        ))}
                      </ul>
                  ) : (
                      <div className="empty">상태 데이터가 없습니다.</div>
                  )}
                </div>
                <div>
                  <h3>유형</h3>
                  {cardTypeEntries.length ? (
                      <ul className="reason-list">
                        {cardTypeEntries.map(([key, count]) => (
                            <li key={key}>
                              <span>{key}</span>
                              <strong>{formatNumber(count)}</strong>
                            </li>
                        ))}
                      </ul>
                  ) : (
                      <div className="empty">유형 데이터가 없습니다.</div>
                  )}
                </div>
                <div>
                  <h3>발급사</h3>
                  {cardIssuerEntries.length ? (
                      <ul className="reason-list">
                        {cardIssuerEntries.map(([key, count]) => (
                            <li key={key}>
                              <span>{key}</span>
                              <strong>{formatNumber(count)}</strong>
                            </li>
                        ))}
                      </ul>
                  ) : (
                      <div className="empty">발급사 데이터가 없습니다.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel__header">
                <h2>거래 요약</h2>
                <span className="panel__meta">유형 분포 및 추이</span>
              </div>
              {txTypeEntries.length ? (
                  <ul className="reason-list">
                    {txTypeEntries.map(([key, count]) => (
                        <li key={key}>
                          <span>{key}</span>
                          <strong>{formatNumber(count)}</strong>
                        </li>
                    ))}
                  </ul>
              ) : (
                  <div className="empty">거래 유형 데이터가 없습니다.</div>
              )}
              {dailyCounts.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                      <tr>
                        <th>날짜</th>
                        <th>건수</th>
                      </tr>
                      </thead>
                      <tbody>
                      {dailyCounts.map((point) => (
                          <tr key={point.date}>
                            <td>{formatDate(point.date)}</td>
                            <td>{formatNumber(point.count)}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="empty">거래 추이가 없습니다.</div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>최근 거래 내역</h2>
              <span className="panel__meta">최근 거래 요약</span>
            </div>
            {recentTransactions.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                    <tr>
                      <th>시각</th>
                      <th>금액</th>
                      <th>가맹점</th>
                      <th>지역</th>
                      <th>상대계좌</th>
                      <th>설명</th>
                    </tr>
                    </thead>
                    <tbody>
                    {recentTransactions.map((tx) => (
                        <tr key={tx.transactionId}>
                          <td>{formatDateTime(tx.transactionAt)}</td>
                          <td>{formatNumber(tx.amount ?? null)}</td>
                          <td>{tx.merchantName ?? '-'}</td>
                          <td>{tx.location ?? '-'}</td>
                          <td>{tx.targetAccountNumber ?? '-'}</td>
                          <td>{tx.description ?? '-'}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            ) : (
                <div className="empty">최근 거래가 없습니다.</div>
            )}
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>탐지 요약</h2>
              <span className="panel__meta">내 거래 탐지 현황</span>
            </div>
            <div className="stat-grid">
              <StatCard
                  label="탐지 건수"
                  value={formatNumber(dashboard?.detections?.detectedCount)}
              />
              <StatCard
                  label="사기 확정"
                  value={formatNumber(dashboard?.detections?.fraudCount)}
                  hint={`확정율 ${formatPercent(dashboard?.detections?.fraudRate)}`}
              />
              <StatCard
                  label="최신 탐지 시각"
                  value={formatDateTime(dashboard?.detections?.latestDetectionAt)}
              />
            </div>
          </section>
        </div>
      </div>
  )
}

export default StatsOverviewPage
