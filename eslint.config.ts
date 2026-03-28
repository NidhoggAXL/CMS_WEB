import { globalIgnores } from "eslint/config"
import {
  defineConfigWithVueTs,
  vueTsConfigs
} from "@vue/eslint-config-typescript"
import pluginVue, { rules } from "eslint-plugin-vue"
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting"
//  导入 skipFormatting 函数，该函数来自 @vue/eslint-config-prettier 包 这个函数用于在 Prettier 格式化过程中跳过某些代码的格式化

// import prettierConfig from "@vue/eslint-config-prettier";
//  导入 prettier 配置模块，该模块来自 @vue/eslint-config-prettier 包 这个配置通常用于与 Vue.js 项目中的 ESLint 集成，确保代码风格的一致性

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"]
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  // prettierConfig,
  skipFormatting,
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
)
