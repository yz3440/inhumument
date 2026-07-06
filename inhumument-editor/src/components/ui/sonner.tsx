import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast !border !border-border !bg-background !text-foreground !rounded-none font-sans !text-[12px] !shadow-none',
          description: 'group-[.toast]:!text-muted-foreground',
          actionButton:
            'group-[.toast]:!bg-transparent group-[.toast]:!text-primary group-[.toast]:!rounded-none group-[.toast]:hover:!underline',
          cancelButton:
            'group-[.toast]:!bg-transparent group-[.toast]:!text-muted-foreground group-[.toast]:!rounded-none group-[.toast]:hover:!text-foreground',
        },
      }}
      {...props}
    />
  );
}
