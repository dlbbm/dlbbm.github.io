import { useEffect, useState } from 'preact/hooks'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { BuiltAbout } from '../../../shared/types/built.js'
import { fetchAbout } from '../../utils/fetch/index.js'
import './styles.css'

const bem = clss('page-about')

export function About () {
  const [about, setAbout] = useState<BuiltAbout | null>(null)

  useEffect(() => {
    let current = true
    void fetchAbout().then(next => { if (current) setAbout(next) })
    return () => { current = false }
  }, [])

  if (about === null) return <div class={bem(null, 'loading')} />
  return <div class={bem()}>
    {about.paragraphs.map(paragraph => <p class={bem('paragraph')} key={paragraph}>{paragraph}</p>)}
  </div>
}
