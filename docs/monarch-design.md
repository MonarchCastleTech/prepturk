# Monarch Castle design 2026.10

This product adopts the shared collection navigation, locally hosted IBM Plex fonts, navy/graphite surfaces, tabular numbers and visible keyboard focus. The responsive Collection menu links to Data, Maps, Signals, Research, Methodology and the free public Keep workspace. Analytical colours keep their existing meaning.

Source: [main design system](https://github.com/MonarchCastleTech/MonarchCastleTech.github.io/tree/main/src/design-system). Vendored assets include a version manifest and SIL OFL font licence. Update them with the main repository's scripts/sync-product-design.mjs, passing the directory containing product clones; the command preserves the application's existing layout and writes the collection shell idempotently.

The data, source links, calculation methods, model outputs and access controls retain their existing boundaries. Full-screen products reserve the shared header's height; PrepTürk also caches the new assets offline. Each product continues to own its own application technology and release workflow.

Validation on 2026-10-02: node --test site/tests/*.test.mjs — 5 passed; shared CSS/fonts added to the existing offline cache

Canonical product: https://monarchcastle.com/prepturk/
