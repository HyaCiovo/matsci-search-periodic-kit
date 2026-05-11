import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PeriodicTable } from '../components/PeriodicTable';
import { TableLayout } from '../components/SelectableTable';

const meta = {
  title: 'Components/PeriodicTable',
  component: PeriodicTable,
  tags: ['autodocs'],
  args: {
    maxElementSelectable: 6,
    forceTableLayout: TableLayout.FULL,
  },
} satisfies Meta<typeof PeriodicTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => {
    const [enabledElements, setEnabledElements] = useState<string[]>(['Li', 'Fe', 'O']);
    const minWidth =
      args.forceTableLayout === TableLayout.COMPACT
        ? 18 * 42 + 17 * 4
        : args.forceTableLayout === TableLayout.MINI
          ? 18 * 25 + 17 * 2
          : 18 * 62 + 17 * 6;

    return (
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ minWidth }}>
          <PeriodicTable
            {...args}
            enabledElements={enabledElements}
            onStateChange={(nextState) => {
              setEnabledElements(Array.isArray(nextState) ? nextState : nextState.enabledElements);
            }}
          />
        </div>
        <div style={{ marginTop: 16, fontSize: 14 }}>
          Selected: {enabledElements.length > 0 ? enabledElements.join(', ') : 'None'}
        </div>
      </div>
    );
  },
};

export const Compact: Story = {
  args: {
    forceTableLayout: TableLayout.COMPACT,
  },
  render: Interactive.render,
};
