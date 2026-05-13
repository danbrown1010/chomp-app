const LS_KEY = 'vela-anthropic-key'

export function getAnthropicKey() {
  return localStorage.getItem(LS_KEY) ?? ''
}
