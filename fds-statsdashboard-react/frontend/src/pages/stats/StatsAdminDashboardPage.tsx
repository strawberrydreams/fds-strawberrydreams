import { useEffect, useState } from 'react'
import { fetchAdminDashboard } from '../../services/statsApi'
import { useAuth } from '../../hooks/useAuth'
import type { AdminDashboardResponse } from '../../types/stats'
import { formatDate, formatNumber, formatPercent } from './statsUtils'

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

function DistributionList({
                            title,
                            data,
                          }: {
  title: string
  data: Record<string, number>
}) {
  const entries = Object.entries(data ?? {})
  return (
      <div>
        <h3>{title}</h3>
        {entries.length ? (
            <ul className="reason-list">
              {entries.map(([key, count]) => (
                  <li key={key}>
                    <span>{key}</span>
                    <strong>{formatNumber(count)}</strong>
                  </li>
              ))}
            </ul>
        ) : (
            <div className="empty">데이터가 없습니다.</div>
        )}
      </div>
  )
}

function FieldStatsCard({
                          title,
                          stats,
                        }: {
  title: string
  stats: AdminDashboardResponse['transactions']['merchantStats']
}) {
  return (
      <div>
        <h3>{title}</h3>
        <p className="panel__meta">
          결측 {formatNumber(stats.missingCount)} · 결측률{' '}
          {formatPercent(stats.missingRate)}
        </p>
        {stats.topValues?.length ? (
            <ul className="reason-list">
              {stats.topValues.map((item) => (
                  <li key={item.name}>
                    <span>{item.name}</span>
                    <strong>{formatNumber(item.count)}</strong>
                  </li>
              ))}
            </ul>
        ) : (
            <div className="empty">상위 항목이 없습니다.</div>
        )}
      </div>
  )
}

function StatsAdminDashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchAdminDashboard()
        if (!active) {
          return
        }
        setDashboard(result)
      } catch (err) {
        if (!active) {
          return
        }
        const message =
            err instanceof Error ? err.message : 'Failed to load admin dashboard.'
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
  }, [])

  const range = dashboard?.range

  return (
      <div className="app">
        <div className="dashboard">
          <header className="dashboard__header">
            <div>
              <p className="eyebrow">FDS</p>
              <h1>관리자 대시보드</h1>
              <p className="subtitle">
                주간 집계 · {formatDate(range?.fromDate)} ~{' '}
                {formatDate(range?.toDate)}
              </p>
            </div>
            <div className="header-side">
              <div className="user-bar">
              <span className="user-chip">
                {user?.loginId ?? 'Unknown'} · {user?.role ?? 'USER'}
              </span>
              </div>
            </div>
          </header>

          {error ? <div className="banner banner--error">{error}</div> : null}
          {loading ? <div className="banner">Loading data...</div> : null}

          <section className="stat-grid">
            <StatCard
                label="총 사용자"
                value={formatNumber(dashboard?.users?.totalUsers)}
            />
            <StatCard
                label="총 계좌"
                value={formatNumber(dashboard?.accounts?.totalAccounts)}
            />
            <StatCard
                label="총 카드"
                value={formatNumber(dashboard?.cards?.totalCards)}
            />
            <StatCard
                label="거래 건수"
                value={formatNumber(dashboard?.transactions?.totalTransactions)}
            />
            <StatCard
                label="탐지 건수"
                value={formatNumber(dashboard?.detections?.detectionCount)}
            />
            <StatCard
                label="사기 확정"
                value={formatNumber(dashboard?.detections?.fraudCount)}
            />
          </section>

          <section className="panel-grid">
            <div className="panel">
              <div className="panel__header">
                <h2>사용자 통계</h2>
                <span className="panel__meta">신규 가입 추이</span>
              </div>
              {dashboard?.users?.newUsersTrend?.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                      <tr>
                        <th>날짜</th>
                        <th>신규 가입</th>
                      </tr>
                      </thead>
                      <tbody>
                      {dashboard.users.newUsersTrend.map((point) => (
                          <tr key={point.date}>
                            <td>{formatDate(point.date)}</td>
                            <td>{formatNumber(point.count)}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="empty">신규 가입 데이터가 없습니다.</div>
              )}
              <div className="split-grid">
                <DistributionList
                    title="성별 분포"
                    data={dashboard?.users?.genderDistribution ?? {}}
                />
                <DistributionList
                    title="연령대 분포"
                    data={dashboard?.users?.ageDistribution ?? {}}
                />
              </div>
            </div>

            <div className="panel">
              <div className="panel__header">
                <h2>계좌 통계</h2>
                <span className="panel__meta">상태 및 잔액 분포</span>
              </div>
              <DistributionList
                  title="계좌 상태"
                  data={dashboard?.accounts?.statusDistribution ?? {}}
              />
              {dashboard?.accounts?.averageBalanceByGenderAge?.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                      <tr>
                        <th>성별</th>
                        <th>연령대</th>
                        <th>평균 잔액</th>
                      </tr>
                      </thead>
                      <tbody>
                      {dashboard.accounts.averageBalanceByGenderAge.map((row, idx) => (
                          <tr key={`${row.gender}-${row.ageGroup}-${idx}`}>
                            <td>{row.gender}</td>
                            <td>{row.ageGroup}</td>
                            <td>{formatNumber(row.averageBalance)}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="empty">평균 잔액 통계가 없습니다.</div>
              )}
            </div>
          </section>

          <section className="panel-grid">
            <div className="panel">
              <div className="panel__header">
                <h2>카드 통계</h2>
                <span className="panel__meta">상태/유형/발급사 분포</span>
              </div>
              <div className="split-grid">
                <DistributionList
                    title="상태"
                    data={dashboard?.cards?.statusDistribution ?? {}}
                />
                <DistributionList
                    title="유형"
                    data={dashboard?.cards?.typeDistribution ?? {}}
                />
                <DistributionList
                    title="발급사"
                    data={dashboard?.cards?.issuerDistribution ?? {}}
                />
              </div>
            </div>

            <div className="panel">
              <div className="panel__header">
                <h2>거래 통계</h2>
                <span className="panel__meta">
                합계 {formatNumber(dashboard?.transactions?.amountSummary?.total)}
                  · 평균{' '}
                  {formatNumber(dashboard?.transactions?.amountSummary?.average)}
              </span>
              </div>
              <DistributionList
                  title="거래 유형"
                  data={dashboard?.transactions?.typeDistribution ?? {}}
              />
              <div className="split-grid">
                {dashboard?.transactions?.merchantStats ? (
                    <FieldStatsCard
                        title="가맹점"
                        stats={dashboard.transactions.merchantStats}
                    />
                ) : null}
                {dashboard?.transactions?.locationStats ? (
                    <FieldStatsCard
                        title="지역"
                        stats={dashboard.transactions.locationStats}
                    />
                ) : null}
                {dashboard?.transactions?.targetAccountStats ? (
                    <FieldStatsCard
                        title="상대 계좌"
                        stats={dashboard.transactions.targetAccountStats}
                    />
                ) : null}
                {dashboard?.transactions?.descriptionStats ? (
                    <FieldStatsCard
                        title="설명"
                        stats={dashboard.transactions.descriptionStats}
                    />
                ) : null}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>탐지 통계</h2>
              <span className="panel__meta">
              탐지 커버리지 {formatPercent(dashboard?.detections?.detectionCoverage)}
                · 사기 확정률 {formatPercent(dashboard?.detections?.fraudRate)}
            </span>
            </div>
            <div className="split-grid">
              <DistributionList
                  title="사기확률 분포"
                  data={dashboard?.detections?.fraudProbabilityDistribution ?? {}}
              />
              <DistributionList
                  title="엔진 분포"
                  data={dashboard?.detections?.engineDistribution ?? {}}
              />
              <DistributionList
                  title="조치 분포"
                  data={dashboard?.detections?.actionDistribution ?? {}}
              />
            </div>
          </section>

          <section className="panel-grid">
            <div className="panel">
              <div className="panel__header">
                <h2>신고 통계</h2>
                <span className="panel__meta">
                총 {formatNumber(dashboard?.fraudReports?.totalReports)}건
              </span>
              </div>
              <DistributionList
                  title="신고 상태"
                  data={dashboard?.fraudReports?.statusDistribution ?? {}}
              />
              {dashboard?.fraudReports?.reasonTop?.length ? (
                  <ul className="reason-list">
                    {dashboard.fraudReports.reasonTop.map((item) => (
                        <li key={item.name}>
                          <span>{item.name}</span>
                          <strong>{formatNumber(item.count)}</strong>
                        </li>
                    ))}
                  </ul>
              ) : (
                  <div className="empty">신고 사유 데이터가 없습니다.</div>
              )}
            </div>

            <div className="panel">
              <div className="panel__header">
                <h2>블랙리스트</h2>
                <span className="panel__meta">
                총 {formatNumber(dashboard?.blacklist?.totalBlacklist)}건
              </span>
              </div>
              <DistributionList
                  title="차단 사유"
                  data={dashboard?.blacklist?.reasonDistribution ?? {}}
              />
              <div className="muted">
                <div>
                  연관 거래 {formatNumber(dashboard?.blacklist?.relatedTransactionCount)}건
                </div>
                <div>
                  연관 탐지 {formatNumber(dashboard?.blacklist?.relatedDetectionCount)}건
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>레퍼런스 데이터</h2>
              <span className="panel__meta">
              코드북 {formatNumber(dashboard?.referenceData?.codebookCount)}건
            </span>
            </div>
            <DistributionList
                title="코드 타입"
                data={dashboard?.referenceData?.codeTypeDistribution ?? {}}
            />
            {dashboard?.referenceData?.configEntries?.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                    <tr>
                      <th>키</th>
                      <th>값</th>
                      <th>설명</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dashboard.referenceData.configEntries.map((entry) => (
                        <tr key={entry.configKey}>
                          <td>{entry.configKey}</td>
                          <td>{entry.configValue}</td>
                          <td>{entry.description ?? '-'}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            ) : (
                <div className="empty">설정 데이터가 없습니다.</div>
            )}
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>교차 지표</h2>
              <span className="panel__meta">
              블랙리스트 탐지율 {formatPercent(dashboard?.crossEntity?.blacklistDetectionRate)}
            </span>
            </div>
            {dashboard?.crossEntity?.segmentMetrics?.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                    <tr>
                      <th>구분</th>
                      <th>값</th>
                      <th>거래</th>
                      <th>탐지</th>
                      <th>사기</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dashboard.crossEntity.segmentMetrics.map((row, idx) => (
                        <tr key={`${row.segmentType}-${row.segmentValue}-${idx}`}>
                          <td>{row.segmentType}</td>
                          <td>{row.segmentValue}</td>
                          <td>{formatNumber(row.transactionCount)}</td>
                          <td>{formatNumber(row.detectedCount)}</td>
                          <td>{formatNumber(row.fraudCount)}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            ) : (
                <div className="empty">교차 지표 데이터가 없습니다.</div>
            )}

            {dashboard?.crossEntity?.accountRanking?.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                    <tr>
                      <th>계좌</th>
                      <th>거래</th>
                      <th>탐지</th>
                      <th>사기</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dashboard.crossEntity.accountRanking.map((row) => (
                        <tr key={row.accountNumber}>
                          <td>{row.accountNumber}</td>
                          <td>{formatNumber(row.transactionCount)}</td>
                          <td>{formatNumber(row.detectedCount)}</td>
                          <td>{formatNumber(row.fraudCount)}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            ) : null}
          </section>
        </div>
      </div>
  )
}

export default StatsAdminDashboardPage
