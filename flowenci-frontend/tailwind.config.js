/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97c0a',
                    600: '#ea6c00',
                    700: '#c2570a',
                    800: '#9a3c0e',
                    900: '#7c2d12',
                },
            },
            fontFamily: {
                display: ["'Playfair Display'", 'serif'],
                body: ["'DM Sans'", 'sans-serif'],
            },
        },
    },
    plugins: [],
}
