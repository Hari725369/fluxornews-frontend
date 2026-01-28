'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useConfig } from '@/contexts/ConfigContext';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
    const { config } = useConfig();
    const enableDarkMode = config?.features?.enableDarkMode ?? true;

    return <NextThemesProvider {...props} forcedTheme={!enableDarkMode ? 'light' : undefined}>{children}</NextThemesProvider>;
}
