import { useEffect, useState } from 'react'
import { completeOrder, fetchOrders, shipOrder, type ShopOrderItem } from '../api/orders'

export function OrdersPage() {
  const [items, setItems] = useState<ShopOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [shippingId, setShippingId] = useState<number | null>(null)
  const [trackingCompany, setTrackingCompany] = useState('')
  const [trackingNo, setTrackingNo] = useState('')
  const pageSize = 20

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchOrders(page, pageSize, statusFilter || undefined)
      setItems(result.items)
      setTotal(result.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [page, statusFilter])

  const onShip = async (id: number) => {
    if (!trackingCompany.trim() || !trackingNo.trim()) {
      setError('请填写物流公司与运单号')
      return
    }
    setError('')
    try {
      await shipOrder(id, trackingCompany.trim(), trackingNo.trim())
      setShippingId(null)
      setTrackingCompany('')
      setTrackingNo('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '发货失败')
    }
  }

  const onComplete = async (id: number) => {
    setError('')
    try {
      await completeOrder(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="page">
      <header className="page-header">
        <p className="page-kicker">Shop</p>
        <h2 className="page-title">盲盒订单</h2>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="panel-card" style={{ marginBottom: 16 }}>
        <label className="form-field" style={{ maxWidth: 220 }}>
          <span>订单状态</span>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">全部</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付待发货</option>
            <option value="shipped">已发货</option>
            <option value="completed">已完成</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="empty-state">加载中…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">暂无订单</div>
      ) : (
        <div className="table-wrap panel-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户</th>
                <th>商品</th>
                <th>金额</th>
                <th>状态</th>
                <th>收货信息</th>
                <th>物流</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.username ?? order.userId}</td>
                  <td>{order.productName}</td>
                  <td>¥{order.amountYuan}</td>
                  <td>{order.statusLabel}</td>
                  <td>
                    <div className="muted small">{order.recipientName} {order.recipientPhone}</div>
                    <div className="muted small">{order.shippingAddress}</div>
                  </td>
                  <td>
                    {order.trackingCompany ? (
                      <div className="muted small">{order.trackingCompany} {order.trackingNo}</div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {order.status === 'paid' ? (
                      shippingId === order.id ? (
                        <div className="inline-form">
                          <input
                            placeholder="物流公司"
                            value={trackingCompany}
                            onChange={(e) => setTrackingCompany(e.target.value)}
                          />
                          <input
                            placeholder="运单号"
                            value={trackingNo}
                            onChange={(e) => setTrackingNo(e.target.value)}
                          />
                          <button type="button" className="primary-btn small" onClick={() => void onShip(order.id)}>
                            确认发货
                          </button>
                          <button type="button" className="ghost-btn small" onClick={() => setShippingId(null)}>
                            取消
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="primary-btn small" onClick={() => setShippingId(order.id)}>
                          发货
                        </button>
                      )
                    ) : null}
                    {order.status === 'shipped' ? (
                      <button type="button" className="ghost-btn small" onClick={() => void onComplete(order.id)}>
                        标记完成
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pager">
        <button type="button" className="ghost-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          上一页
        </button>
        <span className="muted small">{page} / {totalPages}</span>
        <button type="button" className="ghost-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          下一页
        </button>
      </div>
    </section>
  )
}
