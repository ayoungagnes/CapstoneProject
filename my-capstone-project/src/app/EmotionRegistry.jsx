'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import createEmotionCache from './createEmotionCache';

export default function EmotionRegistry({ children }) {
  // Create cache + tracking on first render
  const [{ cache, flush }] = React.useState(() => {
    const cache = createEmotionCache();
    const prevInsert = cache.insert;
    let inserted = [];

    cache.insert = (...args) => {
      const serialized = args[1];
      if (!cache.inserted[serialized.name]) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    return {
      cache,
      flush: () => {
        const names = inserted.slice();
        inserted = [];
        return names;
      },
    };
  });

  // During SSR, pull out the styles that were rendered and inject them
  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
