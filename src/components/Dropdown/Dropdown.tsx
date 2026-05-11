import clsx from 'clsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Children,
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';

export interface DropdownProps {
  id?: string;
  setProps?: (value: any) => any;
  className?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerIcon?: string | ReactNode;
  items?: ReactNode[];
  isArrowless?: boolean;
  isUp?: boolean;
  isRight?: boolean;
  closeOnSelection?: boolean;
  children?: ReactNode;
}

const renderIcon = (triggerIcon?: string | ReactNode) => {
  if (!triggerIcon) {
    return null;
  }

  return typeof triggerIcon === 'string' ? <i className={triggerIcon} /> : triggerIcon;
};

export const Dropdown = ({
  id,
  className,
  triggerLabel,
  triggerClassName = 'ms-button',
  triggerIcon,
  items = [],
  isArrowless = false,
  isUp = false,
  isRight = false,
  closeOnSelection = true,
  children,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const renderedItems = children ? Children.toArray(children) : items;

  return (
    <DropdownMenu.Root modal={false} open={open} onOpenChange={setOpen}>
      <div
        data-testid="ms-dropdown"
        id={id}
        className={clsx('ms-dropdown', className, {
          'ms-is-active': open,
          'ms-is-up': isUp,
          'ms-is-right': isRight,
        })}
      >
        <div className="ms-dropdown-trigger">
          <DropdownMenu.Trigger asChild>
            <button type="button" className={clsx(triggerClassName)} aria-haspopup="menu" aria-expanded={open}>
              {renderIcon(triggerIcon)}
              {triggerLabel ? <span>{triggerLabel}</span> : null}
              {!isArrowless ? (
                <span className="ms-icon">
                  {isUp ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}
                </span>
              ) : null}
            </button>
          </DropdownMenu.Trigger>
        </div>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="ms-dropdown-menu"
            side={isUp ? 'top' : 'bottom'}
            align={isRight ? 'end' : 'start'}
            sideOffset={4}
            collisionPadding={8}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <div className="ms-dropdown-content" role="presentation">
              {renderedItems.map((item, index) => {
                if (typeof item === 'string' || typeof item === 'number') {
                  return (
                    <DropdownMenu.Item
                      key={index}
                      className="ms-dropdown-item"
                      onSelect={(event) => {
                        if (!closeOnSelection) {
                          event.preventDefault();
                        }
                      }}
                    >
                      {item}
                    </DropdownMenu.Item>
                  );
                }

                if (isValidElement(item)) {
                  const menuItem = item as ReactElement<{
                    className?: string;
                    onClick?: (event: MouseEvent<HTMLElement>) => void;
                  }>;
                  const originalClassName = menuItem.props.className;
                  const originalOnClick = menuItem.props.onClick;

                  return (
                    <DropdownMenu.Item
                      key={menuItem.key ?? index}
                      asChild
                      onSelect={(event) => {
                        if (!closeOnSelection) {
                          event.preventDefault();
                        }
                      }}
                    >
                      {cloneElement(menuItem, {
                        className: clsx('ms-dropdown-item', originalClassName),
                        onClick: (event: MouseEvent<HTMLElement>) => {
                          originalOnClick?.(event);
                        },
                      })}
                    </DropdownMenu.Item>
                  );
                }

                return (
                  <DropdownMenu.Item
                    key={index}
                    className="ms-dropdown-item"
                    onSelect={(event) => {
                      if (!closeOnSelection) {
                        event.preventDefault();
                      }
                    }}
                  >
                    {item}
                  </DropdownMenu.Item>
                );
              })}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </div>
    </DropdownMenu.Root>
  );
};
