import type React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, withdrawAccount } from '../api/profileApi'
import { logout } from '../api/authApi'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../hooks/useToast'
import { getMoodBarColor } from '../utils/moodTone'

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

function Toggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!active)}
      style={{
        ...tgl.wrap,
        background: active ? '#2a2620' : 'rgba(42,38,32,0.2)',
      }}
    >
      <div style={{ ...tgl.thumb, left: active ? undefined : 2, right: active ? 2 : undefined }} />
    </div>
  )
}

const tgl: Record<string, React.CSSProperties> = {
  wrap: {
    width: 28, height: 16, borderRadius: 8,
    position: 'relative', cursor: 'pointer', flexShrink: 0,
  },
  thumb: {
    position: 'absolute', top: 2,
    width: 12, height: 12, borderRadius: '50%',
    background: '#F0EEE9', transition: 'left 0.2s, right 0.2s',
  },
}

function SettingItem({
  icon,
  label,
  sub,
  rightText,
  rightEl,
  danger = false,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  sub?: string
  rightText?: string
  rightEl?: React.ReactNode
  danger?: boolean
  onPress?: () => void
}) {
  return (
    <div
      style={{ ...si.item, ...(danger ? si.danger : {}) }}
      onClick={onPress}
    >
      <div style={si.left}>
        <div style={{ ...si.icon, ...(danger ? si.dangerIcon : {}) }}>{icon}</div>
        <div>
          <div style={{ ...si.label, ...(danger ? si.dangerLabel : {}) }}>{label}</div>
          {sub && <div style={si.sub}>{sub}</div>}
        </div>
      </div>
      <div style={si.right}>
        {rightEl ?? (
          <>
            {rightText && <span style={si.val}>{rightText}</span>}
            {onPress && !rightEl && (
              <span style={si.arr}>›</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const si: Record<string, React.CSSProperties> = {
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '11px 16px',
    borderBottom: '1px solid rgba(42,38,32,0.06)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  danger: {},
  left: { display: 'flex', alignItems: 'center', gap: 10 },
  icon: {
    width: 28, height: 28, borderRadius: 8,
    background: '#E4E1DA',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dangerIcon: { background: 'rgba(196,134,106,0.1)' },
  label: { fontSize: 11, color: '#2a2620' },
  dangerLabel: { color: '#c4866a' },
  sub: { fontSize: 9, color: '#b0a898', fontWeight: 300, marginTop: 1 },
  right: { display: 'flex', alignItems: 'center', gap: 6 },
  val: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#b0a898' },
  arr: { fontSize: 12, color: '#c8c0b4' },
}

function IconSvg({ d, stroke = '#7a6e5e' }: { d: string; stroke?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ stroke, strokeWidth: 1.5, strokeLinecap: 'round' as const }}>
      <path d={d} />
    </svg>
  )
}

// ─── ProfilePage ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setArchivedOpen, setRollTitleOpen, setPendingRollNum } = useUIStore()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { showToast } = useToast()

  const [notifEnabled, setNotifEnabled] = useState(true)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 2,
  })

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠어요?')) return
    try {
      await logout()
    } finally {
      clearAuth()
      queryClient.clear()
      navigate('/', { replace: true })
    }
  }

  const handleWithdrawFirst = () => setIsConfirmingDelete(true)
  const handleWithdrawConfirm = async () => {
    try {
      await withdrawAccount()
      clearAuth()
      queryClient.clear()
      showToast('정상적으로 탈퇴 처리가 완료되었습니다.')
      navigate('/', { replace: true })
    } catch {
      showToast('탈퇴 처리에 실패했어요.', 'error')
      setIsConfirmingDelete(false)
    }
  }

  if (isLoading || !data) {
    return (
      <div style={styles.view}>
        <div style={styles.skeleton} />
      </div>
    )
  }

  const { user, journey, rolls } = data
  const progressPct = (rolls.active.currentFrames / 24) * 100

  return (
    <div style={styles.view}>
      {/* ── 스크롤 콘텐츠 ── */}
      <div style={styles.scroll}>

        {/* 프로필 카드 */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="avatar" style={styles.avatarImg} />
              : <span style={styles.avatarText}>{user.initial}</span>
            }
            <div style={styles.avatarEdit}>+</div>
          </div>
          <div>
            <div style={styles.profileName}>{user.nickname}</div>
            <div style={styles.profileSince}>
              SINCE {user.joinedAt.replace(/-/g, '.')}
            </div>
            {user.bio
              ? <div style={styles.profileBio}>{user.bio}</div>
              : <div style={{ ...styles.profileBio, color: '#c8c0b4' }}>한 줄 소개를 입력해보세요</div>
            }
          </div>
        </div>

        {/* ── 전체 여정 ── */}
        <div style={styles.section}>
          <div style={styles.secLabel}>전체 여정</div>
          <div style={styles.secSublabel}>가입 이후 전체 기간 누적</div>

          <div style={styles.bentoGrid}>
            {/* 총 프레임 — dark */}
            <div style={{ ...styles.bc, ...styles.bcDark }}>
              <div style={{ ...styles.badge, ...styles.badgeDark }}>ALL TIME</div>
              <div style={{ ...styles.bcLabel, color: 'rgba(240,238,233,0.4)' }}>TOTAL FRAMES</div>
              <div style={{ ...styles.bcVal, color: '#F0EEE9' }}>{journey.totalFrames}</div>
              <div style={{ ...styles.bcSub, color: 'rgba(240,238,233,0.4)' }}>개의 기록</div>
            </div>

            {/* 완성 롤 */}
            <div style={styles.bc}>
              <div style={styles.badge}>COMPLETED</div>
              <div style={styles.bcLabel}>ROLLS</div>
              <div style={styles.bcVal}>{journey.completedRolls}</div>
              <div style={styles.bcSub}>롤 완성</div>
            </div>

            {/* 역대 최장 streak — gold */}
            <div style={{ ...styles.bc, ...styles.bcGold }}>
              <div style={{ ...styles.badge, ...styles.badgeGold }}>BEST</div>
              <div style={{ ...styles.bcLabel, color: '#c8a96e' }}>STREAK</div>
              <div style={{ ...styles.bcVal, color: '#7a5c20' }}>{journey.bestStreak}일</div>
              <div style={styles.bcSub}>역대 최장 기록</div>
            </div>

            {/* 전체 감정 분포 */}
            <div style={styles.bc}>
              <div style={styles.badge}>ALL TIME</div>
              <div style={styles.bcLabel}>TOP MOOD</div>
              <div style={{ ...styles.bcVal, fontSize: 14 }}>
                {journey.topMood ?? '—'}
              </div>
              <div style={styles.moodBarMini}>
                {journey.moodDistribution.slice(0, 5).map(item => (
                  <div
                    key={item.mood}
                    style={{
                      ...styles.moodBar,
                      height: Math.max(4, item.ratio * 16),
                      background: getMoodBarColor(item.mood),
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 롤 관리 ── */}
        <div style={{ ...styles.section, paddingBottom: 14 }}>
          <div style={styles.secLabel}>롤 관리</div>
          <div style={styles.secSublabel}>제목 수정 · 완성 롤 열람</div>

          {/* 진행 중인 롤 */}
          <div style={{ ...styles.rollItem, ...styles.rollItemActive }}>
            <div style={styles.riTop}>
              <div style={styles.riLeft}>
                <span style={styles.riNum}>
                  ROLL {String(rolls.active.rollNumber).padStart(2, '0')}
                </span>
                <span style={{ ...styles.riStatus, color: '#7a5c20' }}>진행 중</span>
              </div>
              <div style={styles.riActions}>
                <button
                  style={{ ...styles.riBtn, ...styles.riBtnPrimary }}
                  onClick={() => {
                    setPendingRollNum(rolls.active.rollNumber)
                    setRollTitleOpen(true)
                  }}
                >
                  제목 수정
                </button>
              </div>
            </div>
            {rolls.active.title && (
              <div style={styles.riTitle}>{rolls.active.title}</div>
            )}
            <div style={styles.progressWrap}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
              </div>
              <div style={styles.progressLabel}>
                <span>{rolls.active.currentFrames} / 24 frames</span>
                <span>{rolls.active.remaining}장 남음</span>
              </div>
            </div>
          </div>

          {/* 완성된 롤 */}
          {rolls.completed.map(roll => (
            <div key={roll.rollNumber} style={styles.rollItem}>
              <div style={styles.riTop}>
                <div style={styles.riLeft}>
                  <span style={styles.riNum}>
                    ROLL {String(roll.rollNumber).padStart(2, '0')}
                  </span>
                  <span style={{ ...styles.riStatus, color: '#9a9080' }}>완성</span>
                </div>
                <div style={styles.riActions}>
                  <button
                    style={styles.riBtn}
                    onClick={() => {
                      setPendingRollNum(roll.rollNumber)
                      setRollTitleOpen(true)
                    }}
                  >
                    제목 수정
                  </button>
                </div>
              </div>
              <div style={styles.riTitle}>{roll.title}</div>
              <div style={styles.riMeta}>
                {roll.frameCount} frames · {roll.startDate} — {roll.endDate}
              </div>
            </div>
          ))}
        </div>

        {/* ── 설정 ── */}
        <SettingItem
          icon={<IconSvg d="M7 1v2m0 8v2M1 7h2m8 0h2M2.9 2.9l1.4 1.4m5.4 5.4l1.4 1.4M2.9 11.1l1.4-1.4m5.4-5.4l1.4-1.4" />}
          label="매일 현상 알림"
          sub="오후 9시"
          rightEl={<Toggle active={notifEnabled} onChange={setNotifEnabled} />}
        />
        <SettingItem
          icon={<IconSvg d="M7 1a6 6 0 100 12A6 6 0 007 1zM7 4v3l2 1" />}
          label="테마"
          rightText="라이트"
        />
        <SettingItem
          icon={<IconSvg d="M1 7h10M7 3l4 4-4 4" />}
          label="데이터 내보내기"
          sub="PDF · 텍스트"
        />

        <div style={styles.divider} />

        <SettingItem
          icon={<IconSvg d="M2 2h10v2H2zm0 3h10v7H2z" />}
          label="보관된 필름"
          onPress={() => setArchivedOpen(true)}
        />
        <SettingItem
          icon={<IconSvg d="M9 7H1m4-4L1 7l4 4" />}
          label="로그아웃"
          onPress={handleLogout}
        />

        <div style={styles.divider} />

        {isConfirmingDelete ? (
          <div style={styles.withdrawConfirm}>
            <span style={styles.withdrawConfirmText}>정말 탈퇴하시겠어요? 모든 데이터가 삭제됩니다.</span>
            <div style={styles.withdrawBtns}>
              <button style={styles.withdrawCancel} onClick={() => setIsConfirmingDelete(false)}>
                취소
              </button>
              <button style={styles.withdrawOk} onClick={handleWithdrawConfirm}>
                탈퇴
              </button>
            </div>
          </div>
        ) : (
          <SettingItem
            icon={<IconSvg d="M7 1a6 6 0 100 12A6 6 0 007 1zM5 5l4 4m0-4L5 9" stroke="#c4866a" />}
            label="회원탈퇴"
            danger
            onPress={handleWithdrawFirst}
          />
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  view: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
    overflowY: 'auto',
  },
  skeleton: {
    flex: 1,
    background: 'var(--surface-muted)',
    margin: 16,
    borderRadius: 10,
    minHeight: 200,
  },

  // 프로필 카드
  profileCard: {
    padding: '18px 18px 14px',
    borderBottom: '1px solid rgba(42,38,32,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52, height: 52, borderRadius: '50%',
    background: '#2a2620',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, position: 'relative', cursor: 'pointer',
  },
  avatarImg: {
    width: 52, height: 52, borderRadius: '50%', objectFit: 'cover',
  },
  avatarText: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 18, fontWeight: 600, fontStyle: 'italic', color: '#F0EEE9',
  },
  avatarEdit: {
    position: 'absolute', bottom: -1, right: -1,
    width: 16, height: 16, borderRadius: '50%',
    background: '#c8a96e', border: '1.5px solid #F0EEE9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, color: '#fff',
  },
  profileName: {
    fontSize: 14, fontWeight: 500, color: '#2a2620', marginBottom: 3,
  },
  profileSince: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 8.5, color: '#b0a898', letterSpacing: '0.06em', marginBottom: 2,
  },
  profileBio: {
    fontSize: 9, color: '#9a9080', fontWeight: 300,
  },

  // 섹션
  section: { padding: '14px 16px 0' },
  secLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, color: '#b0a898', letterSpacing: '0.1em',
    marginBottom: 4, textTransform: 'uppercase',
  },
  secSublabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 7.5, color: '#c8c0b4', letterSpacing: '0.08em',
    marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },

  // 벤토 그리드
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    marginBottom: 6,
  },
  bc: {
    background: '#E4E1DA',
    borderRadius: 10,
    padding: '10px 10px 8px',
    border: '1px solid rgba(42,38,32,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  bcDark: { background: '#2a2620' },
  bcGold: { background: '#f5eed8', border: '1px solid rgba(200,169,110,0.25)' },
  badge: {
    display: 'inline-block',
    fontFamily: "'DM Mono', monospace",
    fontSize: 7,
    padding: '1px 5px',
    borderRadius: 4,
    background: 'rgba(42,38,32,0.08)',
    color: '#9a9080',
    marginBottom: 4,
  },
  badgeDark: { background: 'rgba(240,238,233,0.1)', color: 'rgba(240,238,233,0.4)' },
  badgeGold: { background: 'rgba(200,169,110,0.15)', color: '#c8a96e' },
  bcLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 7,
    color: '#b0a898',
    letterSpacing: '0.08em',
    marginBottom: 4,
  },
  bcVal: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 20,
    fontWeight: 600,
    color: '#2a2620',
    lineHeight: 1.1,
  },
  bcSub: {
    fontSize: 8,
    color: '#9a9080',
    marginTop: 2,
    fontWeight: 300,
  },
  moodBarMini: {
    display: 'flex',
    gap: 3,
    marginTop: 5,
    alignItems: 'flex-end',
    height: 18,
  },
  moodBar: {
    borderRadius: '2px 2px 0 0',
    flexShrink: 0,
    width: 8,
  },

  // 롤 관리
  rollItem: {
    background: '#E4E1DA',
    borderRadius: 10,
    padding: '10px 12px',
    border: '1px solid rgba(42,38,32,0.08)',
    marginBottom: 6,
  },
  rollItemActive: {
    borderColor: 'rgba(122,92,32,0.3)',
    background: '#f5f2eb',
  },
  riTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  riLeft: { display: 'flex', alignItems: 'center', gap: 7 },
  riNum: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 8,
    color: '#c8a96e',
    background: 'rgba(200,169,110,0.12)',
    padding: '2px 6px',
    borderRadius: 4,
  },
  riStatus: { fontSize: 8, fontWeight: 500 },
  riActions: { display: 'flex', gap: 5 },
  riBtn: {
    fontFamily: "'DM Mono', 'Noto Sans KR', monospace",
    fontSize: 7.5,
    color: '#9a9080',
    border: '1px solid rgba(42,38,32,0.15)',
    background: 'transparent',
    borderRadius: 4,
    padding: '2px 7px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  riBtnPrimary: {
    color: '#7a5c20',
    borderColor: 'rgba(122,92,32,0.3)',
  },
  riTitle: {
    fontSize: 10,
    fontWeight: 500,
    color: '#2a2620',
    marginBottom: 4,
  },
  riMeta: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 8,
    color: '#b0a898',
    marginTop: 2,
  },
  progressWrap: { marginTop: 6 },
  progressBar: {
    width: '100%', height: 3,
    background: 'rgba(42,38,32,0.1)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#7a5c20',
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  progressLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 7.5,
    color: '#b0a898',
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 3,
  },

  // 설정
  divider: {
    height: 6,
    background: 'rgba(42,38,32,0.04)',
  },

  // 회원탈퇴 확인
  withdrawConfirm: {
    padding: '14px 16px',
    background: 'rgba(196,134,106,0.06)',
    borderTop: '1px solid rgba(196,134,106,0.15)',
    borderBottom: '1px solid rgba(196,134,106,0.15)',
  },
  withdrawConfirmText: {
    display: 'block',
    fontSize: 10,
    color: '#c4866a',
    fontWeight: 300,
    marginBottom: 10,
  },
  withdrawBtns: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  },
  withdrawCancel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    color: '#9a9080',
    border: '1px solid rgba(42,38,32,0.15)',
    background: 'transparent',
    borderRadius: 6,
    padding: '5px 14px',
    cursor: 'pointer',
  },
  withdrawOk: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    color: '#fff',
    background: '#c4866a',
    border: 'none',
    borderRadius: 6,
    padding: '5px 14px',
    cursor: 'pointer',
  },
}
