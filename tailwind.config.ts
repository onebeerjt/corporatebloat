import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.tsx",
    "./components/**/*.tsx"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
