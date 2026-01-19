/**
 * Item Name Autocomplete Component
 *
 * Provides autocomplete suggestions for item names by combining:
 * - Existing items in the database (with their codes)
 * - Template suggestions from the item_name_suggestions table
 *
 * Features:
 * - Debounced search (300ms delay)
 * - Mobile-friendly (44px touch targets)
 * - Keyboard navigation support
 * - Shows source of each suggestion (existing vs template)
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { debounce } from '@/lib/utils';
import type { ItemCategory, ItemSuggestion } from '@/types';

interface ItemNameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  category: ItemCategory | '';
  disabled?: boolean;
  autoFocus?: boolean;
  inputClassName?: string;
}

export function ItemNameAutocomplete({
  value,
  onChange,
  category,
  disabled = false,
  autoFocus = false,
  inputClassName,
}: ItemNameAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<ItemSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchItems = useRef(
    debounce(async (query: string, cat: ItemCategory) => {
      if (query.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.searchItemNames({
          q: query,
          category: cat,
          limit: 8,
        });
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  // Trigger search when value or category changes
  useEffect(() => {
    if (!category) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (value.length >= 2) {
      setLoading(true);
      searchItems(value, category as ItemCategory);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    }
  }, [value, category, searchItems]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSelectSuggestion = (suggestion: ItemSuggestion) => {
    onChange(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          id="itemName"
          placeholder="e.g., Vanilla Syrup"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          maxLength={255}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          className={inputClassName}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${suggestion.source}-${index}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`
                w-full px-4 py-3 text-left hover:bg-muted border-b border-border last:border-b-0
                min-h-[44px] flex items-center justify-between
                ${selectedIndex === index ? 'bg-primary/10' : ''}
              `}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  {suggestion.name}
                </span>
                {suggestion.source === 'existing' && suggestion.code && (
                  <span className="ml-2 text-xs font-mono text-muted-foreground">
                    Code: {suggestion.code}
                  </span>
                )}
              </div>
              <div className="ml-2">
                {suggestion.source === 'template' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Suggested
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Existing
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions && !loading && value.length >= 2 && suggestions.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4"
        >
          <p className="text-sm text-muted-foreground text-center">
            No suggestions found. You can still enter any name.
          </p>
        </div>
      )}
    </div>
  );
}
