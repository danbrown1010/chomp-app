import { useState, useEffect, useRef } from 'react'
import { extractTextFromPDF, chunkText } from '../utils/pdfProcessor'
import { saveDocument, getDocuments, deleteDocument, saveChunks, searchChunks } from '../utils/ragStorage'
import { ProGate } from '../components/ProGate'
import { useAppStore } from '../store/index'
import { getAnthropicKey } from '../utils/secretsManager'

// ─── Markdown renderer ────────────────────────────────────────────────────────

function formatInline(raw) {
  return raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.15);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:11px">$1</code>')
}

function renderMarkdown(text) {
  const lines = text.split('\n')
  const result = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { i++; continue }

    // Heading
    const hMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (hMatch) {
      const level = hMatch[1].length
      const sizes = { 1: 16, 2: 15, 3: 14 }
      result.push(
        <p key={`h-${i}`} style={{ margin: '10px 0 4px', fontWeight: 700, fontSize: sizes[level], color: 'var(--text-primary)', lineHeight: 1.3 }}
          dangerouslySetInnerHTML={{ __html: formatInline(hMatch[2]) }} />
      )
      i++; continue
    }

    // Bullet list
    if (/^[-*•]\s/.test(line)) {
      const items = []
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s/, ''))
        i++
      }
      result.push(
        <ul key={`ul-${i}`} style={{ margin: '4px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item, j) => (
            <li key={j} style={{ lineHeight: 1.55 }}
              dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      )
      continue
    }

    result.push(
      <p key={`p-${i}`} style={{ margin: '3px 0', lineHeight: 1.55 }}
        dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
    )
    i++
  }
  return result
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const INITIAL_MESSAGES = [{
  role: 'assistant',
  content: `VELA Knowledge Base online.\n\nUpload your manuals and guides, then ask me anything about them. I'll search the documents and give you accurate answers with page references.\n\n**Suggested documents to upload:**\n- Jeep JKU Owner's Manual\n- Ursa Minor camper manual\n- EcoFlow Delta 2 Max manual\n- Recovery techniques guide`,
}]

export default function KnowledgeBasePage({ onBack }) {
  return <ProGate feature="Knowledge Base"><KnowledgeBaseInner onBack={onBack} /></ProGate>
}

