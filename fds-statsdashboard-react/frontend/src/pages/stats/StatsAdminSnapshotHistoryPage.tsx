import { useEffect, useState } from 'react'
import {
  fetchSnapshotDetail,
  fetchSnapshotList,
  generateWeeklySnapshots,
} from '../../services/statsApi'
import type { SnapshotMetadata } from '../../types/stats'
import { formatDate, formatDateTime } from './statsUtils'

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

function StatsAdminSnapshotHistoryPage() {
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([])
  const [selected, setSelected] = useState<SnapshotMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState(
      () => resolveLastWeekRange().fromDate,
  )
  const [toDate, setToDate] = useState(
      () => resolveLastWeekRange().toDate,
  )
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchSnapshotList('BUSINESS')
        if (!active) {
          return
        }
        setSnapshots(list)
        setSelected(null)
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
  }, [refreshKey])

  const handleGenerate = async () => {
    setGenerating(true)
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
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!selected) {
      return
    }
    setDownloading(true)
    setError(null)
    try {
      const data = await fetchSnapshotDetail('BUSINESS', selected.snapshotId)
      const payload = JSON.stringify(data, null, 2)
      const blob = new Blob([payload], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = selected.filename || `${selected.snapshotId}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      const message =
          err instanceof Error ? err.message : 'Snapshot download failed.'
      setError(message)
    } finally {
      setDownloading(false)
    }
  }

  const selectedFilename = selected
      ? selected.filename || `${selected.snapshotId}.json`
      : '선택된 스냅샷 없음'
  const downloadStatus = !selected
      ? '스냅샷을 선택하면 다운로드할 수 있습니다.'
      : null

  return (
      <div className="app">
        <div className="dashboard">
          <header className="dashboard__header">
            <div>
              <p className="eyebrow">FDS</p>
              <h1>관리자 스냅샷 히스토리</h1>
              <p className="subtitle">관리자 스냅샷 생성 및 다운로드</p>
            </div>
            <div className="header-side">
              <div className="controls">
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
                <button type="button" onClick={handleGenerate} disabled={generating}>
                  {generating ? '생성 중...' : '스냅샷 생성'}
                </button>
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
                            onClick={() => setSelected(snapshot)}
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
              <span className="panel__meta">{selectedFilename}</span>
            </div>
            <div className="snapshot-meta">
              <div>
                <span>스냅샷 ID</span>
                <strong>{selected?.snapshotId ?? '-'}</strong>
              </div>
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
            <div className="snapshot-actions">
              <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!selected || downloading}
              >
                {downloading ? '다운로드 중...' : 'JSON 다운로드'}
              </button>
            </div>
            {downloadStatus ? <p className="hint">{downloadStatus}</p> : null}
          </div>
        </div>
      </div>
  )
}

export default StatsAdminSnapshotHistoryPage
