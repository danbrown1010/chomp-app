import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function extractTextFromPDF(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  const totalPages = pdf.numPages

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += `\n[Page ${i}]\n${pageText}\n`
    onProgress?.(`Reading page ${i} of ${totalPages}…`)
  }

  return { text: fullText, totalPages }
}

export function chunkText(text, docId, docName, chunkSize = 800, overlap = 100) {
  const chunks = []
  let start = 0
  let chunkIndex = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const slice = text.slice(start, end)
    const lastPeriod = slice.lastIndexOf('.')

    // Only break at sentence boundary if it falls in the latter 30% of the chunk
    // and leaves enough room to advance past the overlap (prevents stalling).
    const sentenceBreak = lastPeriod > chunkSize * 0.7 ? lastPeriod + 1 : end
    const breakPoint = sentenceBreak > start + overlap + 1 ? sentenceBreak : end

    chunks.push({
      docId,
      docName,
      chunkIndex,
      text: text.slice(start, breakPoint).trim(),
      startChar: start,
    })

    chunkIndex++
    const next = breakPoint - overlap
    // Guarantee forward progress — never let start go backwards or stall
    start = next > start ? next : breakPoint
  }

  return chunks
}
