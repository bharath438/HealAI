/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  safelist: [
    // dynamic mode colors
    "bg-sky-50", "bg-sky-100", "bg-sky-500", "bg-sky-600", "bg-sky-700",
    "text-sky-600", "text-sky-700", "text-sky-800",
    "border-sky-100", "border-sky-200", "hover:bg-sky-700",
    "bg-lime-50", "bg-lime-100", "bg-lime-500", "bg-lime-600", "bg-lime-700",
    "text-lime-600", "text-lime-700", "text-lime-800",
    "border-lime-100", "border-lime-200", "hover:bg-lime-700",
    "bg-amber-50", "bg-amber-100", "bg-amber-500", "bg-amber-600",
    "text-amber-700", "text-amber-800", "border-amber-200",
    "bg-orange-50", "bg-orange-100", "bg-orange-500", "bg-orange-600", "bg-orange-700",
    "text-orange-600", "text-orange-700", "border-orange-200",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
