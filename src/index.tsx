import { render } from 'preact'
import { Redirect, Route, Switch } from 'wouter-preact'
import * as routes from '../shared/routes/index.js'
import { MainLayout } from './components/MainLayout/index.js'
import { About } from './pages/About/index.js'
import { Artist } from './pages/Artist/index.js'
import { Artists } from './pages/Artists/index.js'
import { Feed } from './pages/Feed/index.js'
import { NotFound } from './pages/NotFound/index.js'
import { Pending } from './pages/Pending/index.js'
import { Post } from './pages/Post/index.js'
import { Posts } from './pages/Posts/index.js'
import './styles/index.css'

function App () {
  return <MainLayout>
    <Switch>
      <Route path={routes.url('page', { page: 1 })}><Redirect to={routes.patterns.home} replace /></Route>
      <Route path={routes.patterns.home}><Feed page={1} /></Route>
      <Route path={routes.patterns.page}>{({ page }) => <Feed page={Number(page)} />}</Route>
      <Route path={routes.patterns.posts} component={Posts} />
      <Route path={routes.patterns.pending} component={Pending} />
      <Route path={routes.patterns.post}>{({ id }) => <Post id={id} />}</Route>
      <Route path={routes.patterns.artists} component={Artists} />
      <Route path={routes.patterns.artist}>{({ slug }) => <Artist slug={slug} />}</Route>
      <Route path={routes.patterns.about} component={About} />
      <Route component={NotFound} />
    </Switch>
  </MainLayout>
}

const root = document.getElementById('root')
if (root === null) throw new Error('Nothing to render into: the shell has no #root.')

render(<App />, root)
