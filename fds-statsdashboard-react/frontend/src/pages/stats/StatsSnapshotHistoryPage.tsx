import { useEffect, useState } from 'react'
import {
  fetchSnapshotDetail,
  fetchSnapshotList,
  generateWeeklySnapshots,
} from '../../services/statsApi'
import { useAuth } from '../../hooks/useAuth'
import type { GeneralSnapshotDetail, SnapshotMetadata } from '../../types/stats'
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
} from './statsUtils'

const formatInputDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const resolveLastWeekRange = () => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = (dayOfWeek + 6) % 7
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() - diffToMonday)
  thisMonday.setHours(0, 0, 0, 0)

  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)
  const lastSunday = new Date(lastMonday)
  lastSunday.setDate(lastMonday.getDate() + 6)

  return {
    fromDate: formatInputDate(lastMonday),
    toDate: formatInputDate(lastSunday),
  }
}

function StatsSnapshotHistoryPage() {
  const { user } = useAuth()
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([])
  const [selected, setSelected] = useState<SnapshotMetadata | null>(null)
  const [detail, setDetail] = useState<GeneralSnapshotDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState(
      () => resolveLastWeekRange().fromDate,
  )
  const [toDate, setToDate] = useState(
      () => resolveLastWeekRange().toDate,
  )
  const [refreshKey, setRefreshKey] = useState(0)
  const scope = 'GENERAL'

  const formatProbability = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return '-'
    }
    return value.toFixed(3)
  }

  const hasKpi = (value: unknown): value is GeneralSnapshotDetail => {
    if (!value || typeof value !== 'object') {
      return false
    }
    const candidate = value as { scope?: unknown; kpi?: unknown }
    return candidate.scope === 'GENERAL' && Boolean(candidate.kpi)
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchSnapshotList(scope)
        if (!active) {
          return
        }
        setSnapshots(list)
        setSelected(null)
        setDetail(null)
      } catch (err) {
        if (!active) {
          return
        }
        const message =
            err instanceof Error ? err.message : 'Failed to load snapshots.'
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
  }, [refreshKey, scope])

  useEffect(() => {
    if (!selected) {
      return
    }
    let active = true
    const loadDetail = async () => {
      setLoading(true)
      setError(null)
      setDetail(null)
      try {
        const data = await fetchSnapshotDetail<GeneralSnapshotDetail>(
            scope,
            selected.snapshotId,
        )
        if (!active) {
          return
        }
        if (!hasKpi(data)) {
          setDetail(null)
          setError('스냅샷 데이터 형식이 올바르지 않습니다.')
          return
        }
        setDetail(data)
      } catch (err) {
        if (!active) {
          return
        }
        const message =
            err instanceof Error ? err.message : 'Failed to load snapshot detail.'
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      active = false
    }
  }, [selected, scope])

  const handleGenerate = async () => {
    setError(null)
    try {
      await generateWeeklySnapshots({
        fromDate,
        toDate,
        forceRebuild: true,
      })
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      const message =
          err instanceof Error ? err.message : 'Snapshot generation failed.'
      setError(message)
    }
  }

  const detailStatus = !selected
      ? '스냅샷을 선택하면 상세 지표가 표시됩니다.'
      : detail
          ? null
          : error
              ? '스냅샷 상세를 불러올 수 없습니다.'
              : '스냅샷 상세를 불러오는 중입니다.'

  return (
      <div className="app">
        <div className="dashboard">
          <header className="dashboard__header">
            <div>
              <p className="eyebrow">FDS</p>
              <h1>스냅샷 히스토리</h1>
              <p className="subtitle">주간 스냅샷 목록 및 상세 보기</p>
            </div>
            <div className="header-side">
              <div className="controls">
                {user?.role === 'ADMIN' ? (
                    <>
                      <label className="control">
                        <span>From</span>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(event) => setFromDate(event.target.value)}
                        />
                      </label>
                      <label className="control">
                        <span>To</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(event) => setToDate(event.target.value)}
                        />
                      </label>
                      <button type="button" onClick={handleGenerate}>
                        스냅샷 생성
                      </button>
                    </>
                ) : null}
              </div>
            </div>
          </header>

          {error ? <div className="banner banner--error">{error}</div> : null}
          {loading ? <div className="banner">Loading data...</div> : null}

          <section className="panel snapshot-scroll">
            <div className="panel__header">
              <h2>스냅샷 목록</h2>
              <span className="panel__meta">{snapshots.length} files</span>
            </div>
            {snapshots.length ? (
                <div className="snapshot-scroll__list" role="list">
                  {snapshots.map((snapshot) => {
                    const isSelected = selected?.snapshotId === snapshot.snapshotId
                    return (
                        <button
                            key={snapshot.snapshotId}
                            type="button"
                            onClick={() => {
                              setSelected(snapshot)
                              setDetail(null)
                            }}
                            className={`snapshot-card${isSelected ? ' snapshot-card--selected' : ''}`}
                            aria-pressed={isSelected}
                        >
                          <span className="snapshot-card__id">{snapshot.snapshotId}</span>
                          <span className="snapshot-card__range">
                      {formatDate(snapshot.fromDate)} ~{' '}
                            {formatDate(snapshot.toDate)}
                    </span>
                          <span className="snapshot-card__time">
                      {formatDateTime(snapshot.generatedAt)}
                    </span>
                        </button>
                    )
                  })}
                </div>
            ) : (
                <div className="empty">스냅샷이 없습니다.</div>
            )}
          </section>

          <div className="snapshot-summary">
            <div className="panel__header">
              <h2>스냅샷 요약</h2>
              <span className="panel__meta">
              {selected ? selected.snapshotId : '선택된 스냅샷 없음'}
            </span>
            </div>
            <div className="snapshot-meta">
              <div>
                <span>기간</span>
                <strong>
                  {formatDate(selected?.fromDate)} ~{' '}
                  {formatDate(selected?.toDate)}
                </strong>
              </div>
              <div>
                <span>생성 시각</span>
                <strong>{formatDateTime(selected?.generatedAt)}</strong>
              </div>
            </div>
            {detailStatus ? <p className="hint">{detailStatus}</p> : null}
          </div>

          <section className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">거래 건수</span>
              <strong className="stat-value">
                {formatNumber(detail?.kpi.transactionCount)}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">거래 금액 합계</span>
              <strong className="stat-value">
                {formatNumber(detail?.kpi.totalAmount)}
              </strong>
              <span className="stat-hint">
              평균 {formatNumber(detail?.kpi.averageAmount)}
            </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">탐지 건수</span>
              <strong className="stat-value">
                {formatNumber(detail?.kpi.detectedCount)}
              </strong>
              <span className="stat-hint">
              탐지율 {formatPercent(detail?.kpi.detectedRate)}
            </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">사기 확정</span>
              <strong className="stat-value">
                {formatNumber(detail?.kpi.fraudCount)}
              </strong>
              <span className="stat-hint">
              확정율 {formatPercent(detail?.kpi.fraudRate)}
            </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">평균 사기확률</span>
              <strong className="stat-value">
                {formatProbability(detail?.kpi.averageFraudProbability)}
              </strong>
              <span className="stat-hint">
              중앙 {formatProbability(detail?.kpi.medianFraudProbability)}
            </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">최신 거래 시각</span>
              <strong className="stat-value">
                {formatDateTime(detail?.kpi.latestTransactionAt)}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">최신 탐지 시각</span>
              <strong className="stat-value">
                {formatDateTime(detail?.kpi.latestDetectionAt)}
              </strong>
            </div>
          </section>
        </div>
      </div>
  )
}

export default StatsSnapshotHistoryPage
