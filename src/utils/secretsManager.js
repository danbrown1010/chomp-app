import { supabase } from '../lib/supabase'

function encryptKey(text, userId) {
  const key = userId.replace(/-/g, '')
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^
      key.charCodeAt(i % key.length)
    )
  }
  return btoa(result)
}

function decryptKey(encoded, userId) {
  const key = userId.replace(/-/g, '')
  const text = atob(encoded)
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^
      key.charCodeAt(i % key.length)
    )
  }
  return result
}

export async function saveAnthropicKey(apiKey, userId) {
  const encrypted = encryptKey(apiKey, userId)

  const { error } = await supabase
    .from('user_secrets')
    .upsert({
      user_id: userId,
      anthropic_key_encrypted: encrypted,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('Failed to save key to Supabase:', error)
    localStorage.setItem('vela-anthropic-key', apiKey)
    return false
  }

  localStorage.setItem('vela-anthropic-key', apiKey)
  return true
}

export async function getAnthropicKey(userId) {
  const cached = localStorage.getItem('vela-anthropic-key')
  if (cached) return cached

  if (!userId) return null

  const { data, error } = await supabase
    .from('user_secrets')
    .select('anthropic_key_encrypted')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  const decrypted = decryptKey(data.anthropic_key_encrypted, userId)
  localStorage.setItem('vela-anthropic-key', decrypted)
  return decrypted
}

export async function clearAnthropicKey(userId) {
  localStorage.removeItem('vela-anthropic-key')

  if (userId) {
    const { error } = await supabase
      .from('user_secrets')
      .delete()
      .eq('user_id', userId)
    if (error) console.error('Failed to clear key from Supabase:', error)
  }

  console.log('API key cleared from localStorage and Supabase')
}

export async function hasAnthropicKey(userId) {
  if (!userId) {
    return !!localStorage.getItem('vela-anthropic-key')
  }

  const { data } = await supabase
    .from('user_secrets')
    .select('anthropic_key_encrypted')
    .eq('user_id', userId)
    .single()

  if (!data?.anthropic_key_encrypted) {
    localStorage.removeItem('vela-anthropic-key')
    return false
  }

  return true
}
