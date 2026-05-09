<template>
  <div class="yiqi-auth-page register-auth">
    <MysticCanvasBackground />
    <div class="yiqi-auth-vignette" />
    <div class="register-box yiqi-glass-panel yiqi-glass-panel--wide">
      <div class="yiqi-title-block register-head">
        <h1 class="yiqi-brand register-brand">开启命格</h1>
        <p class="yiqi-subtitle">创建命盘 · 出生地辰与历法</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="register-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户名称" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱（可选）" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="历法类型" prop="calendarType">
              <el-radio-group v-model="form.calendarType" @change="onCalendarTypeChange">
                <el-radio label="solar">阳历</el-radio>
                <el-radio label="lunar">农历</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="省" prop="province">
              <el-select v-model="form.province" placeholder="请选择省" style="width: 100%;" @change="onProvinceChange">
                <el-option
                  v-for="item in provinces"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="市" prop="city">
              <el-select v-model="form.city" placeholder="请选择市" style="width: 100%;" :disabled="!form.province" @change="onCityChange">
                <el-option
                  v-for="item in cities"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="经纬" prop="district">
              <el-select v-model="form.district" placeholder="请选择经纬" style="width: 100%;" :disabled="!form.city" @change="onDistrictChange">
                <el-option
                  v-for="item in districts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="出生年" prop="birthYear">
              <el-select v-model="form.birthYear" placeholder="请选择年" style="width: 100%;" @change="onBirthYearChange">
                <el-option v-for="item in calendarYearOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出生月" prop="birthMonth">
              <el-select v-model="form.birthMonth" placeholder="请选择月" style="width: 100%;" :disabled="!form.birthYear" @change="onBirthMonthChange">
                <el-option v-for="item in calendarMonthOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出生日" prop="birthDay">
              <el-select v-model="form.birthDay" placeholder="请选择日" style="width: 100%;" :disabled="!form.birthMonth" @change="onBirthDayChange">
                <el-option v-for="item in calendarDayOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="年柱">
              <el-input :model-value="pillarThree.yearPillar" readonly placeholder="自动计算" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="月柱">
              <el-input :model-value="pillarThree.monthPillar" readonly placeholder="自动计算" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日柱">
              <el-input :model-value="pillarThree.dayPillar" readonly placeholder="自动计算" />
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
                style="width: 100%;"
                @change="onBirthTimeChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="时柱">
              <el-input :model-value="hourPillar" readonly placeholder="根据省市经纬和出生时间自动计算" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" :loading="loading" class="yiqi-btn-ritual" @click="onSubmit">
            {{ loading ? '推演命盘中…' : '开启命格' }}
          </el-button>
          <el-button class="yiqi-btn-ghost" @click="goLogin">返回天机</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '@/api/auth'
import { getCities, getDistricts, getHourPillar, getProvinces } from '@/api/region'
import { getCalendarDays, getCalendarMonths, getCalendarYears, getPillarThree } from '@/api/calendar'
import { touchSession, clearSession } from '@/utils/session'
import MysticCanvasBackground from '@/components/MysticCanvasBackground.vue'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const provinces = ref([])
const cities = ref([])
const districts = ref([])
const calendarYearOptions = ref([])
const calendarMonthOptions = ref([])
const calendarDayOptions = ref([])
const pillarThree = ref({
  yearPillar: '',
  monthPillar: '',
  dayPillar: ''
})
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
  city: '',
  district: ''
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
  city: [{ required: true, message: '请选择市', trigger: 'change' }],
  district: [{ required: true, message: '请选择经纬', trigger: 'change' }]
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
      if (typeof item === 'string') {
        return { label: item, value: item }
      }

      if (!item || typeof item !== 'object') return null

      const label =
        item.label ||
        item.name ||
        item.fullName ||
        item.cityName ||
        item.districtName ||
        item.coordinates ||
        ''

      let value = item.value
      if (value == null || value === '') {
        if (type === 'district') {
          value = item.coordinates || item.coordinate || item.lngLat || label
        } else {
          value = item.fullName || item.name || item.cityName || label
        }
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

  if (form.calendarType === 'lunar') {
    // 后端已支持农历字符串（如 1999-正-十五 02:00:04）
    return `${year}-${month}-${day} ${time}`
  }

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
  const yearsFromMap =
    form.calendarType === 'lunar'
      ? res?.data?.lunarYears || res?.lunarYears
      : res?.data?.solarYears || res?.solarYears

  calendarYearOptions.value = Array.isArray(yearsFromMap) ? yearsFromMap : normalizeList(res)
}

const onCalendarTypeChange = async () => {
  form.birthYear = ''
  form.birthMonth = ''
  form.birthDay = ''
  calendarMonthOptions.value = []
  calendarDayOptions.value = []
  pillarThree.value = { yearPillar: '', monthPillar: '', dayPillar: '' }
  await loadCalendarYears()
}

