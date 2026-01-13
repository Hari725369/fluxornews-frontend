import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Editorial Primary Red
                primary: {
                    DEFAULT: '#D02C5A', // User specified primary
                    50: '#FDF2F4',
                    100: '#FCE7EB',
                    200: '#F9C6D1',
                    300: '#F494A9',
                    400: '#E85579',
                    500: '#D02C5A', // Main brand color
                    600: '#B91946',
                    700: '#990F35',
                    800: '#7D0F2E',
                    900: '#681128',
                    // Dark mode variant
                    dark: '#D02C5A',
                    'dark-hover': '#D02C5A',
                },
                // Semantic Dynamic Colors (Easy to use)
                page: 'var(--bg-primary)',
                surface: 'var(--bg-surface)',
                content: 'var(--text-primary)',
                muted: 'var(--text-muted)',

                // Keep existing for backward compatibility if needed, but the above are preferred
                'editorial-light': {
                    bg: '#FFFFFF',
                    surface: 'var(--neutral-50)',
                    'text-primary': 'var(--text-primary)',
                    'text-secondary': 'var(--text-secondary)',
                    'text-muted': 'var(--neutral-500)',
                    divider: 'var(--neutral-200)',
                    link: 'var(--link-color)',
                },
                'editorial-dark': {
                    bg: 'var(--bg-primary)',
                    surface: 'var(--neutral-50)',
                    'text-primary': 'var(--text-primary)',
                    'text-secondary': 'var(--text-secondary)',
                    'text-muted': 'var(--neutral-500)',
                    divider: 'var(--neutral-200)',
                    link: 'var(--link-color)',
                },
                // Neutral Scale (using CSS variables)
                neutral: {
                    50: 'var(--neutral-50)',
                    100: 'var(--neutral-100)',
                    200: 'var(--neutral-200)',
                    300: 'var(--neutral-300)',
                    400: 'var(--neutral-400)',
                    500: 'var(--neutral-500)',
                    600: 'var(--neutral-600)',
                    700: 'var(--neutral-700)',
                    800: 'var(--neutral-800)',
                    900: 'var(--neutral-900)',
                },
                // Semantic Border Colors
                border: {
                    light: 'var(--border-light)',
                    DEFAULT: 'var(--border-DEFAULT)',
                    strong: 'var(--border-strong)',
                },
            },
            fontFamily: {
                // Primary font (Figtree) - For UI / Body
                sans: ['var(--font-figtree)', 'sans-serif'],
                // Heading font (Noto Serif) - For News Titles
                serif: ['var(--font-noto-serif)', 'serif'],
            },
            fontSize: {
                // Editorial Typography Scale
                'h1-desktop': ['52px', { lineHeight: '1.15', fontWeight: '700' }],
                'h1-mobile': ['36px', { lineHeight: '1.15', fontWeight: '700' }],
                'h2': ['24px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '0.04em' }],
                'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
                'h4': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
                'h5': ['14px', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0.02em' }],
                'h6': ['13px', { lineHeight: '1.5', fontWeight: '500' }],
                'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
                'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
            },
            maxWidth: {
                'content': '1200px',
                'article': '680px',
            },
            spacing: {
                'section': '64px',
                'section-sm': '48px',
            },
        },
    },
    plugins: [],
} satisfies Config;
