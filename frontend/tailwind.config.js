/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#ffffff',
                foreground: '#000000',
                primary: {
                    DEFAULT: '#000000',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#f4f4f5',
                    foreground: '#18181b',
                },
                muted: {
                    DEFAULT: '#f4f4f5',
                    foreground: '#71717a',
                },
                accent: {
                    DEFAULT: '#f4f4f5',
                    foreground: '#18181b',
                },
                border: '#e4e4e7',
            },
            borderRadius: {
                lg: '0.5rem',
                md: '0.375rem',
                sm: '0.25rem',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