const onBirthYearChange = async () => {
  form.birthMonth = ''
  form.birthDay = ''
  calendarDayOptions.value = []
  pillarThree.value = { yearPillar: '', monthPillar: '', dayPillar: '' }
  if (!form.birthYear) return
  const res = await getCalendarMonths(form.calendarType, form.birthYear)
  calendarMonthOptions.value = normalizeList(res)
}

const onBirthMonthChange = async () => {
  form.birthDay = ''
  pillarThree.value = { yearPillar: '', monthPillar: '', dayPillar: '' }
  if (!form.birthYear || !form.birthMonth) return
  const res = await getCalendarDays(form.calendarType, form.birthYear, form.birthMonth)
  calendarDayOptions.value = normalizeList(res)
}

const onBirthDayChange = async () => {
  pillarThree.value = { yearPillar: '', monthPillar: '', dayPillar: '' }
  if (!form.birthYear || !form.birthMonth || !form.birthDay) return

  const res = await getPillarThree(
    form.calendarType,
    form.birthYear,
    form.birthMonth,
    form.birthDay
  )

  const formatPillar = (pillar) => {
    if (!pillar) return ''
    if (typeof pillar === 'string') return pillar
    const tianGan = pillar.tianGan || ''
    const diZhi = pillar.diZhi || ''
    return `${tianGan}${diZhi}`.trim()
  }

  pillarThree.value = {
    yearPillar: formatPillar(res?.data?.yearPillar || res?.yearPillar),
    monthPillar: formatPillar(res?.data?.monthPillar || res?.monthPillar),
    dayPillar: formatPillar(res?.data?.dayPillar || res?.dayPillar)
  }
}

const onProvinceChange = async () => {
  form.city = ''
  form.district = ''
  hourPillar.value = ''
  cities.value = []
  districts.value = []

  if (!form.province) return
  const res = await getCities(form.province)
  cities.value = normalizeRegionOptions(normalizeList(res), 'city')
}

const onCityChange = async () => {
  form.district = ''
  hourPillar.value = ''
  districts.value = []

  if (!form.province || !form.city) return
  const res = await getDistricts(form.province, form.city)
  districts.value = normalizeRegionOptions(normalizeList(res), 'district')
}

const updateHourPillar = async () => {
  if (!form.province || !form.city || !form.district || !form.birthTime) {
    hourPillar.value = ''
    return
  }

  const res = await getHourPillar(form.province, form.city, form.district, form.birthTime.slice(0, 5))
  const directHourPillar = res?.data?.hourGanZhi
  const objectHourPillar = `${res?.data?.hourPillar?.hourTianGan || ''}${res?.data?.hourPillar?.hourDiZhi || ''}`.trim()
  hourPillar.value = directHourPillar || objectHourPillar
}

const onDistrictChange = async () => {
  await updateHourPillar()
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
      district: form.district
    })
    const payload = res?.data || res || {}

    const token =
      payload?.token ||
      res?.token ||
      payload?.accessToken ||
      res?.accessToken ||
      ''
    const user =
      payload?.user ||
      res?.user || {
        id: payload?.id,
        username: payload?.username || form.username,
        userType: payload?.userType || form.userType,
        gender: form.gender
      }
    const baziAnalysis = payload?.baziAnalysis ?? null
    const hourSummary = {
      hourTianGan: payload?.hourTianGan || '',
      hourDiZhi: payload?.hourDiZhi || '',
      hourGanZhi: payload?.hourGanZhi || hourPillar.value || '',
      actualBirthTime: payload?.actualBirthTime || '',
      longitudeCorrectionMinutes: payload?.longitudeCorrectionMinutes || ''
    }

    localStorage.setItem('baziAnalysis', JSON.stringify(baziAnalysis))
    localStorage.setItem('hourSummary', JSON.stringify(hourSummary))

    if (token) {
      clearSession()
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('baziAnalysis', JSON.stringify(baziAnalysis))
      localStorage.setItem('hourSummary', JSON.stringify(hourSummary))
      touchSession()
      ElMessage.success('命格已启')
      router.push('/index')
      return
    }

    ElMessage.success('命盘已立，请回天机关卡登录')
    router.push('/login')
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error?.response?.data?.error ||
      error?.message ||
      '注册失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
}

onMounted(async () => {
  try {
    await loadProvinces()
    await loadCalendarYears()
  } catch (error) {
    ElMessage.error('初始化数据失败')
  }
})
</script>

<style scoped>
.register-auth {
  align-items: flex-start;
  padding-top: 32px;
  padding-bottom: 32px;
}

.register-head {
  margin-bottom: 20px;
}

.register-brand {
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  font-size: clamp(22px, 3.2vw, 30px);
}

.register-form :deep(.el-row) {
  margin-bottom: 0;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.register-form :deep(.el-date-editor),
.register-form :deep(.el-date-editor .el-input__wrapper) {
  width: 100%;
}
</style>

