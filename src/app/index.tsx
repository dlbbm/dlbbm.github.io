import { Redirect, Route, Switch } from 'wouter-preact'
import { routePatterns, routeUrl } from '../../routes/index.js'

// Every route resolves and none of them shows anything yet. What a post looks like is the
// next decision, and guessing it here would mean building it twice.
function Nothing (): null {
  return null
}

export function App () {
  return <Switch>
    <Route path={routeUrl('page', { page: 1 })}><Redirect to={routePatterns.home} replace /></Route>
    <Route path={routePatterns.home} component={Nothing} />
    <Route path={routePatterns.page} component={Nothing} />
    <Route path={routePatterns.posts} component={Nothing} />
    <Route path={routePatterns.post} component={Nothing} />
    <Route path={routePatterns.artists} component={Nothing} />
    <Route path={routePatterns.artist} component={Nothing} />
    <Route path={routePatterns.about} component={Nothing} />
    <Route component={Nothing} />
  </Switch>
}
