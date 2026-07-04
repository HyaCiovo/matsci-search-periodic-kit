export enum MaterialsInputType {
  ELEMENTS = 'elements',
  CHEMICAL_SYSTEM = 'chemical_system',
  FORMULA = 'formula',
  MID = 'mId',
  SMILES = 'smiles',
  TEXT = 'text',
  MOLECULE_FORMULA = 'molecule_formula',
}

export type MaterialsInputTypeId = MaterialsInputType | (string & {});

export enum PeriodicTableSelectionMode {
  ELEMENTS = 'elements',
  CHEMICAL_SYSTEM = 'chemical_system',
  FORMULA = 'formula',
}

export const VALID_ELEMENTS =
  'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar Kr K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La-Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac-Lr Rf Db Sg Bh Hs Mt Ds Rg Cn La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr'.split(
    ' '
  );

const isElement = (elementStr: string, data = VALID_ELEMENTS) => data.indexOf(elementStr) !== -1;

export const getDelimiter = (input: string): RegExp => {
  const comma = input.match(/,/);
  const hyphen = input.match(/-/);
  const space = input.match(/\s/);

  if (
    comma &&
    comma.index !== undefined &&
    (!hyphen || hyphen.index === undefined || hyphen.index > comma.index) &&
    (!space || space.index === undefined || space.index > comma.index)
  ) {
    return /,/;
  }

  if (
    hyphen &&
    hyphen.index !== undefined &&
    (!comma || comma.index === undefined || comma.index > hyphen.index) &&
    (!space || space.index === undefined || space.index > hyphen.index)
  ) {
    return /-/;
  }

  if (
    space &&
    space.index !== undefined &&
    (!comma || comma.index === undefined || comma.index > space.index) &&
    (!hyphen || hyphen.index === undefined || hyphen.index > space.index)
  ) {
    return /\s/;
  }

  return /,/;
};

