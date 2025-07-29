/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.{html,js}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
                secondary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
            },
            fontFamily: {
                custom: ["Poppins", "sans-serif"],
            },
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                DEFAULT: '8px',
                md: '12px',
                lg: '16px',
                xl: '24px',
                '2xl': '40px',
                '3xl': '64px',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 3s infinite',
                shimmer: 'shimmer 2s infinite linear',
                fadeIn: 'fadeIn 0.5s ease-in-out',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-100% 0' },
                    '100%': { backgroundPosition: '100% 0' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            boxShadow: {
                'inner-lg': 'inset 0 2px 15px 0 rgba(0, 0, 0, 0.1)',
                'colored': '0 10px 15px -3px rgba(139, 92, 246, 0.3), 0 4px 6px -4px rgba(139, 92, 246, 0.2)',
            },
        },
    },
    plugins: [],
    safelist: [
        'bg-red-500/80',
        'bg-green-500/80',
        'bg-yellow-500/80',
        'bg-blue-500/80',
        'status-success',
        'status-error',
        'status-warning',
    ],
};