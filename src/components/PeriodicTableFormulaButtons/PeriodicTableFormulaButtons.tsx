import { Asterisk } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { mergeTexts } from '../../utils/text';

interface Props {
  onClick: (value: string) => void;
  hideWildcardButton?: boolean;
  wildcardTitle?: string;
  wildcardTooltip?: string;
  texts?: Partial<PeriodicTableFormulaButtonsTexts>;
}

export interface PeriodicTableFormulaButtonsTexts {
  wildcardTitle: string;
  wildcardTooltip: string;
}

const DEFAULT_TEXTS: PeriodicTableFormulaButtonsTexts = {
  wildcardTitle: 'Wildcard element',
  wildcardTooltip: 'Wildcard element',
};

export const PeriodicTableFormulaButtons = ({
  onClick,
  hideWildcardButton,
  wildcardTitle,
  wildcardTooltip,
  texts,
}: Props) => {
  const resolvedTexts = mergeTexts(DEFAULT_TEXTS, texts);
  const resolvedWildcardTitle = wildcardTitle ?? resolvedTexts.wildcardTitle;
  const resolvedWildcardTooltip = wildcardTooltip ?? texts?.wildcardTooltip ?? resolvedWildcardTitle;
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')'];

  return (
    <>
      <div className="ms-pt-spacer" />
      {!hideWildcardButton ? (
        <Tooltip
          place="top"
          trigger={
            <button
              type="button"
              className="ms-pt-wildcard-button ms-mat-element"
              onClick={() => onClick('*')}
              title={resolvedWildcardTitle}
            >
              <span className="ms-mat-symbol">
                <Asterisk size={14} strokeWidth={2} />
              </span>
            </button>
          }
        >
          {resolvedWildcardTooltip}
        </Tooltip>
      ) : null}
      {values.map((value) => (
        <button key={value} type="button" className="ms-mat-element" onClick={() => onClick(value)}>
          <span className="ms-mat-symbol">{value}</span>
        </button>
      ))}
    </>
  );
};
