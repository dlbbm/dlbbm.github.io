import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { pageNames } from '../../../shared/titles/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import { fetchAbout } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-about')

export function About () {
  const fetched = useFetched(async () => await fetchAbout(), [])
  useDocumentTitle(pageNames.about)

  return <WhenLoaded fetched={fetched} bem={bem}>
    {about => <div class={bem()}>
      {about.paragraphs.map(paragraph => <p class={bem('paragraph')} key={paragraph}>{paragraph}</p>)}
    </div>}
  </WhenLoaded>
}
