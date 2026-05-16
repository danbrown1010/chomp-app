import { supabase } from '../lib/supabase'

export async function uploadPetPhoto(file, petId, userId) {
  const ext = file.name.split('.').pop()
  const path = `pets/${userId}/${petId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('pet-photos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('pet-photos').getPublicUrl(path)
  return data.publicUrl
}
