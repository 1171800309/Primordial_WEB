<template>
  <AuthPageShell
    title="开启命格"
    subtitle="录入时空坐标，对齐先天之炁"
    wide
    scrollable
    :show-hero-logo="false"
    :header-link="{ to: '/login', label: '已有命格' }"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="auth-form">
      <div class="auth-section-title">基础信息</div>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名称" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="邮箱（可选）" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="历法类型" prop="calendarType">
            <el-radio-group v-model="form.calendarType" @change="onCalendarTypeChange">
              <el-radio label="solar">阳历</el-radio>
              <el-radio label="lunar">农历</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="auth-section-title">出生坐标</div>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="省" prop="province">
            <el-select v-model="form.province" placeholder="请选择省" style="width: 100%" @change="onProvinceChange">
              <el-option v-for="item in provinces" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="市" prop="city">
            <el-select
              v-model="form.city"
              placeholder="请选择市"
              style="width: 100%"
              :disabled="!form.province"
              @change="onCityChange"
            >
              <el-option v-for="item in cities" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <p class="auth-coords-hint">经纬已固定为<strong>东经</strong>基准（北京时间参考），与所选省市无关。</p>

      <div class="auth-section-title">出生时辰</div>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="8">
          <el-form-item label="出生年" prop="birthYear">
            <el-select v-model="form.birthYear" placeholder="请选择年" style="width: 100%" @change="onBirthYearChange">
              <el-option v-for="item in calendarYearOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="出生月" prop="birthMonth">
            <el-select
              v-model="form.birthMonth"
              placeholder="请选择月"
              style="width: 100%"
              :disabled="!form.birthYear"
              @change="onBirthMonthChange"
            >
              <el-option v-for="item in calendarMonthOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="出生日" prop="birthDay">
            <el-select
              v-model="form.birthDay"
              placeholder="请选择日"
              style="width: 100%"
              :disabled="!form.birthMonth"
              @change="onBirthDayChange"
            >
              <el-option v-for="item in calendarDayOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="出生时间" prop="birthTime">
            <el-time-picker
              v-model="form.birthTime"
              placeholder="请选择出生时间"
              value-format="HH:mm:ss"
              format="HH时mm分ss秒"
              style="width: 100%"
              @change="onBirthTimeChange"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="auth-actions">
        <button type="button" class="auth-submit-btn" :disabled="loading" @click="onSubmit">
          {{ loading ? '时空对齐中…' : '开启命格' }}
        </button>
        <button type="button" class="auth-ghost-btn" @click="goLogin">返回登录</button>
      </div>
    </el-form>
  </AuthPageShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, login } from '@/api/auth'
import { getCities, getHourPillar, getProvinces } from '@/api/region'
import { getCalendarDays, getCalendarMonths, getCalendarYears, getPillarThree } from '@/api/calendar'
import { extractAuthPayload, saveAuthSession, navigateToHub, skipTokenValidationOnce } from '@/utils/authSession'
import { persistBaziAnalysis } from '@/utils/baziAnalysis'
import { ensureBaziAnalysis } from '@/utils/userData'
import AuthPageShell from '@/components/layout/AuthPageShell.vue'
import { fetchAuthPublicKey } from '@/utils/passwordCipher'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const REGISTER_EAST_LONGITUDE_COORDINATES = '116.407526,39.904030'

const provinces = ref([])
const cities = ref([])
const calendarYearOptions = ref([])
const calendarMonthOptions = ref([])
const calendarDayOptions = ref([])
const pillarThree = ref({ yearPillar: '', monthPillar: '', dayPillar: '' })
const hourPillar = ref('')

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
  userType: 'member',
  gender: 'male',
  calendarType: 'solar',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  birthTime: '',
  province: '',
  city: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  calendarType: [{ required: true, message: '请选择历法类型', trigger: 'change' }],
  birthYear: [{ required: true, message: '请选择出生年', trigger: 'change' }],
  birthMonth: [{ required: true, message: '请选择出生月', trigger: 'change' }],
  birthDay: [{ required: true, message: '请选择出生日', trigger: 'change' }],
  birthTime: [{ required: true, message: '请选择出生时间', trigger: 'change' }],
  province: [{ required: true, message: '请选择省', trigger: 'change' }],
  city: [{ required: true, message: '请选择市', trigger: 'change' }]
}

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  return []
}

