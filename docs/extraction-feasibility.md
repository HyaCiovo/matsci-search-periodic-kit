# matsci-ui Search/Periodic Extraction Feasibility

## Conclusion

The extraction is feasible, but the correct boundary is not `SearchUISearchBar` by itself.

`SearchUISearchBar` is only a thin adapter around `MaterialsInput` plus `SearchUI` context. The reusable unit is:

1. `MaterialsInput` as the composite search + periodic-table input
2. `SelectableTable` as the standalone periodic table
3. a thin `SearchBar` wrapper that disables periodic-table behavior

## Current dependency picture

### Periodic table

`SelectableTable` is already mostly self-contained. Its dependency closure is:

- periodic table data
- selection-state helpers
- `mergeTexts`
- optional formula/mode switcher helpers

This is a good extraction target.

### Search bar

The search input stack depends on:

- `MaterialsInput`
- `MaterialsInputBox`
- `FormulaAutocomplete`
- `InputHelp`
- `Input`
- `Dropdown`
- `Tooltip`
- `Formula`
- `http`, `text`, and `formula` utilities
- periodic-table primitives when periodic mode is enabled

That is still a manageable closure, but it means a direct extraction of `SearchUISearchBar` would preserve unnecessary `SearchUI` coupling.

## Recommended package shape

Expose three public components:

- `SearchBar`
- `PeriodicTable`
- `SearchBarWithPeriodicTable`

Keep lower-level exports available for advanced consumers:

- `MaterialsInput`
- `SelectableTable`
- `StandalonePeriodicComponent`
- `PeriodicTableModeSwitcher`
- `PeriodicTableFormulaButtons`
- `TableFilter`

## What this project already prepares

- independent package scaffold
- isolated source copy for the minimal component closure
- dedicated theme entry for these components
- simplified public API surface

## Remaining second-phase work

1. prune unused periodic-table helpers if the public API is narrowed further
2. decide whether formula autocomplete should remain built-in or move behind an adapter prop
3. add Storybook/examples for host-app integration
4. trim theme CSS further if package size becomes a concern
5. optionally add a `SearchUI` adapter package instead of keeping `SearchUI` concerns in this library
