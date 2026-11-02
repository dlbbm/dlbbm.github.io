# dlbbm — conventions

Refines the [workspace conventions](../../CLAUDE.md) — the perimeter, the coding style,
the token layer and the theme rules are there and hold here. What the project is, how it
is run and what is left to do are in [`README.md`](./README.md).

## The theme is declared once

This site owns its colors and its fonts and nothing else of the design system. The theme
variables and the five `--ff-*` slots are declared in a single stylesheet, loaded once at
the root, and no component redefines them. A component that needs a different ground
stands in a sub-scope — `.inverted`, `.accented` — rather than naming a color.

## Style lives in CSS, never in the markup

**The token layer's utility classes stay out of the JSX.** A component's markup carries
its own BEM classes, the ones `clss` builds, and nothing else; the styling sits in a
`styles.css` next to it, imported by the component. `.size-6 .fw-900` beside `logo__word`
would be two systems describing one element, and the one in the markup is the one a
stylesheet cannot override.

Nothing is lost by it: `--fs-N`, `--lh-N` and `--gap-N` are variables, so CSS says
everything the classes say. The one thing `.size-N` does on top is set `--fs-current` and
`--lh-current-px` — restate those by hand in the rare place that needs the rhythm unit.

So **no component spells out a color, a font family or a pixel size**, in its markup or
in its stylesheet: it reads a variable. A literal is the one thing that cannot be
re-themed, and re-theming is the whole point of this layer.

**Vertical rhythm is `gap` on the container**, never a margin on the child. The parent
owns the spacing, margins never collapse, and there is no first-or-last exception to
write.

## `basics/` knows nothing

The rule `README.md` states — a basic imports nothing from `shared/` and nothing from
`components/` — extends to the design: a basic names no theme and no sub-scope either. It
reads the token layer and the `--ff-*` and `--*-color` variables it is given, which is
what makes it liftable into `mf-tools` unchanged.

## dlbbm is the pilot, and one section of a larger site

Treat the interface as if this blog were the `dlbbm` section of something much wider,
each section deployed on its own as a standalone site at its own URL. Nothing in the code
says so today, and nothing should be built for it now; it is why the colors and the fonts
are the only things meant to vary, and why a layout decision that could only ever work
for a music blog is worth a second look.

Pilot, too: the small sites to come share this whole interface layer and vary only their
colors and their fonts. So a decision taken here is taken for them, which is the reason
to write a component so it would survive being handed another theme, and the reason a
piece that proves itself here is a candidate for `mf-tools` rather than a local fixture.
