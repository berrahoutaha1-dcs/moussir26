import * as React from "react";
import { cn } from "./utils";

function Tabs({ defaultValue, value, onValueChange, children, className, ...props }) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange: handleTabChange,
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsList({ className, children, activeTab, onTabChange, ...props }) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange,
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsTrigger({ className, value, children, activeTab, onTabChange, ...props }) {
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-card text-foreground border-input"
          : "text-foreground hover:text-foreground",
        className,
      )}
      onClick={() => onTabChange && onTabChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ className, value, children, activeTab, ...props }) {
  if (activeTab !== value) return null;

  return (
    <div
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

