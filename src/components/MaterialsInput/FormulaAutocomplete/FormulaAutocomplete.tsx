import clsx from 'clsx';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { Formula } from '../../Formula';
import { MaterialsInputType, type MaterialsInputTypeId, validateFormula } from '../utils';
import { fetchJson } from '../../../utils/http';
import { AnchoredPopover } from '../../../internal/AnchoredPopover';

interface FormulaSuggestion {
  formula_pretty: string;
}

interface Props {
  anchorRef: RefObject<HTMLElement | null>;
  value: string;
  inputType?: MaterialsInputTypeId | null;
  apiEndpoint: string;
  apiKey?: string;
  show?: boolean;
  onOpenChange?: (open: boolean) => void;
  onChange?: (value: string) => void;
  onSubmit?: (event: React.FormEvent | React.MouseEvent, value?: string) => void;
  setError?: (value: string | null) => void;
  suggestedLabel?: string;
}

export const FormulaAutocomplete = ({
  anchorRef,
  value,
  inputType,
  apiEndpoint,
  apiKey,
  show,
  onOpenChange,
  onChange,
  onSubmit,
  setError,
  suggestedLabel = 'Suggested formulas',
}: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [formulaSuggestions, setFormulaSuggestions] = useState<FormulaSuggestion[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const shouldFetch =
      inputType === MaterialsInputType.FORMULA &&
      value.length > 0 &&
      !!validateFormula(value) &&
      !value.includes('*');

    if (!shouldFetch) {
      setFormulaSuggestions([]);
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    const controller = new AbortController();
    const cleanValue = value.replace(/\(|\)/g, '');

    fetchJson<{ data?: FormulaSuggestion[] }>(apiEndpoint, {
      params: { formula: cleanValue },
      headers: apiKey ? { 'X-Api-Key': apiKey } : undefined,
      signal: controller.signal,
    })
      .then((result) => {
        if (requestId === requestIdRef.current) {
          setFormulaSuggestions(result.data ?? []);
        }
      })
      .catch(() => {
        if (requestId === requestIdRef.current) {
          setFormulaSuggestions([]);
        }
      });

    return () => controller.abort();
  }, [apiEndpoint, apiKey, inputType, value]);

  useEffect(() => {
    setIsVisible(!!show && formulaSuggestions.length > 0);
  }, [formulaSuggestions.length, show]);

  if (!isVisible) {
    return null;
  }

  return (
    <AnchoredPopover
      anchorRef={anchorRef}
      open={isVisible}
      onOpenChange={(open) => {
        setIsVisible(open);
        onOpenChange?.(open);
      }}
      className={clsx('ms-dropdown-menu', 'ms-autocomplete')}
      contentClassName="ms-dropdown-content"
      matchAnchorWidth
    >
      <div data-testid="materials-input-autocomplete-menu" aria-hidden>
        <div data-testid="materials-input-autocomplete-menu-items">
        <p className="ms-autocomplete-label">{suggestedLabel}</p>
        {formulaSuggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.formula_pretty}-${index}`}
            type="button"
            className="ms-dropdown-item"
            onMouseDown={(event) => {
              event.preventDefault();
              setIsVisible(false);
              onOpenChange?.(false);
              setError?.(null);
              onChange?.(suggestion.formula_pretty);
              onSubmit?.(event, suggestion.formula_pretty);
            }}
          >
            <Formula>{suggestion.formula_pretty}</Formula>
          </button>
        ))}
        </div>
      </div>
    </AnchoredPopover>
  );
};
