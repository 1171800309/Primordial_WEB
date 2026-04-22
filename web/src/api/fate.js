import request from './request'

export const analyzeByUser = (userId, gender) => {
  return request({
    url: '/api/Fate/analyze-by-user',
    method: 'post',
    data: {
      userId,
      gender
    }
  })
}

