import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '../components/SearchBar';
import { MaterialsInputType } from '../components/MaterialsInput';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  args: {
    placeholder: 'Search by formula, elements, or material ID',
    showTypeDropdown: true,
    showSubmitButton: true,
    allowedInputTypes: [
      MaterialsInputType.FORMULA,
      MaterialsInputType.ELEMENTS,
      MaterialsInputType.CHEMICAL_SYSTEM,
      MaterialsInputType.MPID,
    ],
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ maxWidth: 920 }}>
        <SearchBar
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

export const WithHelpItems: Story = {
  args: {
    helpItems: [
      { label: 'Examples' },
      { label: 'Formula', examples: ['LiFePO4', 'SrTiO3'] },
      { label: 'Elements', examples: ['Li,Fe,O', 'Si,O'] },
      { label: 'Material ID', examples: ['mp-149', 'mp-13'] },
    ],
  },
  render: Basic.render,
};
