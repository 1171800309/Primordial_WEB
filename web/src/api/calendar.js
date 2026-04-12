import request from './request'

export const getCalendarYears = (calendarType) => {
  return request({
    url: import.meta.env.VITE_CALENDAR_YEARS_PATH || '/api/Pillar/years',
    method: 'get',
    params: { calendarType }
  })
}

export const getCalendarMonths = (calendarType, year) => {
  return request({
    url: import.meta.env.VITE_CALENDAR_MONTHS_PATH || '/api/Pillar/months',
    method: 'get',
    params: { calendarType, year }
  })
}

export const getCalendarDays = (calendarType, year, month) => {
  return request({
    url: import.meta.env.VITE_CALENDAR_DAYS_PATH || '/api/Pillar/days',
    method: 'get',
    params: { calendarType, year, month }
  })
}

export const getPillarThree = (calendarType, year, month, day) => {
  return request({
    url: import.meta.env.VITE_PILLAR_THREE_PATH || '/api/Pillar/three',
    method: 'get',
    params: { calendarType, year, month, day }
  })
}

