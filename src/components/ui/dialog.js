import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./utils";

function Dialog({ open, onOpenChange, children, ...props }) {
  if (!open) return null;

  return (
    <div
      data-slot="dialog"
      className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
      onClick={() => onOpenChange && onOpenChange(false)}
      {...props}
    >
      <div 
        className="relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

const DialogTrigger = React.forwardRef(({ children, onClick, ...props }, ref) => (
  <div ref={ref} onClick={onClick} {...props}>
    {children}
  </div>
));
DialogTrigger.displayName = "DialogTrigger";

function DialogContent({ className, children, onClose, ...props }) {
  return (
    <div
      data-slot="dialog-content"
      className={cn(
        "modal-container z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 p-0 duration-200 sm:max-w-lg max-h-[90vh] overflow-hidden relative my-auto flex flex-col",
        className,
      )}
      {...props}
    >
      {onClose && (
        <DialogClose onClick={onClose} />
      )}
      <div className="overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function DialogClose({ className, onClick, ...props }) {
  return (
    <button
      className={cn(
        "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};

