import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SearchBarWithPeriodicTable } from '../components/SearchBarWithPeriodicTable';
import { MaterialsInputType, PeriodicTableMode } from '../components/MaterialsInput';

const meta = {
  title: 'Components/SearchBarWithPeriodicTable',
  component: SearchBarWithPeriodicTable,
  tags: ['autodocs'],
  args: {
    periodicTableMode: PeriodicTableMode.TOGGLE,
    placeholder: 'Search materials',
    showTypeDropdown: true,
    showSubmitButton: true,
    allowedInputTypes: [
      MaterialsInputType.FORMULA,
      MaterialsInputType.ELEMENTS,
      MaterialsInputType.CHEMICAL_SYSTEM,
      MaterialsInputType.MID,
    ],
    elementsSelectHelpText: 'Select elements to require at least these species.',
    chemicalSystemSelectHelpText: 'Select elements to restrict the chemical system.',
  },
} satisfies Meta<typeof SearchBarWithPeriodicTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ToggleTable: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ maxWidth: 1120 }}>
        <SearchBarWithPeriodicTable
          {...args}
          value={value}
          onChange={setValue}
          onSubmit={(_event, nextValue) => {
            setValue(nextValue ?? '');
          }}
        />
      </div>
    );
  },
};

export const FocusMode: Story = {
  args: {
    periodicTableMode: PeriodicTableMode.FOCUS,
  },
  render: ToggleTable.render,
};
