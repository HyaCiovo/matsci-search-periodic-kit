import {
  MaterialsInput,
  MaterialsInputType,
  PeriodicTableMode,
  type MaterialsInputProps,
} from '../MaterialsInput';

export interface SearchBarWithPeriodicTableProps extends Omit<MaterialsInputProps, 'periodicTableMode'> {
  allowedInputTypes?: MaterialsInputType[];
  periodicTableMode?: PeriodicTableMode;
}

const DEFAULT_ALLOWED_INPUT_TYPES = [
  MaterialsInputType.FORMULA,
  MaterialsInputType.ELEMENTS,
  MaterialsInputType.CHEMICAL_SYSTEM,
  MaterialsInputType.MPID,
];

export const SearchBarWithPeriodicTable = ({
  allowedInputTypes = DEFAULT_ALLOWED_INPUT_TYPES,
  periodicTableMode = PeriodicTableMode.TOGGLE,
  showTypeDropdown = true,
  showSubmitButton = true,
  ...props
}: SearchBarWithPeriodicTableProps) => {
  return (
    <MaterialsInput
      {...props}
      allowedInputTypes={allowedInputTypes}
      periodicTableMode={periodicTableMode}
      showTypeDropdown={showTypeDropdown}
      showSubmitButton={showSubmitButton}
    />
  );
};
