import { defineConfig } from 'orval';

export default defineConfig({
  mangadex: {
    input: './mangadex.yaml',
    output: {
      target: './app/composables/mangadex.ts',
      override: {
        mutator: {
          path: './app/utils/axiosInstance.ts',
          name: 'axiosFetch',
        }
      }
    },
  },
});