# matsci-search-periodic-kit

`matsci-search-periodic-kit` is a focused extraction project from `matsci-ui`.

It packages three public surfaces:

- `SearchBar`: a search-only materials input
- `PeriodicTable`: a standalone selectable periodic table
- `SearchBarWithPeriodicTable`: the composite input that combines search and periodic table selection

## Scripts

- `pnpm build`
- `pnpm storybook`
- `pnpm build-storybook`
- `pnpm test`
- `pnpm typecheck`

## Structure

The project is intentionally flatter than the source repository it came from:

- `src/components/` contains publishable and support components in one layer
- `src/data/` contains periodic-table data only
- `src/styles/` contains the full CSS pipeline with no LESS dependency
- `src/stories/` contains Storybook stories for the main public APIs

## Style usage

Import the packaged stylesheet once in the host application:

```ts
import '@hyacinth/matsci-search-periodic-kit/style.css';
```

## Package exports

```ts
import { SearchBar, PeriodicTable, SearchBarWithPeriodicTable } from '@hyacinth/matsci-search-periodic-kit';
```
