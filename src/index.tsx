import { render } from 'preact'
import { App } from './app/index.js'

const root = document.getElementById('root')
if (root === null) throw new Error('Nothing to render into: the shell has no #root.')

render(<App />, root)
