/**
 * What every basic takes, whoever it is.
 *
 * `@design-edito/tools` holds the same shapes in `agnostic/@react/types`, which the
 * package does not publish — hence the copy, which the move to `mf-tools` deletes.
 */

/** The optional `className` every component takes, a string or a list of them. */
export type ClassNameProps = {
  className?: string | Array<string | null | undefined>
}
