import request from './request'

export const fetchChaosQuizHub = () =>
  request({
    url: '/api/me/chaos-quizzes/hub',
    method: 'get'
  })

export const fetchChaosQuizDetail = (slug) =>
  request({
    url: `/api/me/chaos-quizzes/${slug}`,
    method: 'get'
  })

export const submitChaosQuiz = (slug, answers) =>
  request({
    url: `/api/me/chaos-quizzes/${slug}/submit`,
    method: 'post',
    data: { answers }
  })

export const resetChaosQuiz = (slug) =>
  request({
    url: `/api/me/chaos-quizzes/${slug}/reset`,
    method: 'post'
  })
