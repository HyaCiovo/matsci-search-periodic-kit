import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { type CSSProperties, type ReactNode, type RefObject, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface AnchoredPopoverProps {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  matchAnchorWidth?: boolean;
  sideOffset?: number;
}

const EMPTY_STYLE: CSSProperties = {};

export const AnchoredPopover = ({
  anchorRef,
  open,
  onOpenChange,
  className,
  contentClassName,
  children,
  matchAnchorWidth = false,
  sideOffset = 4,
}: AnchoredPopoverProps) => {
  const [contentStyle, setContentStyle] = useState<CSSProperties>(EMPTY_STYLE);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || !matchAnchorWidth) {
      setContentStyle(EMPTY_STYLE);
      return;
    }

    const updateWidth = () => {
      setContentStyle({
        width: `${anchor.getBoundingClientRect().width}px`,
      });
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorRef, matchAnchorWidth, open]);

  if (typeof document === 'undefined' || !anchorRef.current) {
    return null;
  }

  return (
    <Popover.Root modal={false} open={open} onOpenChange={onOpenChange}>
      {createPortal(
        <Popover.Anchor asChild>
          <span aria-hidden="true" className="ms-overlay-anchor" />
        </Popover.Anchor>,
        anchorRef.current
      )}
      <Popover.Portal>
        <Popover.Content
          className={clsx(className)}
          align="start"
          collisionPadding={8}
          side="bottom"
          sideOffset={sideOffset}
          style={contentStyle}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className={clsx(contentClassName)} role="presentation">
            {children}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