const normalizeRegionOptions = (items, type) => {
  return items
    .map((item) => {
      if (typeof item === 'string') return { label: item, value: item }
      if (!item || typeof item !== 'object') return null
      const label = item.label || item.name || item.fullName || item.cityName || item.districtName || item.coordinates || ''
      let value = item.value
      if (value == null || value === '') {
        value = type === 'district' ? item.coordinates || item.coordinate || item.lngLat || label : item.fullName || item.name || item.cityName || label
      }
      if (!label || value == null || value === '') return null
      return { label: String(label), value: String(value) }
    })
    .filter(Boolean)
}

const pad2 = (v) => String(v).padStart(2, '0')

const buildBirthDateTime = () => {
  if (!form.birthYear || !form.birthMonth || !form.birthDay || !form.birthTime) return ''
  const time = form.birthTime.length >= 8 ? form.birthTime : `${form.birthTime}:00`
  const year = String(form.birthYear)
  const month = String(form.birthMonth)
  const day = String(form.birthDay)
  if (form.calendarType === 'lunar') return `${year}-${month}-${day} ${time}`
  const numericDate = /^\d{1,4}$/.test(year) && /^\d{1,2}$/.test(month) && /^\d{1,2}$/.test(day)
  if (!numericDate) return ''
  return `${year}-${pad2(month)}-${pad2(day)} ${time}`
}

const loadProvinces = async () => {
  const res = await getProvinces()
  provinces.value = normalizeRegionOptions(normalizeList(res), 'province')
}

const loadCalendarYears = async () => {
  const res = await getCalendarYears(form.calendarType)
  const yearsFromMap = form.calendarType === 'lunar' ? res?.data?.lunarYears || res?.lunarYears : res?.data?.solarYears || res?.solarYears
  calendarYearOptions.value = Array.isArray(yearsFromMap) ? yearsFromMap : normalizeList(res)
}

const onCalendarTypeChange = async () => {
  form.birthYear = ''
  form.birthMonth = ''
  form.birthDay = ''
  calendarMonthOptions.value = []
  calendarDayOptions.value = []
  pillarThree.value = { yearPillar: '', monthPillar: '', dayPillar: '' }
  hourPillar.value = ''
  await loadCalendarYears()
}

const onBirthYearChange = async () => {
  form.birthMonth = ''
  form.birthDay = ''
  calendarDayOptions.value = []
  pillarThree.value = { yearPillar: '', monthPillar: '', dayPillar: '' }
  hourPillar.value = ''
  if (!form.birthYear) return
  const res = await getCalendarMonths(form.calendarType, form.birthYear)
  calendarMonthOptions.value = normalizeList(res)
  await updateHourPillar()
}

const onBirthMonthChange = async () => {
  form.birthDay = ''
  pillarThree.value = { yearPillar: '', monthPillar: '', dayPillar: '' }
  hourPillar.value = ''
  if (!form.birthYear || !form.birthMonth) return
  const res = await getCalendarDays(form.calendarType, form.birthYear, form.birthMonth)
  calendarDayOptions.value = normalizeList(res)
  await updateHourPillar()
}

const onBirthDayChange = async () => {
  pillarThree.value = { yearPillar: '', monthPillar: '', dayPillar: '' }
  if (!form.birthYear || !form.birthMonth || !form.birthDay) return
  const res = await getPillarThree(form.calendarType, form.birthYear, form.birthMonth, form.birthDay)
  const formatPillar = (pillar) => {
    if (!pillar) return ''
    if (typeof pillar === 'string') return pillar
    return `${pillar.tianGan || ''}${pillar.diZhi || ''}`.trim()
  }
  pillarThree.value = {
    yearPillar: formatPillar(res?.data?.yearPillar || res?.yearPillar),
    monthPillar: formatPillar(res?.data?.monthPillar || res?.monthPillar),
    dayPillar: formatPillar(res?.data?.dayPillar || res?.dayPillar)
  }
  await updateHourPillar()
}

