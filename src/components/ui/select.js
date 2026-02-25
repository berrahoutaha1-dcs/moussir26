import * as React from "react";
import * as ReactDOM from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "./utils";

const SelectContext = React.createContext(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

function Select({ value, onValueChange, children, ...props }) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || "");
  const [labels, setLabels] = React.useState({});
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const handleSelect = (val) => {
    setSelectedValue(val);
    setOpen(false);
    if (onValueChange) onValueChange(val);
  };

  const registerLabel = React.useCallback((val, label) => {
    setLabels(prev => {
      if (prev[val] === label) return prev;
      return { ...prev, [val]: label };
    });
  }, []);

  const contextValue = React.useMemo(() => ({
    open,
    setOpen,
    selectedValue,
    onSelect: handleSelect,
    triggerRef,
    registerLabel,
    labels
  }), [open, selectedValue, labels, registerLabel]);

  // Click outside listener to close dropdown
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        // Also check if clicked inside the portal
        const portalContent = document.querySelector('[data-slot="select-content"]');
        if (portalContent && portalContent.contains(event.target)) return;

        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={cn("relative", open && "z-[100]")} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children, placeholder, ...props }) {
  const { open, setOpen, selectedValue, triggerRef, labels } = useSelectContext();

  const displayValue = labels[selectedValue] || selectedValue;

  return (
    <button
      ref={triggerRef}
      type="button"
      data-slot="select-trigger"
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm h-9 whitespace-nowrap transition-[color,box-shadow,border-color] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        selectedValue && "border-green-500 bg-green-50/30 ring-green-500/10",
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <span className="truncate">{selectedValue ? displayValue : (placeholder || "Select...")}</span>
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
    </button>
  );
}

function SelectContent({ className, children, ...props }) {
  const { open, triggerRef } = useSelectContext();
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

  React.useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [open, triggerRef]);

  if (!open) return null;

  const content = (
    <div
      data-slot="select-content"
      className={cn(
        "bg-white text-popover-foreground fixed z-[9999] mt-1 max-h-[160px] overflow-y-auto rounded-md border border-gray-200 shadow-xl custom-scrollbar",
        className,
      )}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`
      }}
      {...props}
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

function SelectItem({ className, children, value, ...props }) {
  const { selectedValue, onSelect, registerLabel } = useSelectContext();
  const isSelected = selectedValue === value;

  React.useEffect(() => {
    if (children && typeof children === 'string') {
      registerLabel(value, children);
    } else if (children) {
      // If children is not a string, we still want to register a label if possible
      // This is a basic implementation, might need refinement for complex children
      registerLabel(value, children.toString());
    }
  }, [value, children, registerLabel]);

  return (
    <div
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        className,
      )}
      onClick={() => {
        onSelect(value);
      }}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
}

function SelectValue({ children }) {
  return <span>{children}</span>;
}

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
};
