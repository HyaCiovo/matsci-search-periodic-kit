# matsci-search-periodic-kit

`@gnosys/matsci-search-periodic-kit` 是从 `matsci-ui` 中抽离出来的搜索栏与元素周期表组件包。

它适合以下场景：

- 需要支持化学式、元素列表、化学体系、MPID 等输入方式的材料搜索框
- 需要独立可交互的元素周期表
- 需要“搜索输入 + 周期表选择”组合工作流
- 需要较轻量、样式边界清晰、便于宿主覆盖的 CSS

## 安装

```bash
pnpm add @gnosys/matsci-search-periodic-kit
```

Peer Dependencies：

- `react >=18 <20`
- `react-dom >=18 <20`

## 组件面

稳定的一层对外组件包括：

- `SearchBar`：仅搜索输入框
- `PeriodicTable`：独立元素周期表
- `SearchBarWithPeriodicTable`：搜索输入与周期表组合
- `Tooltip`：独立 Tooltip 原语

如果你需要更细粒度的集成，也可以使用较底层的导出，例如：

- `MaterialsInput`
- `SelectableTable`
- `PeriodicTableModeSwitcher`

## 快速开始

组合搜索 + 周期表：

```tsx
import { useState } from 'react';
import {
  MaterialsInputType,
  PeriodicTableMode,
  SearchBarWithPeriodicTable,
} from '@gnosys/matsci-search-periodic-kit';
import '@gnosys/matsci-search-periodic-kit/style.css';

export function Example() {
  const [value, setValue] = useState('');

  return (
    <SearchBarWithPeriodicTable
      value={value}
      onChange={setValue}
      onSubmit={(_event, nextValue) => {
        console.log('submit', nextValue);
      }}
      periodicTableMode={PeriodicTableMode.TOGGLE}
      allowedInputTypes={[
        MaterialsInputType.FORMULA,
        MaterialsInputType.ELEMENTS,
        MaterialsInputType.CHEMICAL_SYSTEM,
        MaterialsInputType.MPID,
      ]}
      placeholder="搜索材料"
      showTypeDropdown
      showSubmitButton
    />
  );
}
```

仅搜索输入：

```tsx
import { SearchBar } from '@gnosys/matsci-search-periodic-kit/searchbar';
import '@gnosys/matsci-search-periodic-kit/styles/tokens.css';
import '@gnosys/matsci-search-periodic-kit/styles/primitives.css';
import '@gnosys/matsci-search-periodic-kit/styles/searchbar.css';
```

独立周期表：

```tsx
import { useState } from 'react';
import { PeriodicTable } from '@gnosys/matsci-search-periodic-kit/periodic-table';
import { TableLayout } from '@gnosys/matsci-search-periodic-kit/periodic-table';
import '@gnosys/matsci-search-periodic-kit/styles/tokens.css';
import '@gnosys/matsci-search-periodic-kit/styles/primitives.css';
import '@gnosys/matsci-search-periodic-kit/styles/periodic-table.css';

export function PeriodicTableExample() {
  const [enabledElements, setEnabledElements] = useState(['Li', 'Fe', 'O']);

  return (
    <PeriodicTable
      enabledElements={enabledElements}
      forceTableLayout={TableLayout.FULL}
      maxElementSelectable={6}
      onStateChange={(nextState) => {
        setEnabledElements(Array.isArray(nextState) ? nextState : nextState.enabledElements);
      }}
    />
  );
}
```

## 输入模式

常见输入类型：

- `MaterialsInputType.FORMULA`
- `MaterialsInputType.ELEMENTS`
- `MaterialsInputType.CHEMICAL_SYSTEM`
- `MaterialsInputType.MPID`
- `MaterialsInputType.SMILES`
- `MaterialsInputType.MOLECULE_FORMULA`
- `MaterialsInputType.TEXT`

常见周期表交互模式：

- `PeriodicTableMode.NONE`：只显示搜索输入框
- `PeriodicTableMode.TOGGLE`：点击按钮展开/收起周期表
- `PeriodicTableMode.FOCUS`：将周期表作为持续可见的编辑面板

常见周期表布局：

- `TableLayout.FULL`
- `TableLayout.COMPACT`
- `TableLayout.MINI`
- `TableLayout.MAP`

## 样式使用方式

完整样式入口：

```ts
import '@gnosys/matsci-search-periodic-kit/style.css';
```

按需样式入口：

- `@gnosys/matsci-search-periodic-kit/styles/tokens.css`
- `@gnosys/matsci-search-periodic-kit/styles/primitives.css`
- `@gnosys/matsci-search-periodic-kit/styles/searchbar.css`
- `@gnosys/matsci-search-periodic-kit/styles/periodic-table.css`
- `@gnosys/matsci-search-periodic-kit/styles/composite.css`

这个包的设计 token 不会写到全局 `:root`，而是作用在自己的根节点上。你可以在这些选择器上覆盖变量：

- `.msp-theme`
- `.msp-root`
- `.msp-tooltip`

常用覆盖锚点：

- `data-slot="search-shell"`
- `data-slot="periodic-panel"`
- `data-slot="periodic-table"`
- `data-slot="periodic-grid"`
- `data-slot="tooltip"`

宿主样式覆盖示例：

```css
.msp-theme {
  --msp-color-primary: #0f766e;
  --msp-border-radius: 8px;
}

.msp-root [data-slot='periodic-grid'] {
  gap: 3px;
}
```

## 体积与接入建议

如果你希望宿主侧尽量轻量：

- 只用某一个能力时，优先使用子路径导入：
  `@gnosys/matsci-search-periodic-kit/searchbar`、
  `@gnosys/matsci-search-periodic-kit/periodic-table`、
  `@gnosys/matsci-search-periodic-kit/composite`、
  `@gnosys/matsci-search-periodic-kit/tooltip`
- 样式也尽量按最小入口引入，不一定总是使用 `style.css`
- 只有在明确需要较完整组件集时，再用根入口

当前打包结果的主要特征：

- tarball 大小大约 `60 kB`
- 最大的发布模块是周期表数据文件 `dist/data/periodic-table/table-v2.js`
- 这部分体积主要是功能性数据成本，因此实际更有效的优化方式是“按入口按需使用”，而不是在包内部继续做复杂拆分

## 开发命令

常用命令：

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm storybook`
- `pnpm build-storybook`
- `pnpm release:pack`

已经配置了 `prepack`，因此 `npm pack` 和 `npm publish` 时会自动先构建 `dist`，不需要手动先跑一次 `build`。

## 发布

常见发布命令：

```bash
pnpm release:prepare patch
pnpm release:prepare 0.2.0 --notes "Expose Tooltip entry point"
pnpm release:publish
pnpm release minor --notes-file ./release-notes.md
```

`release:prepare` 会做这些事：

- 更新 `package.json` 里的版本号
- 在 `CHANGELOG.md` 顶部插入一条带日期的新版本记录
- 优先使用 `--notes` / `--notes-file`
- 如果没有手写说明，则在可用时退回到 git commit subject 生成 changelog 条目

`release:publish` 会做这些事：

- 运行 `typecheck`、`test`、`build`
- 将当前版本发布到配置好的 `@gnosys` registry
- 使用包目录内的本地 npm cache，避免全局 cache 权限问题
