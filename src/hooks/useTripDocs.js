import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getSignedUrl } from '../utils/documentStorage'

export function useTripDocs(tripId, userId) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId || !userId) {
      setDocs([])
      setLoading(false)
      return
    }
    loadTripDocs()
  }, [tripId, userId])

  async function loadTripDocs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('glove_box')
      .select(
        'id, title, type, category, content, file_path, file_name, ' +
        'file_size, file_type, tags, metadata, extracted_text, ' +
        'is_sensitive, created_at'
      )
      .eq('trip_id', tripId)
      .eq('is_secret', false)
      .order('created_at', { ascending: false })

    if (error) console.error('Trip docs error:', error)
    setDocs(data ?? [])
    setLoading(false)
  }

  async function getDocUrl(doc) {
    if (!doc.file_path) return null
    try {
      return await getSignedUrl(doc.file_path)
    } catch (err) {
      console.error('Signed URL error:', err)
      return null
    }
  }

  return { docs, loading, getDocUrl, reload: loadTripDocs }
}