export const arrayToDelimitedString = (arr: string[], delimiter: string | RegExp = ',') => {
  let delimiterValue = delimiter.toString();
  if (delimiterValue.includes('s')) {
    delimiterValue = ' ';
  } else if (delimiterValue.startsWith('/')) {
    delimiterValue = delimiterValue.replace(/\//g, '');
  }

  return arr.toString().replace(/,/g, delimiterValue);
};

export const validateElements = (elementStr: string, delimiter?: RegExp): string[] | undefined => {
  const activeDelimiter = delimiter || getDelimiter(elementStr);
  const delimiterString = activeDelimiter.toString();
  let cleanElementsStr = '';

  if (delimiterString === /,/.toString()) {
    cleanElementsStr = elementStr.replace(/and|\s|-|[0-9]/gi, '');
  } else if (delimiterString === /-/.toString()) {
    cleanElementsStr = elementStr.replace(/and|\s|[0-9]/gi, '');
  } else {
    cleanElementsStr = elementStr.replace(/and|,|-|[0-9]/gi, '');
  }

  const unparsedElements = cleanElementsStr.split(activeDelimiter);
  const parsedElements: string[] = [];
  let valid = true;

  unparsedElements.forEach((element) => {
    if (isElement(element)) {
      parsedElements.push(element);
    } else if (element !== '*' && element !== '') {
      valid = false;
    }
  });

  return valid ? parsedElements : undefined;
};

export const validateElementsList = (elementStr: string): string[] | undefined => {
  const delimiter = getDelimiter(elementStr);
  if (delimiter.toString() !== /,/.toString()) {
    return;
  }

  const validatedElements = validateElements(elementStr, delimiter);
  if (validatedElements && validatedElements.length > 5) {
    return;
  }

  return validatedElements;
};

export const validateChemicalSystem = (elementStr: string): string[] | undefined => {
  return validateElements(elementStr, /-/);
};

export const validateFormula = (
  formula: string,
  illegalCharsRegex: RegExp = /([^A-Z]|^)+[a-z]|[^\w()*.]+|\s+/,
  elementsRegex: RegExp = /([A-Z][a-z]*)([\d.]*)/g
): string[] | undefined => {
  try {
    const cleanFormula = formula.replace(/\s+$/, '');
    const illegalChars = cleanFormula.match(illegalCharsRegex);
    if (illegalChars != null) {
      return;
    }

    const elements: string[] = [];
    let match: RegExpExecArray | null = null;
    while ((match = elementsRegex.exec(cleanFormula))) {
      if (!isElement(match[1])) {
        return;
      }
      if (!elements.includes(match[1])) {
        elements.push(match[1]);
      }
    }

    return elements.length > 0 ? elements : undefined;
  } catch {
    return;
  }
};

export const validateMoleculeFormula = (
  formula: string,
  illegalCharsRegex: RegExp = /([^A-Z]|^)+[a-z]|[^\w()*.]+/g,
  elementsRegex: RegExp = /([A-Z][a-z]*)([\d.]*)/g
): string[] | undefined => {
  try {
    const cleanFormula = formula.replace(/\s/g, '');
    if (cleanFormula.match(illegalCharsRegex) != null) {
      return;
    }

    const elements: string[] = [];
    let match: RegExpExecArray | null = null;
    while ((match = elementsRegex.exec(cleanFormula))) {
      if (!isElement(match[1])) {
        return;
      }
      if (!elements.includes(match[1])) {
        elements.push(match[1]);
      }
    }

    return elements.length > 0 ? elements : undefined;
  } catch {
    return;
  }
};

export const validateSmiles = (value: string): string | null => {
  const result = value.trim().match(/^([^J][0-9BCOHNSOPrIFla@+\-[\](\)\\/%=#$]{6,})$/gi);
  return Array.isArray(result) ? value : null;
};

export const validateMID = (value: string): string | null => {
  return value || null;
};

export const matchesMaterialIdPrefix = (value: string, prefixes: string[] = []): boolean => {
  return prefixes.some((prefix) => prefix.length > 0 && value.startsWith(prefix));
};

export const validateInputLength = (
  parsedValue: unknown,
  type: MaterialsInputTypeId | null,
  maxElements?: number,
  inputTypes: MaterialsInputTypesMap = materialsInputTypes
): boolean => {
  switch (type ? inputTypes[type]?.selectionMode : null) {
    case PeriodicTableSelectionMode.CHEMICAL_SYSTEM:
    case PeriodicTableSelectionMode.ELEMENTS:
    case PeriodicTableSelectionMode.FORMULA:
      return !(maxElements && Array.isArray(parsedValue) && parsedValue.length > maxElements);
    default:
      return true;
  }
};

export interface MaterialsInputTypeOption {
  id: MaterialsInputTypeId;
  validate: (value: string) => unknown;
  order?: number;
  selectionMode?: PeriodicTableSelectionMode;
  dropdownValue: string;
  elementsOnlyDropdownValue?: string;
  isMaterialId?: boolean;
}

export type MaterialsInputTypesMap = Record<string, MaterialsInputTypeOption | undefined>;

export const materialsInputTypes: MaterialsInputTypesMap = {
  [MaterialsInputType.MID]: {
    id: MaterialsInputType.MID,
    validate: validateMID,
    order: 1,
    dropdownValue: 'Material ID',
    isMaterialId: true,
  },
  [MaterialsInputType.FORMULA]: {
    id: MaterialsInputType.FORMULA,
    validate: validateFormula,
    order: 2,
    selectionMode: PeriodicTableSelectionMode.FORMULA,
    dropdownValue: 'Formula',
  },
  [MaterialsInputType.CHEMICAL_SYSTEM]: {
    id: MaterialsInputType.CHEMICAL_SYSTEM,
    validate: validateChemicalSystem,
    order: 3,
    selectionMode: PeriodicTableSelectionMode.CHEMICAL_SYSTEM,
    dropdownValue: 'Chemical System',
    elementsOnlyDropdownValue: 'Only',
  },
  [MaterialsInputType.ELEMENTS]: {
    id: MaterialsInputType.ELEMENTS,
    validate: validateElementsList,
    order: 4,
    selectionMode: PeriodicTableSelectionMode.ELEMENTS,
    dropdownValue: 'Elements',
    elementsOnlyDropdownValue: 'At least',
  },
  [MaterialsInputType.MOLECULE_FORMULA]: {
    id: MaterialsInputType.MOLECULE_FORMULA,
    validate: validateMoleculeFormula,
    order: 5,
    dropdownValue: 'Molecule Formula',
  },
  [MaterialsInputType.SMILES]: {
    id: MaterialsInputType.SMILES,
    validate: validateSmiles,
    order: 6,
    dropdownValue: 'SMILES',
  },
  [MaterialsInputType.TEXT]: {
    id: MaterialsInputType.TEXT,
    validate: () => true,
    order: 7,
    dropdownValue: 'Text',
  },
};

export const resolveMaterialsInputTypes = (
  customOptions: MaterialsInputTypeOption[] = []
): MaterialsInputTypesMap => {
  const next: MaterialsInputTypesMap = { ...materialsInputTypes };
  for (const option of customOptions) {
    next[option.id] = option;
  }
  return next;
};

const sortInputTypes = (inputTypes: MaterialsInputTypesMap) => (a: MaterialsInputTypeId, b: MaterialsInputTypeId) => {
  const orderA = inputTypes[a]?.order ?? 0;
  const orderB = inputTypes[b]?.order ?? 0;
  return orderA < orderB ? -1 : orderA > orderB ? 1 : 0;
};

const isMaterialIdInputType = (inputTypes: MaterialsInputTypesMap, type: MaterialsInputTypeId) =>
  type === MaterialsInputType.MID || inputTypes[type]?.isMaterialId === true;

export const detectAndValidateInputType = (
  value: string,
  allowedInputTypes: MaterialsInputTypeId[],
  materialIdPrefixes: string[] = [],
  inputTypes: MaterialsInputTypesMap = materialsInputTypes
): [MaterialsInputTypeId | null, unknown] => {
  if (matchesMaterialIdPrefix(value, materialIdPrefixes)) {
    const materialIdInputType = allowedInputTypes.find((inputType) => isMaterialIdInputType(inputTypes, inputType));
    if (materialIdInputType) {
      return [materialIdInputType, inputTypes[materialIdInputType]?.validate(value) ?? validateMID(value)];
    }
  }

  const sortedAllowedInputTypes = [...allowedInputTypes].sort(sortInputTypes(inputTypes));
  for (const inputType of sortedAllowedInputTypes) {
    if (isMaterialIdInputType(inputTypes, inputType)) {
      continue;
    }

    const parsedValue = inputTypes[inputType]?.validate(value);
    if (parsedValue) {
      return [inputType, parsedValue];
    }
  }
  return [null, null];
};

export const getAllowedSelectionModes = (
  allowedInputTypes: MaterialsInputTypeId[],
  inputTypes: MaterialsInputTypesMap = materialsInputTypes
) => {
  const allowedModes: PeriodicTableSelectionMode[] = [];

  for (const inputType of allowedInputTypes) {
    const selectionMode = inputTypes[inputType]?.selectionMode;
    if (selectionMode && !allowedModes.includes(selectionMode)) {
      allowedModes.push(selectionMode);
    }
  }

  return allowedModes;
};

export const getMaterialsInputTypeByMappedValue = (
  key: string,
  value: unknown,
  inputTypes: MaterialsInputTypesMap = materialsInputTypes,
  allowedInputTypes?: MaterialsInputTypeId[]
) => {
  const candidates = allowedInputTypes ?? Object.keys(inputTypes);
  for (const inputType of candidates) {
    if ((inputTypes[inputType] as Record<string, unknown> | undefined)?.[key] === value) {
      return inputType;
    }
  }
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const pluralize = (noun: string) => {
  const specialNouns: Record<string, string> = {
    battery: 'batteries',
    spectrum: 'spectra',
  };
  return specialNouns[noun] ?? `${noun}s`;
};
