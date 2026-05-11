import clsx from 'clsx';
import { memo } from 'react';
import type { MatElement } from '../../data/periodic-table/table-v2';
import { PERIODIC_TABLE_ZH_NAMES } from '../../data/periodic-table/names-zh';
import { categoryToClassName } from './selection-state';
import type { SelectableTableLastAction } from './types';

interface PeriodicTableElementButtonProps {
  element: string;
  xpos: number;
  ypos: number;
  detail: MatElement | null;
  enabled: boolean;
  disabled: boolean;
  hidden: boolean;
  interactionDisabled: boolean;
  defaultDisabled: boolean;
  unavailableTitle?: string;
  lastAction?: SelectableTableLastAction;
  onToggle: (element: string) => void;
  onHoverDetail: (element: string | null) => void;
}

function PeriodicTableElementButtonImpl({
  element,
  xpos,
  ypos,
  detail,
  enabled,
  disabled,
  hidden,
  interactionDisabled,
  defaultDisabled,
  unavailableTitle = 'Unavailable in current table',
  lastAction,
  onToggle,
  onHoverDetail,
}: PeriodicTableElementButtonProps) {
  const localizedNameZh = PERIODIC_TABLE_ZH_NAMES[detail?.symbol ?? element];
  const dataGroup = !detail?.hasGroup && typeof detail?.xpos === 'number' ? String(detail.xpos) : undefined;

  if (hidden) {
    return (
      <div
        className={clsx('ms-mat-element', 'ms-hidden', {
          [categoryToClassName(detail?.category ?? detail?.category_2, element)]: true,
          'ms-mat-group': !!detail?.hasGroup,
        })}
        data-element-group={dataGroup}
        data-element-symbol={detail?.symbol ?? element}
        style={{
          gridColumn: xpos,
          gridRow: ypos,
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      data-testid={`periodic-element-${element}`}
      data-element-group={dataGroup}
      data-element-name-en={detail?.name ?? undefined}
      data-element-symbol={detail?.symbol ?? element}
      style={{
        gridColumn: `${xpos}`,
        gridRow: `${ypos}`,
      }}
      className={clsx('ms-mat-element', {
        'ms-enabled': enabled,
        'ms-disabled': disabled,
        'ms-hidden': hidden,
        'ms-default-disabled': defaultDisabled,
        [categoryToClassName(detail?.category ?? detail?.category_2, element)]: true,
        'ms-mat-group': !!detail?.hasGroup,
      })}
      onClick={() => {
        if (!interactionDisabled) {
          onToggle(element);
        }
      }}
      onMouseEnter={() => {
        onHoverDetail(detail?.symbol ?? null);
      }}
      onFocus={() => {
        onHoverDetail(detail?.symbol ?? null);
      }}
      data-last-action={lastAction?.element === element ? lastAction.type : undefined}
      aria-disabled={disabled}
      title={defaultDisabled ? unavailableTitle : undefined}
    >
      {detail ? (
        <>
          <span className="ms-mat-number">{detail.number}</span>
          <span className="ms-mat-symbol">{detail.symbol}</span>
          {localizedNameZh ? <span className="ms-mat-name-zh">{localizedNameZh}</span> : null}
          {detail.name ? <span className="ms-mat-name-en">{detail.name}</span> : null}
        </>
      ) : (
        <span className="ms-mat-symbol">{element}</span>
      )}
    </button>
  );
}

export const PeriodicTableElementButton = memo(PeriodicTableElementButtonImpl);
