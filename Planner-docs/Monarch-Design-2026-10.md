# Public design adoption

Approved scope: apply the collection identity to the existing public frontend. Preserve data and functional boundaries. Changed entrypoints, vendored CSS/fonts and source documentation are listed in the Git diff.

Success criteria: one collection header, six working navigation links, readable navy palette, usable desktop/mobile menu, original analytical controls retained.

Validation: node --test site/tests/*.test.mjs — 5 passed; shared CSS/fonts added to the existing offline cache

Risk: product-specific fixed panels and offline caches need to account for the shared header. Adaptations are contained in the shared CSS and the existing PrepTürk cache.
