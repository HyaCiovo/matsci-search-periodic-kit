import { SelectableTable, type SelectableTableProps } from '../SelectableTable';

export interface PeriodicTableProps extends Omit<SelectableTableProps, 'maxElementSelectable'> {
  maxElementSelectable?: number;
}

export const PeriodicTable = ({
  maxElementSelectable = 20,
  ...props
}: PeriodicTableProps) => {
  return <SelectableTable {...props} maxElementSelectable={maxElementSelectable} />;
};
