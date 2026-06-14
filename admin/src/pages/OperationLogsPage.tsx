import { useEffect, useState } from 'react'
import {
  fetchOperationLogs,
  type OperationLogFilters,
  type OperationLogItem,
} from '../api/operationLogs'

const ACTION_LABELS: Record<string, string> = {
  create: '新增',
  update: '编辑',
  delete: '删除',
}

const ROLE_LABELS: Record<string, string> = {
  admin: '管理员',
  member: '用户',
  system: '系统',
}

export function OperationLogsPage() {
  const [items, setItems] = useState<OperationLogItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<OperationLogFilters>({})
  const [keywordInput, setKeywordInput] = useState('')
  const [startTimeInput, setStartTimeInput] = useState('')
  const [endTimeInput, setEndTimeInput] = useState('')
  const pageSize = 20

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await fetchOperationLogs(page, pageSize, filters)
        if (cancelled) return
        setItems(result.items)
        setTotal(result.total)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载失败')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [page, filters])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const onSearch = () => {
    setPage(1)
    setFilters({
      keyword: keywordInput,
      startTime: startTimeInput,
      endTime: endTimeInput,
    })
  }

  const onReset = () => {
    setKeywordInput('')
    setStartTimeInput('')
    setEndTimeInput('')
    setPage(1)
    setFilters({})
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Audit</p>
          <h2 className="page-title">操作日志</h2>
          <p className="page-desc">记录全站新增、编辑、删除操作，共 {total} 条</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="panel-card log-filter-panel">
        <div className="log-filter-grid">
          <label className="form-field">
            <span>搜索</span>
            <input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="操作人 / 模块 / 内容 / IP"
            />
          </label>
          <label className="form-field">
            <span>开始时间</span>
            <input
              type="datetime-local"
              value={startTimeInput}
              onChange={(e) => setStartTimeInput(e.target.value)}
            />
          </label>
          <label className="form-field">
            <span>结束时间</span>
            <input
              type="datetime-local"
              value={endTimeInput}
              onChange={(e) => setEndTimeInput(e.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="primary-btn" onClick={onSearch}>
            搜索
          </button>
          <button type="button" className="ghost-btn" onClick={onReset}>
            重置
          </button>
        </div>
      </div>

      <div className="panel-card table-panel">
        {loading ? (
          <div className="empty-state">加载中…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">暂无操作日志</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>操作类型</th>
                  <th>模块</th>
                  <th>操作人</th>
                  <th>IP</th>
                  <th>操作内容</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="nowrap">{new Date(item.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${badgeClassName(item.actionType)}`}>
                        {ACTION_LABELS[item.actionType] ?? item.actionType}
                      </span>
                    </td>
                    <td>{item.moduleName}</td>
                    <td>
                      <div className="log-operator">
                        <strong>{item.operatorName}</strong>
                        <span className="muted small">
                          {ROLE_LABELS[item.operatorRole] ?? item.operatorRole}
                          {item.operatorId ? ` · ID ${item.operatorId}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="mono">{item.requestIp ?? '—'}</td>
                    <td>
                      <div className="log-content">{item.operationContent}</div>
                      <div className="muted small">
                        {item.requestPath ?? '—'}
                        {item.targetType ? ` · ${item.targetType}` : ''}
                        {item.targetId ? ` #${item.targetId}` : ''}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="pager">
        <button
          type="button"
          className="ghost-btn"
          disabled={page <= 1}
          onClick={() => setPage((current) => current - 1)}
        >
          上一页
        </button>
        <span className="muted small">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="ghost-btn"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          下一页
        </button>
      </div>
    </section>
  )
}

function badgeClassName(actionType: string) {
  if (actionType === 'create') return 'badge-success'
  if (actionType === 'delete') return 'badge-danger'
  return 'badge-accent'
}
