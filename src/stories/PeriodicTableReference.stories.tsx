import clsx from 'clsx';
import { type ComponentType, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PeriodicTable, type PeriodicTableProps } from '../components/PeriodicTable';
import { TableLayout } from '../components/SelectableTable';
import { TABLE_V2 } from '../data/periodic-table/table-v2';
import './periodic-table-reference.css';

const GROUP_NUMBERS = Array.from({ length: 18 }, (_, index) => index + 1);
const PERIOD_NUMBERS = Array.from({ length: 7 }, (_, index) => index + 1);
const POST_118_SYMBOLS = TABLE_V2.filter(
  (element) => typeof element.number === 'number' && element.number > 118
).map((element) => element.symbol);

function PeriodicTableReferenceBars() {
  return (
    <>
      <div className="ms-pt-reference-topbar" aria-hidden="true">
        <div className="ms-pt-reference-topbar-track">
          {GROUP_NUMBERS.map((value) => (
            <span key={value} className="ms-pt-reference-bar-cell">
              {value}
            </span>
          ))}
        </div>
      </div>
      <div className="ms-pt-reference-sidebar" aria-hidden="true">
        <div className="ms-pt-reference-sidebar-track">
          {PERIOD_NUMBERS.map((value) => (
            <span key={value} className="ms-pt-reference-bar-cell">
              {value}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

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
        >
          <PeriodicTableReferenceBars />
        </PeriodicTable>
        <div className="ms-pt-reference-selection">
          {referenceTexts.selectedLabel}: {enabledElements.length > 0 ? enabledElements.join(', ') : referenceTexts.noneLabel}
        </div>
      </div>
    );
  },
};
