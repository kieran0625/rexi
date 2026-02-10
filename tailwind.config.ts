import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          light: "hsl(var(--primary-light) / <alpha-value>)",
          dark: "hsl(var(--primary-dark) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          rose: {
            DEFAULT: "hsl(var(--accent-rose) / <alpha-value>)",
            light: "hsl(var(--accent-rose-light) / <alpha-value>)",
            foreground: "hsl(var(--accent-rose-foreground) / <alpha-value>)",
          },
          peach: {
            DEFAULT: "hsl(var(--accent-peach) / <alpha-value>)",
            light: "hsl(var(--accent-peach-light) / <alpha-value>)",
            foreground: "hsl(var(--accent-peach-foreground) / <alpha-value>)",
          },
          purple: {
            DEFAULT: "hsl(var(--accent-purple) / <alpha-value>)",
            light: "hsl(var(--accent-purple-light) / <alpha-value>)",
            foreground: "hsl(var(--accent-purple-foreground) / <alpha-value>)",
          },
          blue: {
            DEFAULT: "hsl(var(--accent-blue) / <alpha-value>)",
            light: "hsl(var(--accent-blue-light) / <alpha-value>)",
            foreground: "hsl(var(--accent-blue-foreground) / <alpha-value>)",
          },
          mint: {
            DEFAULT: "hsl(var(--accent-mint) / <alpha-value>)",
            light: "hsl(var(--accent-mint-light) / <alpha-value>)",
            foreground: "hsl(var(--accent-mint-foreground) / <alpha-value>)",
          },
          orange: {
            DEFAULT: "hsl(var(--accent-orange) / <alpha-value>)",
            light: "hsl(var(--accent-orange-light) / <alpha-value>)",
            foreground: "hsl(var(--accent-orange-foreground) / <alpha-value>)",
          },
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          light: "hsl(var(--success-light) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          light: "hsl(var(--warning-light) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        error: {
          DEFAULT: "hsl(var(--error) / <alpha-value>)",
          light: "hsl(var(--error-light) / <alpha-value>)",
          foreground: "hsl(var(--error-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          light: "hsl(var(--info-light) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        xhs: {
          red: "hsl(var(--primary) / <alpha-value>)",
          hover: "hsl(var(--primary) / <alpha-value>)",
          bg: "hsl(var(--background) / <alpha-value>)",
          text: "hsl(var(--foreground) / <alpha-value>)",
          secondary: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "hsl(var(--border) / <alpha-value>)"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08)',
        'primary-sm': '0 2px 8px hsla(350, 100%, 60%, 0.15)',
        'primary': '0 4px 16px hsla(350, 100%, 60%, 0.2)',
        'primary-lg': '0 8px 32px hsla(350, 100%, 60%, 0.25)',
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
