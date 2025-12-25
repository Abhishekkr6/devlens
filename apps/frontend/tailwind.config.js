/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['var(--font-heading)'],
                body: ['var(--font-body)'],
                sans: ['var(--font-body)'], // Set Inter as the default sans stack
            },
        },
    },
    plugins: [],
}
