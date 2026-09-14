// This file will be run before each test file
import { afterEach, vi } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';

enableAutoUnmount(afterEach);

import { ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (key: string) => key,
    n: (value: number) => String(value),
    locale: ref('en-US'),
  }),
}));
