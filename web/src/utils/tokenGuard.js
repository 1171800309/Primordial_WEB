/** JWT 仅作身份凭证；超过此长度视为旧版大 token，需重新登录 */
export const MAX_TOKEN_LENGTH = 4096

export const isOversizedToken = (token) =>
  typeof token === 'string' && token.length > MAX_TOKEN_LENGTH
