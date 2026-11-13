/**
 * The router's link, carrying `?preview` when the page is in preview.
 *
 * Every internal link in the site goes through this one rather than through
 * `wouter-preact` directly, which is what keeps the parameter on the URL from page to
 * page. A link out of the site is a plain `<a>` and never comes here.
 */

import type { ComponentProps } from 'preact'
import { Link as RouterLink } from 'wouter-preact'
import { previewHref } from '../../utils/preview/index.js'

export function Link ({ href, ...rest }: ComponentProps<typeof RouterLink>): ReturnType<typeof RouterLink> {
  return <RouterLink href={previewHref(href)} {...rest} />
}
