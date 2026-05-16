import { useMemo, useState } from 'react';
import { useControllableState } from '../hooks/useControllableState.js';
import type { HeaderProps, HeaderSelectorConfig } from './header.types.js';

type UseHeaderStateOptions = Pick<
  HeaderProps,
  | 'defaultMobileMenuOpen'
  | 'mobileMenuOpen'
  | 'onMobileMenuOpenChange'
  | 'search'
  | 'selectors'
>;

function getDefaultSelectorValues(selectors: HeaderSelectorConfig[] | undefined) {
  return Object.fromEntries(
    (selectors ?? []).map(selector => [
      selector.id,
      selector.value ?? selector.defaultValue ?? selector.options[0]?.id ?? '',
    ]),
  );
}

export function useHeaderState({
  defaultMobileMenuOpen = false,
  mobileMenuOpen,
  onMobileMenuOpenChange,
  search,
  selectors,
}: UseHeaderStateOptions) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useControllableState({
    value: mobileMenuOpen,
    defaultValue: defaultMobileMenuOpen,
    onChange: onMobileMenuOpenChange,
  });

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const defaultScope = search?.defaultScope ?? search?.scope ?? search?.scopes?.[0]?.id ?? 'all';
  const [query, setQuery] = useControllableState({
    value: search?.query,
    defaultValue: search?.defaultQuery ?? '',
  });
  const [scope, setScope] = useControllableState({
    value: search?.scope,
    defaultValue: defaultScope,
  });

  const [selectorValues, setSelectorValues] = useState(() => getDefaultSelectorValues(selectors));

  const resolvedSelectorValues = useMemo(
    () =>
      Object.fromEntries(
        (selectors ?? []).map(selector => [
          selector.id,
          selector.value ?? selectorValues[selector.id] ?? selector.defaultValue ?? selector.options[0]?.id ?? '',
        ]),
      ),
    [selectorValues, selectors],
  );

  const setSelectorValue = (selectorId: string, value: string) => {
    setSelectorValues(currentValues => ({
      ...currentValues,
      [selectorId]: value,
    }));
  };

  return {
    isMobileMenuOpen,
    isMobileSearchOpen,
    query,
    resolvedSelectorValues,
    scope,
    setIsMobileMenuOpen,
    setIsMobileSearchOpen,
    setQuery,
    setScope,
    setSelectorValue,
  };
}
