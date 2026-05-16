import { supabase } from '../lib/supabase'

const BUCKET = 'travel-docs'
const SIGNED_URL_EXPIRY = 3600

export async function uploadDocument(file, userId) {
  const timestamp = Date.now()
  const path = `${userId}/${timestamp}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw uploadError
  return path
}

export async function getSignedUrl(filePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY)

  if (error) throw error
  return data.signedUrl
}

export async function deleteDocument(filePath) {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath])
  if (error) throw error
}

export function getFileType(file) {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('text/')) return 'text'
  return 'other'
}

export function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
