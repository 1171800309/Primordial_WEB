import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  avatarUrl,
  fetchUserDetail,
  fetchUserLogs,
  updateUser,
  uploadUserAvatar,
  type AuditLogItem,
  type UserDetail,
} from '../api/users'

const ACTION_LABELS: Record<string, string> = {
  update_field: '修改字段',
  upload_avatar: '上传头像',
}

const FIELD_LABELS: Record<string, string> = {
  username: '用户名',
  email: '邮箱',
  phone: '手机',
  status: '状态',
  nickname: '昵称',
  gender: '性别',
  bio: '简介',
  avatar: '头像',
}

function formatStatus(value: string | null) {
  if (value === '1') return '正常'
  if (value === '0') return '禁用'
  return value ?? '-'
}

function formatGender(value: string | null) {
  if (value === 'male') return '男'
  if (value === 'female') return '女'
  if (value === 'unknown') return '未知'
  return value ?? '-'
}

function formatLogValue(field: string | null, value: string | null) {
  if (!value) return '-'
  if (field === 'status') return formatStatus(value)
  if (field === 'gender') return formatGender(value)
  if (field === 'avatar') return value
  return value
}

export function UserEditPage() {
  const { id } = useParams()
  const userId = Number(id)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState(1)
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('unknown')
  const [bio, setBio] = useState('')

  const load = async () => {
    if (!Number.isFinite(userId) || userId <= 0) {
      setError('无效的用户 ID')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const [user, logResult] = await Promise.all([
        fetchUserDetail(userId),
        fetchUserLogs(userId, 1, 30),
      ])
      setDetail(user)
      setLogs(logResult.items)
      setUsername(user.username)
      setEmail(user.email ?? '')
      setPhone(user.phone ?? '')
      setStatus(user.status)
      setNickname(user.profile?.nickname ?? '')
      setGender(user.profile?.gender ?? 'unknown')
      setBio(user.profile?.bio ?? '')
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [userId])

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateUser(userId, {
        username,
        email,
        phone,
        status,
        nickname,
        gender,
        bio,
      })
      setMessage('保存成功')
      const [user, logResult] = await Promise.all([
        fetchUserDetail(userId),
        fetchUserLogs(userId, 1, 30),
      ])
      setDetail(user)
      setUsername(user.username)
      setLogs(logResult.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const onAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    setError('')
    setMessage('')
    try {
      const result = await uploadUserAvatar(userId, file)
      setMessage('头像已更新')
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              profile: {
                ...(prev.profile ?? {
                  nickname: null,
                  gender: null,
                  bio: null,
                  birthday: null,
                  points: 0,
                  balance: 0,
                }),
                avatar: result.avatar,
              },
            }
          : prev
      )
      const logResult = await fetchUserLogs(userId, 1, 30)
      setLogs(logResult.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <section className="page">
        <div className="empty-state">加载中…</div>
      </section>
    )
  }

  if (error && !detail) {
    return (
      <section className="page">
        <div className="empty-state error-text">{error}</div>
        <Link to="/users" className="text-link">
          返回用户列表
        </Link>
      </section>
    )
  }

  const avatar = avatarUrl(detail?.profile?.avatar)

  return (
    <section className="page user-edit">
      <header className="page-header page-header-row">
        <div>
          <Link to="/users" className="back-link">
            ← 返回用户列表
          </Link>
          <p className="page-kicker">User #{detail?.id}</p>
          <h2 className="page-title">编辑用户资料</h2>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      <div className="edit-grid">
        <div className="edit-main">
          <article className="panel-card profile-hero">
            <div className="avatar-preview avatar-preview-lg">
              {avatar ? (
                <img src={avatar} alt="用户头像" />
              ) : (
                <span>{username.slice(0, 1).toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="profile-hero-body">
              <p className="profile-hero-label">用户 ID · {detail?.id}</p>
              <div className="profile-hero-actions">
                <button
                  type="button"
                  className="primary-btn"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? '上传中…' : '更换头像'}
                </button>
                <span className="muted small">jpg / png / webp，最大 2MB</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={onAvatarChange}
              />
            </div>
          </article>

          <form className="panel-card edit-form" onSubmit={onSave}>
            <h3 className="panel-title">基础信息</h3>

            <div className="form-grid">
              <label className="form-field">
                <span>用户名</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="登录用户名"
                  maxLength={50}
                  required
                />
              </label>
              <label className="form-field">
                <span>昵称</span>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="展示昵称"
                />
              </label>
              <label className="form-field">
                <span>邮箱</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </label>
              <label className="form-field">
                <span>手机</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="手机号"
                />
              </label>
              <label className="form-field">
                <span>性别</span>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="unknown">未知</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </label>
              <label className="form-field">
                <span>状态</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(Number(e.target.value))}
                >
                  <option value={1}>正常</option>
                  <option value={0}>禁用</option>
                </select>
              </label>
              <label className="form-field form-field-full">
                <span>简介</span>
                <textarea value={bio} rows={4} onChange={(e) => setBio(e.target.value)} />
              </label>
            </div>

            <div className="form-meta">
              <span className="muted small">账号类型：{detail?.userType}</span>
              <span className="muted small">
                注册：{detail ? new Date(detail.createdAt).toLocaleString() : '—'}
              </span>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? '保存中…' : '保存修改'}
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => navigate('/users')}
              >
                取消
              </button>
            </div>
          </form>
        </div>

        <aside className="panel-card audit-panel">
          <h3 className="panel-title">变更日志</h3>
          <p className="muted small">管理员对该用户的资料调整记录</p>
          {logs.length === 0 ? (
            <div className="empty-state compact">暂无记录</div>
          ) : (
            <ul className="audit-list">
              {logs.map((log) => (
                <li key={log.id}>
                  <div className="audit-head">
                    <strong>{ACTION_LABELS[log.action] ?? log.action}</strong>
                    <time>{new Date(log.createdAt).toLocaleString()}</time>
                  </div>
                  <p className="muted small">操作人：{log.adminUsername}</p>
                  {log.fieldName ? (
                    <p className="audit-change">
                      {FIELD_LABELS[log.fieldName] ?? log.fieldName}：
                      {formatLogValue(log.fieldName, log.oldValue)} →{' '}
                      {formatLogValue(log.fieldName, log.newValue)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  )
}
