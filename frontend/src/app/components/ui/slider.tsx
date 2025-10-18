"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "src/lib/utils";

interface SliderProps
  extends Omit<
    React.ComponentProps<typeof SliderPrimitive.Root>,
    "value" | "defaultValue" | "onValueChange"
  > {
  value?: number | [number, number];
  defaultValue?: number | [number, number];
  step?: number;
  onValueChange?: (value: number | [number, number]) => void;
  min?: number;
  max?: number;
  className?: string;
}

function Slider({
  className,
  defaultValue,
  value,
  step,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : typeof value === "number"
        ? [value]
        : Array.isArray(defaultValue)
        ? defaultValue
        : typeof defaultValue === "number"
        ? [defaultValue]
        : [min, max],
    [value, defaultValue, min, max]
  );

  const handleValueChange = (vals: number[]) => {
    if (_values.length === 2) {
      onValueChange?.([vals[0], vals[1]]);
    } else {
      onValueChange?.(vals[0]);
    }
  };

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={
        Array.isArray(defaultValue)
          ? defaultValue
          : defaultValue !== undefined
          ? [defaultValue]
          : undefined
      }
      value={
        Array.isArray(value) ? value : value !== undefined ? [value] : undefined
      }
      min={min}
      max={max}
      step={step}
      onValueChange={handleValueChange}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-secondary opacity-70 absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {_values.map((_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
