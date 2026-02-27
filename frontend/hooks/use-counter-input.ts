/**
 * Shared hook for numeric counter input with tap-to-edit behavior.
 * Used by MilkOrderCard, MorningCountRow, and OnOrderRow.
 */
import { useState, useRef, useEffect, useCallback } from "react";

interface UseCounterInputOptions {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
}

export function useCounterInput({
  value,
  onChange,
  max = 999,
  min = 0,
}: UseCounterInputOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value when value changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleIncrement = useCallback(() => {
    onChange(Math.min(value + 1, max));
  }, [value, max, onChange]);

  const handleDecrement = useCallback(() => {
    onChange(Math.max(value - 1, min));
  }, [value, min, onChange]);

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "") {
        setInputValue("");
        return;
      }
      if (/^\d+$/.test(val)) {
        const numValue = parseInt(val, 10);
        if (numValue <= max) {
          setInputValue(val);
        }
      }
    },
    [max]
  );

  const handleInputBlur = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    } else {
      setInputValue(value.toString());
    }
    setIsEditing(false);
  }, [inputValue, min, max, onChange, value]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        inputRef.current?.blur();
      } else if (e.key === "Escape") {
        setInputValue(value.toString());
        setIsEditing(false);
      }
    },
    [value]
  );

  return {
    inputRef,
    inputValue,
    isEditing,
    handleIncrement,
    handleDecrement,
    handleInputFocus,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  };
}
