import { useEffect } from 'react'

// Sets the page's title and meta description for as long as the page is shown.
export default function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.append(meta)
    }
    meta.content = description
  }, [title, description])
}
