import { defineConfig, globalIgnores } from "eslint/config";
import next from "@next/eslint-plugin-next";

export default defineConfig([
  globalIgnores(["node_modules", ".next"]),
  {
    plugins: {
      "@next/next": next,
    },
    rules: {
      ...next.configs.recommended.rules,
    },
  },
]);