function KnowledgeBaseInner({ onBack }) {
  const { user } = useAppStore()
  const [documents, setDocuments]           = useState([])
  const [messages, setMessages]             = useState(INITIAL_MESSAGES)
  const [input, setInput]                   = useState('')
  const [loading, setLoading]               = useState(false)
  const [uploading, setUploading]           = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [activeTab, setActiveTab]           = useState('chat')
  const [apiKey, setApiKey]                 = useState(null)
  const fileInputRef  = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef      = useRef(null)

  useEffect(() => { loadDocuments() }, [])
  useEffect(() => { getAnthropicKey(user?.id).then(setApiKey) }, [user?.id])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadDocuments = async () => {
    const docs = await getDocuments()
    setDocuments(docs)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.name.endsWith('.pdf')) return

    setUploading(true)
    setActiveTab('chat')

    try {
      const docId = `doc-${Date.now()}`

      setUploadProgress('Opening PDF…')
      const { text, totalPages } = await extractTextFromPDF(
        file,
        (msg) => setUploadProgress(msg),
      )

      setUploadProgress(`Chunking ${totalPages} pages…`)
      const chunks = chunkText(text, docId, file.name)

      await saveDocument({
        id: docId,
        name: file.name,
        totalPages,
        totalChunks: chunks.length,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      })

      await saveChunks(chunks, (done, total) => {
        setUploadProgress(`Indexing ${done} / ${total} sections…`)
      })

      await loadDocuments()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✓ Indexed **${file.name}**\n\n${totalPages} pages · ${chunks.length} searchable sections\n\nYou can now ask questions about this document.`,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Failed to process PDF: ${err.message}`,
      }])
    } finally {
      setUploading(false)
      setUploadProgress(null)
      e.target.value = ''
    }
  }

  const handleDeleteDoc = async (id, name) => {
    await deleteDocument(id)
    await loadDocuments()
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Removed **${name}** from the knowledge base.`,
    }])
  }

  const sendMessage = async () => {
    const query = input.trim()
    if (!query || loading) return

    if (!apiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'No API key configured. Go to **Settings → AI Configuration** to add your Anthropic API key.',
      }])
      return
    }

    const userMsg = { role: 'user', content: query }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const relevantChunks = await searchChunks(query, 8)

      let system = `You are VELA's Knowledge Base assistant. You answer questions about vehicles, equipment, and outdoor gear based on uploaded manuals and guides.\n\nBe precise and cite page numbers when available. If the answer is not in the provided documents, say so clearly rather than guessing. Format responses clearly with headers and bullet points where appropriate.`

      if (relevantChunks.length > 0) {
        system += `\n\nRelevant sections from the knowledge base:\n\n`
        relevantChunks.forEach((chunk, i) => {
          system += `--- Section ${i + 1} (${chunk.docName}) ---\n${chunk.text}\n\n`
        })
      } else if (documents.length === 0) {
        system += `\n\nNo documents have been uploaded yet. Let the user know they should upload their manuals first.`
      } else {
        system += `\n\nNo relevant sections found in the uploaded documents for this query. Say so clearly.`
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          system,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const reply = data.content?.[0]?.text ?? 'No response received.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  // ── Shared back button / header ────────────────────────────────────────────

  const Header = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid var(--border)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-secondary)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em', margin: 0 }}>
            KNOWLEDGE BASE
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em', margin: '2px 0 0' }}>
            {documents.length} DOCUMENT{documents.length !== 1 ? 'S' : ''} INDEXED
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 3, background: 'var(--bg-card)', borderRadius: 8, padding: 3 }}>
        {[['chat', 'Ask'], ['docs', 'Docs']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: '4px 14px', borderRadius: 6, border: 'none',
              background: activeTab === id ? 'var(--accent)' : 'transparent',
              color: activeTab === id ? '#fff' : 'var(--text-tertiary)',
              fontSize: 12, fontFamily: 'var(--font-body)',
              fontWeight: activeTab === id ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )

  // ── Chat tab ───────────────────────────────────────────────────────────────

  if (activeTab === 'chat') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
        <Header />
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: msg.role === 'user' ? '80%' : '88%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'var(--accent, #C4521A)' : 'var(--bg-card)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: 14,
              }}>
                {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                    animation: 'pulse 1s ease-in-out infinite',
                    animationDelay: `${j * 0.18}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          display: 'flex', gap: 8, padding: '10px 16px',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
          background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your manuals…"
            style={{
              flex: 1, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 20,
              padding: '10px 16px', color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              flexShrink: 0, transition: 'background 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={input.trim() && !loading ? '#fff' : 'var(--text-tertiary)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // ── Docs tab ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      <Header />

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%', padding: '14px', marginBottom: 16,
            borderRadius: 12, border: '2px dashed var(--border)',
            background: 'transparent',
            color: uploading ? 'var(--text-tertiary)' : 'var(--accent)',
            fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: 500,
            cursor: uploading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {uploading ? (
            <>{uploadProgress}</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload PDF manual
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {documents.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)',
            fontSize: 13, lineHeight: 1.7,
          }}>
            No documents uploaded yet.
            <br />Upload your manuals to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Indexed Documents
            </p>
            {documents.map(doc => (
              <div key={doc.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {/* PDF icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(196,82,26,0.12)',
                  border: '1px solid rgba(196,82,26,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="var(--accent, #C4521A)" strokeWidth="1.75"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="13" y2="17" />
                  </svg>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    margin: 0,
                  }}>
                    {doc.name}
                  </p>
                  <p style={{
                    fontSize: 11, color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)', marginTop: 2,
                  }}>
                    {doc.totalPages}pp · {doc.totalChunks} sections · {(doc.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteDoc(doc.id, doc.name)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: '1px solid var(--border)', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, color: 'var(--text-tertiary)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
