"use client";

import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

interface TabProps {
  label: string;
  children: ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  children: ReactNode;
}

export function Tabs({ children }: TabsProps) {
  const baseId = useId().replace(/:/g, "-");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<TabProps> =>
      isValidElement(child) && typeof child.props === "object" && child.props !== null && "label" in child.props
  );

  function focusTab(index: number) {
    const clamped = (index + tabs.length) % tabs.length;
    setActiveIndex(clamped);
    tabRefs.current[clamped]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(index - 1);
    }
  }

  if (tabs.length === 0) return null;

  return (
    <div className="my-6">
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700"
      >
        {tabs.map((tab, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={tab.props.label}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={
                selected
                  ? "border-b-2 border-blue-700 dark:border-blue-400 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400"
                  : "border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }
            >
              {tab.props.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.props.label}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== activeIndex}
          className="pt-4"
        >
          {tab.props.children}
        </div>
      ))}
    </div>
  );
}
