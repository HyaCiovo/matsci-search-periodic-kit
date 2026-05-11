import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaterialsInputBox } from './MaterialsInputBox';
import { MaterialsInputType } from '../utils';
import { PeriodicTableMode } from '../MaterialsInput';

describe('MaterialsInputBox', () => {
  it('renders the integrated controls and delegates interactions', async () => {
    const user = userEvent.setup();
    const onTypeChange = vi.fn();
    const onInputChange = vi.fn();
    const onHelpToggle = vi.fn();
    const onPeriodicToggle = vi.fn();

    render(
      <MaterialsInputBox
        label="Search"
        showTypeDropdown
        typeDropdownValue="Only"
        typeDropdownOptions={['Only', 'At Least']}
        onTypeChange={onTypeChange}
        inputRef={{ current: null }}
        inputValue="Li-Fe"
        inputType={MaterialsInputType.CHEMICAL_SYSTEM}
        onInputChange={onInputChange}
        onFocus={() => undefined}
        onBlur={() => undefined}
        onKeyDown={() => undefined}
        onAutocompleteChange={() => undefined}
        setError={() => undefined}
        helpItems={[{ label: 'Examples' }]}
        showInputHelp={false}
        onHelpChange={() => undefined}
        onHelpToggle={onHelpToggle}
        helpTooltipId="help-tooltip"
        showExamplesTooltipText="Show examples"
        hideExamplesTooltipText="Hide examples"
        onErrorMouseOver={() => undefined}
        errorTooltipId="error-tooltip"
        periodicTableMode={PeriodicTableMode.TOGGLE}
        hasPeriodicTable
        showPeriodicTable={false}
        onPeriodicToggle={onPeriodicToggle}
        periodicToggleTooltipId="periodic-tooltip"
        showPeriodicTableTooltipText="Show Periodic Table"
        hidePeriodicTableTooltipText="Hide Periodic Table"
        showSubmitButton
        submitButtonText="Search"
        disableSubmitButton={false}
      />
    );

    expect(screen.getByTestId('materials-input-search-input')).toHaveValue('Li-Fe');

    await user.click(screen.getByRole('button', { name: 'Only' }));
    await user.click(await screen.findByText('At Least'));
    expect(onTypeChange).toHaveBeenCalledWith('At Least');

    fireEvent.change(screen.getByTestId('materials-input-search-input'), {
      target: { value: 'Li-Fe-Co' },
    });
    expect(onInputChange).toHaveBeenCalled();

    expect(screen.queryByTestId('materials-input-clear')).toBeNull();

    fireEvent.click(screen.getByTestId('materials-input-help-button'));
    expect(onHelpToggle).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('materials-input-toggle-button'));
    expect(onPeriodicToggle).toHaveBeenCalled();

    expect(screen.getByTestId('materials-input-submit-button')).toHaveTextContent('Search');
  });

  it('renders a custom periodic table toggle icon when provided', () => {
    render(
      <MaterialsInputBox
        typeDropdownOptions={[]}
        onTypeChange={() => undefined}
        inputRef={{ current: null }}
        inputValue=""
        inputType={MaterialsInputType.ELEMENTS}
        periodicTableToggleIcon={<span data-testid="custom-periodic-icon">PT</span>}
        onInputChange={() => undefined}
        onFocus={() => undefined}
        onBlur={() => undefined}
        onKeyDown={() => undefined}
        onAutocompleteChange={() => undefined}
        setError={() => undefined}
        onHelpChange={() => undefined}
        onHelpToggle={() => undefined}
        helpTooltipId="help-tooltip"
        onErrorMouseOver={() => undefined}
        errorTooltipId="error-tooltip"
        periodicTableMode={PeriodicTableMode.TOGGLE}
        hasPeriodicTable
        showPeriodicTable={false}
        onPeriodicToggle={() => undefined}
        periodicToggleTooltipId="periodic-tooltip"
        showSubmitButton
        submitButtonText="Search"
        disableSubmitButton={false}
      />
    );

    expect(screen.getByTestId('custom-periodic-icon')).toBeInTheDocument();
  });
});
