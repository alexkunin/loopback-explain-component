import {DOCUMENT} from '@angular/common';
import {inject, InjectionToken} from '@angular/core';

export const API_URL = new InjectionToken<string>(
  'API_URL',
  {
    factory(): string {
      const document = inject(DOCUMENT);
      const env: {
        API_URL?: string;
      } = (document.defaultView as any).__ENV;
      return env.API_URL ?? 'http://localhost:3025/api/explain/get';
    },
  },
);
