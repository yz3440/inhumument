import * as Tabs from '@radix-ui/react-tabs';

export { Tabs };

export const tabsClasses = {
  list: 'inline-flex w-full items-stretch gap-0 border-b border-border-soft bg-background',
  trigger: [
    'relative flex-1 px-3 py-2',
    'text-[12px] font-medium text-muted-foreground',
    'transition-colors hover:text-foreground',
    'focus-visible:outline-none focus-visible:bg-muted/50',
    'data-[state=active]:text-foreground',
    'data-[state=active]:after:absolute data-[state=active]:after:inset-x-2 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:rounded-full data-[state=active]:after:bg-primary',
  ].join(' '),
  content: 'flex-1 overflow-hidden focus-visible:outline-none',
};
