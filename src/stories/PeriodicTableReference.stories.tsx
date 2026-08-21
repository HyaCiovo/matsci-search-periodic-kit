import clsx from 'clsx';
import { type ComponentType, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PeriodicTable, type PeriodicTableProps } from '../components/PeriodicTable';
import { TableLayout } from '../components/SelectableTable';
import { TABLE_V2 } from '../data/periodic-table/table-v2';
import './periodic-table-reference.css';

const POST_118_SYMBOLS = TABLE_V2.filter(
  (element) => typeof element.number === 'number' && element.number > 118
).map((element) => element.symbol);

type ReferenceLocale = 'zh-CN' | 'en-US';

interface PeriodicTableReferenceStoryProps extends PeriodicTableProps {
  locale?: ReferenceLocale;
}

const REFERENCE_TEXTS: Record<
  ReferenceLocale,
  {
    selectedLabel: string;
    noneLabel: string;
  }
> = {
  'zh-CN': {
    selectedLabel: '已选元素',
    noneLabel: '无',
  },
  'en-US': {
    selectedLabel: 'Selected',
    noneLabel: 'None',
  },
};

const meta = {
  title: 'Showcase/PeriodicTable Reference Style',
  component: PeriodicTable as ComponentType<PeriodicTableReferenceStoryProps>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    maxElementSelectable: 6,
    forceTableLayout: TableLayout.FULL,
    showAxes: true,
    locale: 'zh-CN',
  },
  argTypes: {
    forceTableLayout: {
      control: false,
    },
    locale: {
      control: 'inline-radio',
      options: ['zh-CN', 'en-US'],
    },
  },
} satisfies Meta<PeriodicTableReferenceStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StyledReference: Story = {
  render: (args) => {
    const locale = args.locale ?? 'zh-CN';
    const { locale: _locale, ...tableArgs } = args;
    const [enabledElements, setEnabledElements] = useState<string[]>(['Li', 'Fe', 'O']);
    const hiddenElements = useMemo(
      () => Array.from(new Set([...(tableArgs.hiddenElements ?? []), ...POST_118_SYMBOLS])),
      [tableArgs.hiddenElements]
    );
    const referenceTexts = REFERENCE_TEXTS[locale];

    return (
      <div className="ms-pt-reference-story-shell" data-locale={locale}>
        <PeriodicTable
          {...tableArgs}
          className={clsx('ms-pt-reference-table', tableArgs.className)}
          forceTableLayout={TableLayout.FULL}
          hiddenElements={hiddenElements}
          enabledElements={enabledElements}
          onStateChange={(nextState) => {
            setEnabledElements(Array.isArray(nextState) ? nextState : nextState.enabledElements);
          }}
        />
        <div className="ms-pt-reference-selection">
          {referenceTexts.selectedLabel}: {enabledElements.length > 0 ? enabledElements.join(', ') : referenceTexts.noneLabel}
        </div>
      </div>
    );
  },
};
