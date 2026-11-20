import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import * as titles from '../../../shared/titles/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import * as data from '../../data/index.js'
import { useFetched } from '../../fetched/index.js'
import { known, useDocumentTitle } from '../../title/index.js'
import './styles.css'

const c = clss('page-about')

export function About () {
  const fetched = useFetched(async () => await data.about(), [])
  useDocumentTitle(known(titles.names.about))

  return <WhenLoaded fetched={fetched} c={c}>
    {about => <div class={c()}>
      {about.paragraphs.map(paragraph => <p class={c('paragraph')} key={paragraph}>{paragraph}</p>)}
    </div>}
  </WhenLoaded>
}
