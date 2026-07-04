import clsx from 'clsx';
import {
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { mergeTexts } from '../../utils/text';
import {
  PeriodicTableModeSwitcher,
  type PeriodicTableModeSwitcherTexts,
} from '../PeriodicTableModeSwitcher';
import {
  SelectableTable,
  TableLayout,
  type SelectableTableSelectionChange,
  type SelectableTableTexts,
} from '../SelectableTable';
import { type InputHelpItem } from './InputHelp';
import { MaterialsInputBox } from './MaterialsInputBox/MaterialsInputBox';
import {
  arrayToDelimitedString,
  capitalize,
  detectAndValidateInputType,
  getAllowedSelectionModes,
  getMaterialsInputTypeByMappedValue,
  materialsInputTypes,
  MaterialsInputType,
  type MaterialsInputTypeId,
  type MaterialsInputTypeOption,
  type MaterialsInputTypesMap,
  PeriodicTableSelectionMode,
  pluralize,
  resolveMaterialsInputTypes,
  validateChemicalSystem,
  validateInputLength,
  VALID_ELEMENTS,
} from './utils';

export { TableLayout } from '../SelectableTable';

export enum PeriodicTableMode {
  TOGGLE = 'toggle',
  FOCUS = 'focus',
  NONE = 'none',
}

export interface MaterialsInputSharedProps {
  value?: string;
  type?: MaterialsInputTypeId;
  allowedInputTypes?: MaterialsInputTypeId[];
  allowedInputTypeIds?: MaterialsInputTypeId[];
  inputTypeOptions?: MaterialsInputTypeOption[];
  materialIdPrefixes?: string[];
  placeholder?: string;
  errorMessage?: string;
  inputClassName?: string;
  periodicTableToggleIcon?: ReactNode;
  autocompleteFormulaUrl?: string;
  autocompleteApiKey?: string;
  helpItems?: InputHelpItem[];
  maxElementSelectable?: number;
  texts?: Partial<MaterialsInputTexts>;
  onChange?: (value: string) => any;
  onInputTypeChange?: (type: MaterialsInputTypeId) => any;
  onSubmit?: (event: FormEvent | MouseEvent, value?: string, filterProps?: any) => any;
}

export interface MaterialsInputProps extends MaterialsInputSharedProps {
  id?: string;
  setProps?: (value: any) => any;
  className?: string;
  debounce?: number;
  periodicTableMode?: PeriodicTableMode;
  periodicTableLayout?: TableLayout;
  periodicTableDisabled?: boolean;
  hidePeriodicTable?: boolean;
  showTypeDropdown?: boolean;
  showSubmitButton?: boolean;
  submitButtonClicks?: number;
  submitButtonText?: string;
  label?: string;
  hideWildcardButton?: boolean;
  chemicalSystemSelectHelpText?: string;
  elementsSelectHelpText?: string;
  loading?: boolean;
  onPropsChange?: (propsObject: any) => void;
}

const EMPTY_INPUT_TYPE_OPTIONS: MaterialsInputTypeOption[] = [];

const normalizeElementsFromValue = (
  type: MaterialsInputTypeId | null,
  value: string,
  inputTypes: MaterialsInputTypesMap = materialsInputTypes
): string[] => {
  if (!value) {
    return [];
  }

  if (type && inputTypes[type]?.selectionMode) {
    const parsedValue = inputTypes[type]?.validate(value);
    return Array.isArray(parsedValue) ? parsedValue : [];
  }

  return [];
};

let __matsciIdCounter = 0;
const useStableId = (prefix: string) => {
  const idRef = useRef<string>();
  if (!idRef.current) {
    __matsciIdCounter += 1;
    idRef.current = `${prefix}-${__matsciIdCounter}`;
  }
  return idRef.current;
};

const renderPeriodicTableValue = (mode: PeriodicTableSelectionMode, elements: string[]) => {
  if (mode === PeriodicTableSelectionMode.CHEMICAL_SYSTEM) {
    return arrayToDelimitedString(elements, /-/);
  }
  if (mode === PeriodicTableSelectionMode.FORMULA) {
    return elements.join('');
  }
  return arrayToDelimitedString(elements, /,/);
};

const isMaxSelectionValue = (
  type: MaterialsInputTypeId | null,
  value: string,
  maxElementSelectable: number,
  inputTypes: MaterialsInputTypesMap = materialsInputTypes
) => {
  if (!type || !value) {
    return false;
  }

  const parsedValue = inputTypes[type]?.validate(value);
  return Array.isArray(parsedValue) && parsedValue.length === maxElementSelectable;
};

const getSelectionTokens = (
  type: MaterialsInputTypeId,
  value: string,
  inputTypes: MaterialsInputTypesMap = materialsInputTypes
) => {
  const parsedValue = inputTypes[type]?.validate(value);
  const elements = Array.isArray(parsedValue) ? parsedValue : [];
  const wildcards = value.match(/\*/g) ?? [];
  return {
    elements,
    elementsPlusWildcards: wildcards.length > 0 ? [...elements, ...wildcards] : elements,
  };
};

const areElementListsEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const getConvertedValueForInputType = (
  newSelection: MaterialsInputTypeId,
  currentInputType: MaterialsInputTypeId,
  currentInputValue: string,
  inputTypes: MaterialsInputTypesMap = materialsInputTypes
) => {
  if (inputTypes[newSelection]?.isMaterialId || inputTypes[currentInputType]?.isMaterialId) {
    return currentInputValue;
  }

  const { elements, elementsPlusWildcards } = getSelectionTokens(currentInputType, currentInputValue, inputTypes);
  const nextSelectionMode = inputTypes[newSelection]?.selectionMode;
  const currentSelectionMode = inputTypes[currentInputType]?.selectionMode;

  if (nextSelectionMode === PeriodicTableSelectionMode.CHEMICAL_SYSTEM) {
    if (elementsPlusWildcards.length > 1) {
      return arrayToDelimitedString(elementsPlusWildcards, /-/);
    }
    return currentInputValue;
  }

  if (nextSelectionMode === PeriodicTableSelectionMode.ELEMENTS) {
    if (elements.length > 1) {
      return arrayToDelimitedString(elements, /,/);
    }
    return currentInputValue;
  }

  if (
    nextSelectionMode === PeriodicTableSelectionMode.FORMULA &&
    currentSelectionMode !== PeriodicTableSelectionMode.FORMULA
  ) {
    if (elements.length > 1) {
      return elements.join('');
    }
    return currentInputValue;
  }

  if (
    newSelection === MaterialsInputType.MOLECULE_FORMULA &&
    currentInputType !== MaterialsInputType.MOLECULE_FORMULA &&
    elements.length > 1
  ) {
    return arrayToDelimitedString(elements, /\s/);
  }

  return currentInputValue;
};

export interface MaterialsInputTexts {
  showExamplesTooltipText: string;
  hideExamplesTooltipText: string;
  showPeriodicTableTooltipText: string;
  hidePeriodicTableTooltipText: string;
  selectableTable?: Partial<SelectableTableTexts>;
  periodicTableModeSwitcher?: Partial<PeriodicTableModeSwitcherTexts>;
}

const DEFAULT_TEXTS: MaterialsInputTexts = {
  showExamplesTooltipText: 'Show examples',
  hideExamplesTooltipText: 'Hide examples',
  showPeriodicTableTooltipText: 'Show Periodic Table',
  hidePeriodicTableTooltipText: 'Hide Periodic Table',
};

export const MaterialsInput = ({
  value = '',
  errorMessage,
  type = MaterialsInputType.ELEMENTS,
  allowedInputTypes,
  allowedInputTypeIds,
  inputTypeOptions,
  materialIdPrefixes = [],
  onChange = (nextValue) => nextValue,
  maxElementSelectable = 20,
  submitButtonText = 'Search',
  periodicTableMode = PeriodicTableMode.TOGGLE,
  periodicTableLayout = TableLayout.MINI,
  debounce = 0,
  ...otherProps
}: MaterialsInputProps) => {
  const resolvedInputTypeOptions = inputTypeOptions ?? EMPTY_INPUT_TYPE_OPTIONS;
  const inputTypes = useMemo(() => resolveMaterialsInputTypes(resolvedInputTypeOptions), [resolvedInputTypeOptions]);
  const normalizedAllowedInputTypes = allowedInputTypeIds ?? allowedInputTypes ?? [type];
  const props = {
    value,
    type,
    errorMessage: errorMessage ?? 'Invalid input value',
    allowedInputTypes: normalizedAllowedInputTypes,
    allowedInputTypeIds,
    inputTypeOptions: resolvedInputTypeOptions,
    materialIdPrefixes,
    onChange,
    maxElementSelectable,
    submitButtonText,
    periodicTableMode,
    periodicTableLayout,
    debounce,
    ...otherProps,
  };
  const resolvedTexts = mergeTexts(DEFAULT_TEXTS, props.texts);

  const [inputValue, setInputValue] = useState(props.value);
  const [inputType, setInputType] = useState<MaterialsInputTypeId>(props.type);
  const [error, setError] = useState<string | null>(null);
  const [errorTipStayActive, setErrorTipStayActive] = useState(false);
  const [showInputHelp, setShowInputHelp] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [submitButtonClicks, setSubmitButtonClicks] = useState(props.submitButtonClicks ?? 0);
  const [isFocused, setIsFocused] = useState(false);
  const [previousValidValue, setPreviousValidValue] = useState(props.value);
  const [maxElementsReached, setMaxElementsReached] = useState(() =>
    isMaxSelectionValue(props.type, props.value, props.maxElementSelectable, inputTypes)
  );
  const [showPeriodicTable, setShowPeriodicTable] = useState(
    periodicTableMode === PeriodicTableMode.TOGGLE && !props.hidePeriodicTable
  );
  const [selectionMode, setSelectionMode] = useState<PeriodicTableSelectionMode>(
    inputTypes[inputType]?.selectionMode ?? PeriodicTableSelectionMode.ELEMENTS
  );
  const [selectedElements, setSelectedElements] = useState<string[]>(() =>
    normalizeElementsFromValue(type, value)
  );
  const panelInteractionRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = props.id ?? useStableId('materials-input');
  const errorTooltipId = `${baseId}-error-tooltip`;
  const helpTooltipId = `${baseId}-help-tooltip`;
  const periodicToggleTooltipId = `${baseId}-periodic-toggle-tooltip`;
  const debounceTimeoutRef = useRef<number>();

  const hasPeriodicTable = periodicTableMode !== PeriodicTableMode.NONE && !props.hidePeriodicTable;
  const periodicTableDisabled = Boolean(props.periodicTableDisabled);
  const effectiveShowPeriodicTable = hasPeriodicTable && !periodicTableDisabled && showPeriodicTable;
  const hasDynamicInputType = props.allowedInputTypes.length > 1;
  const showTypeDropdown = props.showTypeDropdown && hasDynamicInputType;
  const allowedInputTypeOptions = props.allowedInputTypes
    .map((candidate) => inputTypes[candidate])
    .filter((candidate): candidate is MaterialsInputTypeOption => Boolean(candidate));

  const dropdownOnlyElementsOrChemSys =
    showTypeDropdown &&
    props.allowedInputTypes.length === 2 &&
    props.allowedInputTypes.every((candidate) =>
      candidate === MaterialsInputType.ELEMENTS || candidate === MaterialsInputType.CHEMICAL_SYSTEM
    );

  const typeDropdownOptions = showTypeDropdown
    ? dropdownOnlyElementsOrChemSys
      ? [
          inputTypes[MaterialsInputType.CHEMICAL_SYSTEM]?.elementsOnlyDropdownValue,
          inputTypes[MaterialsInputType.ELEMENTS]?.elementsOnlyDropdownValue,
        ].filter((value): value is string => Boolean(value))
      : allowedInputTypeOptions.map((candidate) => candidate.dropdownValue)
    : [];

  const typeDropdownValue = dropdownOnlyElementsOrChemSys
    ? inputTypes[inputType]?.elementsOnlyDropdownValue
    : inputTypes[inputType]?.dropdownValue;

  const allowedSelectionModes = useMemo(
    () => getAllowedSelectionModes(props.allowedInputTypes, inputTypes),
    [props.allowedInputTypes, inputTypes]
  );
  const periodicTableInputTypeSwitchItems = useMemo(() => {
    const selectableOptions = props.allowedInputTypes
      .map((candidate) => inputTypes[candidate])
      .filter(
        (candidate): candidate is MaterialsInputTypeOption & { selectionMode: PeriodicTableSelectionMode } =>
          Boolean(candidate?.selectionMode)
      );

    if (selectableOptions.length <= allowedSelectionModes.length) {
      return undefined;
    }

    return selectableOptions.map((candidate) => ({
      id: candidate.id,
      label: candidate.elementsOnlyDropdownValue ?? candidate.dropdownValue,
      mode: candidate.selectionMode,
    }));
  }, [allowedSelectionModes.length, inputTypes, props.allowedInputTypes]);
  const callbackProps = useMemo(
    () => ({
      ...props,
      value: inputValue,
      type: inputType,
    }),
    [
      inputType,
      inputValue,
      props.allowedInputTypeIds,
      props.allowedInputTypes,
      props.autocompleteApiKey,
      props.autocompleteFormulaUrl,
      props.className,
      props.chemicalSystemSelectHelpText,
      props.debounce,
      props.elementsSelectHelpText,
      props.errorMessage,
      props.helpItems,
      props.hidePeriodicTable,
      props.hideWildcardButton,
      props.id,
      props.inputClassName,
      props.inputTypeOptions,
      props.label,
      props.loading,
      props.materialIdPrefixes,
      props.maxElementSelectable,
      props.onChange,
      props.onInputTypeChange,
      props.onPropsChange,
      props.onSubmit,
      props.periodicTableMode,
      props.periodicTableToggleIcon,
      props.placeholder,
      props.setProps,
      props.showSubmitButton,
      props.showTypeDropdown,
      props.submitButtonClicks,
      props.submitButtonText,
      props.type,
      props.value,
    ]
  );

  const syncInputState = useCallback(
    (nextValue: string, nextType: MaterialsInputTypeId = inputType) => {
      setError(null);
      setInputValue(nextValue);
      setSelectedElements(normalizeElementsFromValue(nextType, nextValue, inputTypes));
      setPreviousValidValue(nextValue);
      setMaxElementsReached(isMaxSelectionValue(nextType, nextValue, props.maxElementSelectable, inputTypes));
    },
    [inputType, inputTypes, props.maxElementSelectable]
  );

  const applyValidatedValue = useCallback(
    (nextValue: string) => {
      const [detectedType, detectedParsedValue] =
        inputTypes[inputType]?.isMaterialId
          ? [null, null]
          : detectAndValidateInputType(nextValue, props.allowedInputTypes, props.materialIdPrefixes, inputTypes);
      const fallbackType = props.allowedInputTypes.includes(inputType)
        ? inputType
        : props.allowedInputTypes[0] ?? inputType;
      const resolvedType = detectedType ?? fallbackType;
      const parsedValue = detectedParsedValue ?? inputTypes[resolvedType]?.validate(nextValue);
      const validLength = validateInputLength(parsedValue, resolvedType, props.maxElementSelectable, inputTypes);
      const isValid = Boolean((parsedValue && validLength) || !nextValue);
      const reachedMax = Array.isArray(parsedValue) && parsedValue.length === props.maxElementSelectable;

      if (!validLength || (maxElementsReached && !isValid)) {
        setError(null);
        setInputValue(previousValidValue);
        return false;
      }

      if (nextValue && (!parsedValue || !validLength)) {
        // Keep showing what the user typed, but mark it as invalid until it becomes a valid value.
        setInputValue(nextValue);
        setError(props.errorMessage);
        return false;
      }

      if (detectedType) {
        setInputType(detectedType);
        props.onInputTypeChange?.(detectedType);
        const nextSelectionMode = inputTypes[detectedType]?.selectionMode;
        if (nextSelectionMode) {
          setSelectionMode(nextSelectionMode);
        }
      }

      syncInputState(nextValue, resolvedType);
      setMaxElementsReached(reachedMax);
      return true;
    },
    [
      inputType,
      maxElementsReached,
      previousValidValue,
      props.allowedInputTypes,
      props.errorMessage,
      inputTypes,
      props.materialIdPrefixes,
      props.maxElementSelectable,
      props.onInputTypeChange,
      syncInputState,
    ]
  );

  const lastReportedValue = useRef(props.value);
  const lastPropsValue = useRef(props.value);
  const didSyncInitialControlledValue = useRef(false);
  const latestInputValueRef = useRef(inputValue);
  latestInputValueRef.current = inputValue;

  const reportChange = useCallback((valueToReport: string) => {
    lastReportedValue.current = valueToReport;
    callbackPropsRef.current.onChange(valueToReport);
    callbackPropsRef.current.onPropsChange?.(callbackPropsRef.current);
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (!nextValue) {
      setError(null);
      setErrorTipStayActive(false);
      setInputValue('');
      setPreviousValidValue('');
      setMaxElementsReached(false);
      setSelectedElements([]);
      setShowAutocomplete(false);
      setShowInputHelp(Boolean(props.helpItems));
      lastReportedValue.current = '';
      callbackPropsRef.current.onChange('');
      callbackPropsRef.current.onPropsChange?.({
        ...callbackPropsRef.current,
        value: '',
      });
      return;
    }

    applyValidatedValue(nextValue);
  };

  const handleInputFocus = () => {
    setErrorTipStayActive(false);
    setIsFocused(true);
    if (periodicTableMode === PeriodicTableMode.FOCUS) {
      setShowPeriodicTable(true);
    }
  };

  const handleInputBlur = (_event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (!panelInteractionRef.current && periodicTableMode === PeriodicTableMode.FOCUS) {
      setShowPeriodicTable(false);
    } else if (panelInteractionRef.current && periodicTableMode === PeriodicTableMode.FOCUS) {
      window.setTimeout(() => {
        inputRef.current?.focus();
      });
    }
    panelInteractionRef.current = false;
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab' && periodicTableMode === PeriodicTableMode.FOCUS) {
      setShowPeriodicTable(false);
    }
  };

  const convertSelectionToInputType = (
    selectedValue: string | undefined,
    lookupKey: string,
    currentInputType: MaterialsInputTypeId,
    currentInputValue: string
  ) => {
    const newSelection = getMaterialsInputTypeByMappedValue(
      lookupKey,
      selectedValue,
      inputTypes,
      props.allowedInputTypes
    );
    if (!newSelection) {
      return;
    }

    setInputType(newSelection);
    props.onInputTypeChange?.(newSelection);

    const nextValue = getConvertedValueForInputType(newSelection, currentInputType, currentInputValue, inputTypes);
    syncInputState(nextValue, newSelection);
  };

  const switchInputType = (
    nextInputType: MaterialsInputTypeId,
    currentInputType: MaterialsInputTypeId,
    currentInputValue: string
  ) => {
    if (!inputTypes[nextInputType]) {
      return;
    }

    setInputType(nextInputType);
    props.onInputTypeChange?.(nextInputType);

    const nextSelectionMode = inputTypes[nextInputType]?.selectionMode;
    if (nextSelectionMode) {
      setSelectionMode(nextSelectionMode);
    }

    const nextValue = getConvertedValueForInputType(nextInputType, currentInputType, currentInputValue, inputTypes);
    syncInputState(nextValue, nextInputType);
  };

  const handleFormulaButtonClick = (valueToAppend: string) => {
    const nextValue =
      selectionMode === PeriodicTableSelectionMode.CHEMICAL_SYSTEM
        ? inputValue
          ? `${inputValue}${valueToAppend}`
          : valueToAppend.replace(/^-/, '')
        : `${inputValue}${valueToAppend}`;

    syncInputState(nextValue, inputType);
  };

  const handleTableStateChange = useCallback(
    (nextState: SelectableTableSelectionChange | string[]) => {
      const nextElements = Array.isArray(nextState) ? nextState : nextState.enabledElements;
      const wildcards = inputValue.match(/\*/g) ?? [];
      const elementsForRender =
        selectionMode === PeriodicTableSelectionMode.ELEMENTS ||
        selectionMode === PeriodicTableSelectionMode.CHEMICAL_SYSTEM
          ? wildcards.length > 0
            ? [...nextElements, ...wildcards]
            : nextElements
          : nextElements;
      const nextValue = renderPeriodicTableValue(selectionMode, elementsForRender);

      setSelectedElements((current) => (areElementListsEqual(current, nextElements) ? current : nextElements));
      setInputValue((current) => (current === nextValue ? current : nextValue));
      setPreviousValidValue(nextValue);
      setMaxElementsReached(isMaxSelectionValue(inputType, nextValue, props.maxElementSelectable, inputTypes));
      setError(null);
    },
    [inputType, inputTypes, inputValue, props.maxElementSelectable, selectionMode]
  );

  const getNextInputTypeForSelectionMode = (mode: PeriodicTableSelectionMode) => {
    if (inputTypes[inputType]?.selectionMode === mode) {
      return inputType;
    }
    return (
      props.allowedInputTypes.find((candidate) => inputTypes[candidate]?.selectionMode === mode) ??
      inputType
    );
  };

  const handleSubmit = (event: FormEvent | MouseEvent, submittedValue?: string) => {
    event.preventDefault();
    event.stopPropagation();

    if (error) {
      setErrorTipStayActive(true);
      return;
    }

    setShowPeriodicTable(false);
    setShowAutocomplete(false);
    setShowInputHelp(false);
    if (props.setProps) {
      setSubmitButtonClicks((current) => current + 1);
    }
    props.onSubmit?.(event, submittedValue ?? inputValue);
  };

  const callbackPropsRef = useRef(callbackProps);
  useEffect(() => {
    callbackPropsRef.current = callbackProps;
  }, [callbackProps]);

  useEffect(() => {
    window.clearTimeout(debounceTimeoutRef.current);
    const valueToReport = inputValue;
    debounceTimeoutRef.current = window.setTimeout(() => {
      if (
        !error &&
        valueToReport === latestInputValueRef.current &&
        valueToReport !== lastReportedValue.current
      ) {
        reportChange(valueToReport);
      }
    }, callbackProps.debounce);

    return () => window.clearTimeout(debounceTimeoutRef.current);
  }, [callbackProps.debounce, error, inputValue, reportChange]);

  useEffect(() => {
    callbackPropsRef.current.setProps?.({
      ...callbackPropsRef.current,
      submitButtonClicks,
    });
  }, [submitButtonClicks]);

  useEffect(() => {
    if (!didSyncInitialControlledValue.current) {
      didSyncInitialControlledValue.current = true;
      lastPropsValue.current = props.value;
      syncInputState(props.value, props.type);
      lastReportedValue.current = props.value;
      return;
    }

    if (props.value !== lastPropsValue.current) {
      lastPropsValue.current = props.value;
      syncInputState(props.value, props.type);
      lastReportedValue.current = props.value;
    }
  }, [props.type, props.value, syncInputState]);

  useEffect(() => {
    const previousInputType = inputType;
    setInputType(props.type);

    const nextSelectionMode = inputTypes[props.type]?.selectionMode;
    if (hasPeriodicTable && nextSelectionMode) {
      setSelectionMode(nextSelectionMode);
    }

    if (inputValue && previousInputType !== props.type) {
      const nextValue = getConvertedValueForInputType(props.type, previousInputType, inputValue, inputTypes);
      if (nextValue !== inputValue) {
        syncInputState(nextValue, props.type);
      }
    }
  }, [hasPeriodicTable, inputTypes, props.type]);

  useEffect(() => {
    const nextSelectedElements = normalizeElementsFromValue(inputType, inputValue, inputTypes);
    setSelectedElements((current) =>
      current.join('|') === nextSelectedElements.join('|') ? current : nextSelectedElements
    );
  }, [inputType, inputTypes, inputValue]);

  useEffect(() => {
    if (
      inputTypes[inputType]?.selectionMode === PeriodicTableSelectionMode.FORMULA &&
      inputValue &&
      props.autocompleteFormulaUrl &&
      isFocused
    ) {
      setShowAutocomplete(true);
      setShowInputHelp(false);
    } else if (isFocused && !inputValue && props.helpItems) {
      setShowInputHelp(true);
      setShowAutocomplete(false);
    } else {
      setShowAutocomplete(false);
      if (!isFocused) {
        setShowInputHelp(false);
      }
    }
  }, [inputType, inputTypes, inputValue, isFocused, props.autocompleteFormulaUrl, props.helpItems]);

  const disableSubmitButton = !!props.loading || !!error || !inputValue;

  return (
    <div id={props.id} className={clsx('ms-materials-input', 'msp-root', props.className)} data-slot="search-shell">
      {props.showSubmitButton ? (
        <form data-testid="materials-input-form" onSubmit={(event) => handleSubmit(event)}>
          <MaterialsInputBox
            label={props.label}
            showTypeDropdown={showTypeDropdown}
            dropdownOnlyElementsOrChemSys={dropdownOnlyElementsOrChemSys}
            typeDropdownValue={typeDropdownValue}
            typeDropdownOptions={typeDropdownOptions}
            onTypeChange={(value) =>
              convertSelectionToInputType(
                value,
                dropdownOnlyElementsOrChemSys ? 'elementsOnlyDropdownValue' : 'dropdownValue',
                inputType,
                inputValue
              )
            }
            inputRef={inputRef}
            inputValue={inputValue}
            inputType={inputType}
            inputClassName={props.inputClassName}
            placeholder={props.placeholder}
            periodicTableToggleIcon={props.periodicTableToggleIcon}
            onInputChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            autocompleteFormulaUrl={props.autocompleteFormulaUrl}
            autocompleteApiKey={props.autocompleteApiKey}
            showAutocomplete={showAutocomplete}
            onAutocompleteOpenChange={setShowAutocomplete}
            onAutocompleteChange={(nextValue) => {
              inputRef.current?.blur();
              applyValidatedValue(nextValue);
            }}
            onAutocompleteSubmit={props.onSubmit}
            setError={setError}
            helpItems={props.helpItems}
            showInputHelp={showInputHelp}
            onHelpOpenChange={setShowInputHelp}
            onHelpChange={(nextValue) => {
              applyValidatedValue(nextValue);
              setShowInputHelp(false);
            }}
            onHelpToggle={() => setShowInputHelp((current) => !current)}
            helpTooltipId={helpTooltipId}
            showExamplesTooltipText={resolvedTexts.showExamplesTooltipText}
            hideExamplesTooltipText={resolvedTexts.hideExamplesTooltipText}
            error={error}
            errorTipStayActive={errorTipStayActive}
            onErrorMouseOver={() => setErrorTipStayActive(false)}
            errorTooltipId={errorTooltipId}
            periodicTableMode={periodicTableMode}
            hasPeriodicTable={hasPeriodicTable}
            showPeriodicTable={effectiveShowPeriodicTable}
            periodicTableDisabled={periodicTableDisabled}
            onPeriodicToggle={() => {
              if (!periodicTableDisabled) {
                setShowPeriodicTable((current) => !current)
              }
            }}
            periodicToggleTooltipId={periodicToggleTooltipId}
            showPeriodicTableTooltipText={resolvedTexts.showPeriodicTableTooltipText}
            hidePeriodicTableTooltipText={resolvedTexts.hidePeriodicTableTooltipText}
            showSubmitButton={props.showSubmitButton}
            loading={props.loading}
            submitButtonText={props.submitButtonText}
            disableSubmitButton={disableSubmitButton}
          />
        </form>
      ) : (
        <MaterialsInputBox
          inputRef={inputRef}
          inputValue={inputValue}
          inputType={inputType}
          typeDropdownOptions={[]}
          onTypeChange={() => undefined}
          inputClassName={props.inputClassName}
          placeholder={props.placeholder}
          periodicTableToggleIcon={props.periodicTableToggleIcon}
          onInputChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autocompleteFormulaUrl={props.autocompleteFormulaUrl}
          autocompleteApiKey={props.autocompleteApiKey}
          showAutocomplete={showAutocomplete}
          onAutocompleteOpenChange={setShowAutocomplete}
          helpItems={props.helpItems}
          showInputHelp={showInputHelp}
          onHelpOpenChange={setShowInputHelp}
          onHelpChange={(nextValue) => {
            applyValidatedValue(nextValue);
            setShowInputHelp(false);
          }}
          onHelpToggle={() => setShowInputHelp((current) => !current)}
          error={error}
          errorTipStayActive={errorTipStayActive}
          onErrorMouseOver={() => setErrorTipStayActive(false)}
          onAutocompleteChange={(nextValue) => {
            inputRef.current?.blur();
            applyValidatedValue(nextValue);
          }}
          setError={setError}
          helpTooltipId={helpTooltipId}
          showExamplesTooltipText={resolvedTexts.showExamplesTooltipText}
          hideExamplesTooltipText={resolvedTexts.hideExamplesTooltipText}
          errorTooltipId={errorTooltipId}
          periodicTableMode={periodicTableMode}
          hasPeriodicTable={hasPeriodicTable}
          showPeriodicTable={effectiveShowPeriodicTable}
          periodicTableDisabled={periodicTableDisabled}
          onPeriodicToggle={() => undefined}
          periodicToggleTooltipId={periodicToggleTooltipId}
          showPeriodicTableTooltipText={resolvedTexts.showPeriodicTableTooltipText}
          hidePeriodicTableTooltipText={resolvedTexts.hidePeriodicTableTooltipText}
          showSubmitButton={false}
          submitButtonText={props.submitButtonText}
          disableSubmitButton={disableSubmitButton}
        />
      )}

      {hasPeriodicTable ? (
        <div
          data-testid="materials-input-periodic-table"
          className={clsx('ms-materials-input-elements-panel', {
            'ms-is-hidden': !effectiveShowPeriodicTable,
            'ms-mt-3': effectiveShowPeriodicTable,
          })}
          data-slot="periodic-panel"
          aria-hidden={!effectiveShowPeriodicTable}
          onMouseDown={() => {
            panelInteractionRef.current = true;
          }}
        >
          <SelectableTable
            className="ms-box"
            disabled={!effectiveShowPeriodicTable}
            enabledElements={selectedElements}
            maxElementSelectable={
              selectionMode === PeriodicTableSelectionMode.ELEMENTS ? 5 : props.maxElementSelectable
            }
            texts={resolvedTexts.selectableTable}
            forceTableLayout={props.periodicTableLayout}
            hiddenElements={[]}
            onStateChange={handleTableStateChange}
            plugin={
              allowedSelectionModes.length > 0 ? (
                <PeriodicTableModeSwitcher
                  mode={selectionMode}
                  allowedModes={allowedSelectionModes}
                  activeInputType={inputType}
                  inputTypeSwitchItems={periodicTableInputTypeSwitchItems}
                  hideWildcardButton={props.hideWildcardButton}
                  chemicalSystemSelectHelpText={props.chemicalSystemSelectHelpText}
                  elementsSelectHelpText={props.elementsSelectHelpText}
                  texts={resolvedTexts.periodicTableModeSwitcher}
                  onSwitch={(mode) => {
                    setSelectionMode(mode);
                    const nextInputType = getNextInputTypeForSelectionMode(mode);
                    convertSelectionToInputType(
                      inputTypes[nextInputType]?.selectionMode,
                      'selectionMode',
                      inputType,
                      inputValue
                    );
                  }}
                  onInputTypeSwitch={(item) => {
                    switchInputType(item.id, inputType, inputValue);
                  }}
                  onFormulaButtonClick={handleFormulaButtonClick}
                />
              ) : undefined
            }
          />

          {selectionMode === PeriodicTableSelectionMode.CHEMICAL_SYSTEM && props.chemicalSystemSelectHelpText ? (
            <p className="ms-help ms-mt-3">{props.chemicalSystemSelectHelpText}</p>
          ) : null}
          {selectionMode === PeriodicTableSelectionMode.ELEMENTS && props.elementsSelectHelpText ? (
            <p className="ms-help ms-mt-3">{props.elementsSelectHelpText}</p>
          ) : null}
          {selectedElements.length > 0 ? (
            <p className="ms-help ms-mt-3">
              {selectedElements.length} {capitalize(pluralize('element'))} selected
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export { MaterialsInputType, PeriodicTableSelectionMode, validateChemicalSystem };
export type { InputHelpItem, MaterialsInputTypeId, MaterialsInputTypeOption, MaterialsInputTypesMap };
