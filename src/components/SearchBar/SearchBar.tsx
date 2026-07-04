import {
  MaterialsInput,
  MaterialsInputType,
  PeriodicTableMode,
  type MaterialsInputTypeId,
  type MaterialsInputProps,
} from '../MaterialsInput';

export interface SearchBarProps
  extends Omit<MaterialsInputProps, 'periodicTableMode' | 'hidePeriodicTable'> {
  allowedInputTypes?: MaterialsInputTypeId[];
}

const DEFAULT_ALLOWED_INPUT_TYPES = [
  MaterialsInputType.FORMULA,
  MaterialsInputType.ELEMENTS,
  MaterialsInputType.CHEMICAL_SYSTEM,
  MaterialsInputType.MID,
];

export const SearchBar = ({
  allowedInputTypes = DEFAULT_ALLOWED_INPUT_TYPES,
  showTypeDropdown = true,
  showSubmitButton = true,
  ...props
}: SearchBarProps) => {
  return (
    <MaterialsInput
      {...props}
      allowedInputTypes={allowedInputTypes}
      showTypeDropdown={showTypeDropdown}
      showSubmitButton={showSubmitButton}
      hidePeriodicTable
      periodicTableMode={PeriodicTableMode.NONE}
    />
  );
};
