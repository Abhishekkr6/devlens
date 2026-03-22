/** @type {import('tailwindcss').Config} */
module.exports = {
    // Use selector strategy for manual toggling via data-theme
    darkMode: ['selector', '[data-theme="dark"]'],
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                xs: '480px',
            },
            fontFamily: {
                heading: ['var(--font-heading)'],
                body: ['var(--font-body)'],
                sans: ['var(--font-body)'],
            },
            colors: {
                // Semantic Token Mapping
                background: 'var(--background)',
                surface: 'var(--surface)',
                border: 'var(--border)',
                brand: {
                    DEFAULT: 'var(--brand)',
                    foreground: '#FFFFFF', // Assuming white text on brand button
                },
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',

                // Text Colors (Semantic)
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                },

                // Legacy/Direct Palette Access (if strictly needed per "nested keys" request, though variables cover usage)
                light: {
                    background: '#FFFFFF',
                    surface: '#F8FAFC',
                    text: {
                        primary: '#0A0A0A',
                        secondary: '#6B7280'
                    }
                },
                dark: {
                    background: '#0E1116',
                    surface: '#1A1D23',
                    text: {
                        primary: '#FFFFFF',
                        secondary: '#8B97A5'
                    }
                }
            },
        },
    },
    plugins: [],
}
