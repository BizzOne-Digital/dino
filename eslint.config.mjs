import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
<<<<<<< HEAD
  {
    rules: {
      // Common data-fetch / hydration patterns; refactor incrementally if desired.
      "react-hooks/set-state-in-effect": "off",
    },
  },
=======
>>>>>>> 7fc58c974eb6e57a1188451228042ab63de29fff
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
