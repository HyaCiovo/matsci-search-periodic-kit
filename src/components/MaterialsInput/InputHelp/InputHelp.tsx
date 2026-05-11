import clsx from 'clsx';
import type { RefObject } from 'react';
import { AnchoredPopover } from '../../../internal/AnchoredPopover';
export interface InputHelpItem {
  label?: string | null;
  examples?: string[] | null;
}

interface Props {
  anchorRef: RefObject<HTMLElement | null>;
  items: InputHelpItem[];
  show?: boolean;
  onOpenChange?: (open: boolean) => void;
  onChange?: (value: string) => void;
}

export const InputHelp = ({ anchorRef, items, show, onOpenChange, onChange }: Props) => {
  if (!show) {
    return null;
  }

  return (
    <AnchoredPopover
      anchorRef={anchorRef}
      open={Boolean(show)}
      onOpenChange={onOpenChange}
      className={clsx('ms-box ms-input-help-menu')}
      matchAnchorWidth
    >
      <div data-testid="materials-input-help-menu">
      {items.map((item, index) => (
        <div key={`help-item-${index}`}>
          {item.examples ? (
            <div>
              {item.label ? <strong className="ms-mr-2">{item.label}:</strong> : null}
              <div className="ms-tags">
                {item.examples.map((example, exampleIndex) => (
                  <button
                    key={`help-example-${index}-${exampleIndex}`}
                    type="button"
                    className="ms-tag ms-is-medium"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChange?.(example);
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : item.label ? (
            <div className="ms-is-size-7">{item.label}</div>
          ) : null}
        </div>
      ))}
      </div>
    </AnchoredPopover>
  );
};
