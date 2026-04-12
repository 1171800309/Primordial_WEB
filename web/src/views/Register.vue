<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">用户注册</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
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
            <el-form-item label="身份证" prop="identityCard">
              <el-input v-model="form.identityCard" placeholder="请输入身份证号" />
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
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="省" prop="province">
              <el-select v-model="form.province" placeholder="请选择省" style="width: 100%;" @change="onProvinceChange">
                <el-option v-for="item in provinces" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="市" prop="city">
              <el-select v-model="form.city" placeholder="请选择市" style="width: 100%;" :disabled="!form.province" @change="onCityChange">
                <el-option v-for="item in cities" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="经纬" prop="district">
              <el-select v-model="form.district" placeholder="请选择经纬" style="width: 100%;" :disabled="!form.city">
                <el-option v-for="item in districts" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">
            {{ loading ? '提交中...' : '注册' }}
          </el-button>
          <el-button @click="goLogin">返回登录</el-button>
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
import { getCities, getDistricts, getProvinces } from '@/api/region'
import { getCalendarDays, getCalendarMonths, getCalendarYears, getPillarThree } from '@/api/calendar'

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
const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
  userType: 'member',
  identityCard: '',
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
  identityCard: [{ required: true, message: '请输入身份证', trigger: 'blur' }],
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

const loadProvinces = async () => {
  const res = await getProvinces()
  provinces.value = normalizeList(res)
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
  cities.value = []
  districts.value = []

  if (!form.province) return
  const res = await getCities(form.province)
  cities.value = normalizeList(res)
}

const onCityChange = async () => {
  form.district = ''
  districts.value = []

  if (!form.province || !form.city) return
  const res = await getDistricts(form.province, form.city)
  districts.value = normalizeList(res)
}

const onSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await register({
      username: form.username,
      password: form.password,
      email: form.email || undefined,
      phone: form.phone,
      userType: form.userType,
      identityCard: form.identityCard,
      calendarType: form.calendarType,
      birthDateTime: `${form.birthYear}-${form.birthMonth}-${form.birthDay} ${form.birthTime}`,
      province: form.province,
      city: form.city,
      district: form.district
    })
    ElMessage.success('注册成功，请登录')
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
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
}

.register-box {
  width: 860px;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 28px;
}

.title {
  margin: 0 0 20px;
  text-align: center;
  color: #1a1a2e;
  font-size: 28px;
  font-weight: 600;
}
</style>

