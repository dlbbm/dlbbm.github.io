import { render } from 'preact'
import { Redirect, Route, Switch } from 'wouter-preact'
import { routePatterns, routeUrl } from '../routes/index.js'
import { MainLayout } from './layouts/MainLayout/index.js'
import { About } from './pages/About/index.js'
import { Artist } from './pages/Artist/index.js'
import { Artists } from './pages/Artists/index.js'
import { Home } from './pages/Home/index.js'
import { NotFound } from './pages/NotFound/index.js'
import { Post } from './pages/Post/index.js'
import { Posts } from './pages/Posts/index.js'

function App () {
  return <MainLayout>
    <Switch>
      <Route path={routeUrl('page', { page: 1 })}><Redirect to={routePatterns.home} replace /></Route>
      <Route path={routePatterns.home}><Home page={1} /></Route>
      <Route path={routePatterns.page}>{({ page }) => <Home page={Number(page)} />}</Route>
      <Route path={routePatterns.posts} component={Posts} />
      <Route path={routePatterns.post}>{({ id }) => <Post id={id} />}</Route>
      <Route path={routePatterns.artists} component={Artists} />
      <Route path={routePatterns.artist}>{({ slug }) => <Artist slug={slug} />}</Route>
      <Route path={routePatterns.about} component={About} />
      <Route component={NotFound} />
    </Switch>
  </MainLayout>
}

const root = document.getElementById('root')
if (root === null) throw new Error('Nothing to render into: the shell has no #root.')

render(<App />, root)
