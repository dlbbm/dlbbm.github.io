import { type JSX } from 'preact'
import { useState } from 'preact/hooks'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { DateInput } from '@mxfb/tools/components/form-items/DateInput/index.js'
import { Input } from '@mxfb/tools/components/form-items/Input/index.js'
import { Select } from '@mxfb/tools/components/form-items/Select/index.js'
import { Textarea } from '@mxfb/tools/components/form-items/Textarea/index.js'
import * as titles from '../../../shared/titles/index.js'
import { known, useDocumentTitle } from '../../title/index.js'
import './styles.css'

const c = clss('page-comps-demo')

const GENRES = ['Post-punk', 'No wave', 'Minimal synth', 'Industrial', 'Coldwave']

function Toggle ({ label, checked, onToggled }: {
  label: string
  checked: boolean
  onToggled: (checked: boolean) => void
}): JSX.Element {
  return <label class={c('control')}>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => { onToggled(e.currentTarget.checked) }} />
    {label}
  </label>
}

function TextField ({ label, value, onChanged }: {
  label: string
  value: string
  onChanged: (value: string) => void
}): JSX.Element {
  return <label class={c('control')}>
    {label}
    <input
      type="text"
      value={value}
      onChange={e => { onChanged(e.currentTarget.value) }} />
  </label>
}

// A throwaway page, gone before the blog publishes — see shared/routes. Its only job is
// giving the mf-tools form-items a generic look to check them against, not the real tag
// editor UI the dlbbm detour through mf-tools was for.
export function CompsDemo (): JSX.Element {
  useDocumentTitle(known(titles.names.compsDemo))

  const [label, setLabel] = useState('Some label')
  const [errorText, setErrorText] = useState('Something is wrong')
  const [showError, setShowError] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const [selectMultiple, setSelectMultiple] = useState(true)
  const [selectCreatable, setSelectCreatable] = useState(true)
  const [selectSearchable, setSelectSearchable] = useState(true)

  const [dateFreeText, setDateFreeText] = useState(false)

  const sharedProps = {
    label,
    error: showError ? errorText : undefined,
    disabled
  }

  return <div class={c()}>
    <p class={c('intro')}>
      Temporary — a look at the mf-tools form-items against a generic, dlbbm-flavoured
      stylesheet. Gone before the blog publishes.
    </p>

    <div class={c('shared-controls')}>
      <TextField label="label" value={label} onChanged={setLabel} />
      <Toggle label="show error" checked={showError} onToggled={setShowError} />
      <TextField label="error text" value={errorText} onChanged={setErrorText} />
      <Toggle label="disabled" checked={disabled} onToggled={setDisabled} />
    </div>

    <section class={c('section')}>
      <h2 class={c('heading')}>Input</h2>
      <Input {...sharedProps} type="text" placeholder="Type something" />
    </section>

    <section class={c('section')}>
      <h2 class={c('heading')}>Textarea</h2>
      <Textarea {...sharedProps} placeholder="Type something longer" rows={4} />
    </section>

    <section class={c('section')}>
      <h2 class={c('heading')}>Select</h2>
      <div class={c('section-controls')}>
        <Toggle label="multiple" checked={selectMultiple} onToggled={setSelectMultiple} />
        <Toggle label="creatable" checked={selectCreatable} onToggled={setSelectCreatable} />
        <Toggle label="searchable" checked={selectSearchable} onToggled={setSelectSearchable} />
      </div>
      <Select
        {...sharedProps}
        multiple={selectMultiple}
        creatable={selectCreatable}
        searchable={selectSearchable}
        placeholder="Search a genre">
        {GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
      </Select>
    </section>

    <section class={c('section')}>
      <h2 class={c('heading')}>DateInput</h2>
      <div class={c('section-controls')}>
        <Toggle label="free text (try &quot;next thursday&quot;)" checked={dateFreeText} onToggled={setDateFreeText} />
      </div>
      <DateInput {...sharedProps} freeText={dateFreeText} />
    </section>
  </div>
}
