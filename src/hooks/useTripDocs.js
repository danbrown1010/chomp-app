import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getSignedUrl } from '../utils/documentStorage'

// Module-level cache keyed by tripId so docs survive component remounts
const _tripDocsCache = {} // { [tripId]: docs[] }

const SELECT_COLS =
  'id, title, type, category, content, file_path, file_name, ' +
  'file_size, file_type, tags, metadata, extracted_text, ' +
  'is_sensitive, created_at'

export function useTripDocs(tripId, userId) {
  const cached = tripId ? (_tripDocsCache[tripId] ?? null) : null
  const [docs, setDocs] = useState(cached ?? [])
  const [loading, setLoading] = useState(cached === null && !!(tripId && userId))

  useEffect(() => {
    if (!tripId || !userId) {
      setDocs([])
      setLoading(false)
      return
    }

    let cancelled = false
    // Only show spinner on first fetch; subsequent visits refresh silently
    if (!_tripDocsCache[tripId]) setLoading(true)

    supabase
      .from('glove_box')
      .select(SELECT_COLS)
      .eq('trip_id', tripId)
      .eq('is_secret', false)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) console.error('Trip docs error:', error)
        const result = data ?? []
        _tripDocsCache[tripId] = result
        setDocs(result)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error('Trip docs fetch error:', err)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [tripId, userId])

  async function loadTripDocs() {
    if (!tripId || !userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('glove_box')
        .select(SELECT_COLS)
        .eq('trip_id', tripId)
        .eq('is_secret', false)
        .order('created_at', { ascending: false })
      if (error) console.error('Trip docs error:', error)
      const result = data ?? []
      _tripDocsCache[tripId] = result
      setDocs(result)
    } catch (err) {
      console.error('Trip docs fetch error:', err)
    } finally {
      setLoading(false)
    }
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
