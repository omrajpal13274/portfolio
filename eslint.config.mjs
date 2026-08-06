import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  {
    // `._*` are AppleDouble sidecars: this project lives on an exFAT volume,
    // where Finder writes one next to every file. They are binary, and ESLint
    // otherwise tries to parse them as source.
    ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts", "**/._*"],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;