const onProvinceChange = async () => {
  form.city = ''
  hourPillar.value = ''
  cities.value = []
  if (!form.province) return
  const res = await getCities(form.province)
  cities.value = normalizeRegionOptions(normalizeList(res), 'city')
}

const onCityChange = async () => {
  hourPillar.value = ''
  await updateHourPillar()
}

const buildSolarBirthDateForHourApi = () => {
  if (form.calendarType !== 'solar') return ''
  if (!form.birthYear || !form.birthMonth || !form.birthDay) return ''
  const year = String(form.birthYear)
  const month = String(form.birthMonth)
  const day = String(form.birthDay)
  if (!/^\d{1,4}$/.test(year) || !/^\d{1,2}$/.test(month) || !/^\d{1,2}$/.test(day)) return ''
  return `${year}-${pad2(month)}-${pad2(day)}`
}

const updateHourPillar = async () => {
  hourPillar.value = ''
  if (!form.province || !form.city || !form.birthTime) return
  if (!form.birthYear || !form.birthMonth || !form.birthDay) return
  const birthTime = form.birthTime.length === 5 ? `${form.birthTime}:00` : form.birthTime
  const params = { province: form.province, city: form.city, coordinates: REGISTER_EAST_LONGITUDE_COORDINATES, birthTime }
  if (form.calendarType === 'lunar') {
    params.calendarType = 'lunar'
    params.birthYear = String(form.birthYear)
    params.lunarMonth = String(form.birthMonth)
    params.lunarDay = String(form.birthDay)
  } else {
    const birthDate = buildSolarBirthDateForHourApi()
    if (!birthDate) return
    params.birthDate = birthDate
  }
  try {
    const res = await getHourPillar(params)
    const d = res?.data ?? res ?? {}
    hourPillar.value = (typeof d.hourGanZhi === 'string' && d.hourGanZhi.trim()) || `${d.hourTianGan || ''}${d.hourDiZhi || ''}`.trim() || ''
  } catch {
    hourPillar.value = ''
  }
}

const onBirthTimeChange = async () => {
  await updateHourPillar()
}

const onSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const birthDateTime = buildBirthDateTime()
    if (!birthDateTime) {
      ElMessage.error('出生年月日格式无效，请检查后重试')
      return
    }

    const res = await register({
      username: form.username,
      password: form.password,
      email: form.email || undefined,
      phone: form.phone,
      userType: form.userType,
      gender: form.gender,
      calendarType: form.calendarType,
      birthDateTime,
      province: form.province,
      city: form.city,
      district: REGISTER_EAST_LONGITUDE_COORDINATES
    })

    const fallbackUser = {
      username: form.username,
      userType: form.userType,
      gender: form.gender
    }
    let auth = extractAuthPayload(res, fallbackUser)

    if (auth.hourSummary && !auth.hourSummary.hourGanZhi && hourPillar.value) {
      auth.hourSummary.hourGanZhi = hourPillar.value
    }

    if (!auth.token) {
      const loginRes = await login({
        username: form.username,
        password: form.password
      })
      auth = extractAuthPayload(loginRes, fallbackUser)
      if (auth.hourSummary && !auth.hourSummary.hourGanZhi && hourPillar.value) {
        auth.hourSummary.hourGanZhi = hourPillar.value
      }
    }

    if (!saveAuthSession({ token: auth.token, user: auth.user })) {
      ElMessage.error('注册成功但未获取登录凭证，请手动登录')
      await router.replace('/login')
      return
    }

    if (auth.baziAnalysis != null) {
      persistBaziAnalysis(auth.baziAnalysis)
    } else {
      ensureBaziAnalysis().catch(() => {})
    }

    skipTokenValidationOnce()
    ElMessage.success('命格已启')
    await navigateToHub(router)
  } catch (error) {
    const msg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error || error?.message || '注册失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
}

onMounted(async () => {
  fetchAuthPublicKey().catch(() => {})
  try {
    await loadProvinces()
    await loadCalendarYears()
  } catch {
    ElMessage.error('初始化数据失败')
  }
})
</script>
