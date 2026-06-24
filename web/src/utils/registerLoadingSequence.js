const REGISTER_LOADING_LABELS = [
  '炁频链接中',
  '能量同步中',
  '完成真太阳时校正',
  '系统开始计算',
  '先天恒炁值计算完成',
  '先天特性提取完成',
  '特性词卡匹配完成',
  '显性八维图已生成',
  '隐性八维图已生成',
  '大运计算中',
  '大运buff计算完成',
  '流年buff计算完成',
  '流月buff计算完成',
  '七十二候buff计算完成',
  '炁念宇宙后台链接完毕',
  '炁运河录匹配完成',
  '炁性维图计算完成',
  '我的炁运录准备开启',
  '正在进入我的炁运录'
]

/** 过场文案逐条显现：7.05s 播放 + 0.15s 跳转缓冲，总时长约 7.2s */
export const REGISTER_LOADING_DURATIONS_MS = [
  370, 370, 370, 370, 370, 370, 370, 370, 370, 370,
  370, 370, 370, 370, 370, 370, 370, 370, 390
]

/**
 * @returns {{ label: string }[]}
 */
export const buildRegisterLoadingSteps = () =>
  REGISTER_LOADING_LABELS.map((label) => ({ label }))

export const getRegisterLoadingTotalMs = () =>
  REGISTER_LOADING_DURATIONS_MS.reduce((sum, ms) => sum + ms, 0)

/** 0-1 进度 -> Logo 旋转周期（秒）：慢起、快中、慢收 */
export const getLogoSpinDurationSec = (progress) => {
  const p = Math.min(1, Math.max(0, progress))
  if (p <= 0.12) return 4.2 - p * 8
  if (p >= 0.88) return 1.2 + (p - 0.88) * 25
  const mid = (p - 0.12) / 0.76
  return 1.2 + (1 - mid) * 2.2
}
