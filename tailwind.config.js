/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.{html,js}"],
    theme: {
        extend: {
            colors: {
                primary: "#6366f1",
                secondary: "#10b981",
            },
            fontFamily: {
                custom: ["Poppins", "sans-serif"],
            },
            backdropBlur: {
                extra: "20px",
            },
        },
    },
    plugins: [],
};