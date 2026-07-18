# Nested `prepturk/` tree audit

Audit date: 2026-07-18  
Branch baseline: `origin/master`

## Method

The nested `prepturk/` directory was recursively inventoried with generated folders excluded. Each nested file was mapped to the same relative path at repository root and compared by SHA-256. Repository text files outside the nested directory were then searched for explicit `prepturk/` path references.

## Evidence

- Nested file count: **1**
- Identical root counterpart: **0**
- Different root counterpart: **1**
- Missing root counterpart: **0**

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `apps/web/public/logo.png` | 267,521 | `d81e02a300437b1ddb825f3777bf9196a29a7eab7fe6301aa9da4b6e251eeddf` |
| `prepturk/apps/web/public/logo.png` | 69,943 | `5d2b7fc2c19a9e4031b7596336b2f2e33af22ff13c84c9a5433d42be99940d74` |

The nested asset is therefore not a byte-for-byte duplicate. It is also referenced by active repository tooling:

- `capture_logo.py:19` writes `prepturk/apps/web/public/logo.png`.
- `capture_logo.py:20` reports that same output path.

No build manifest points at the nested asset, but the logo-generation workflow does. Deleting it would remove a non-identical artifact while leaving a live script path unresolved.

## Decision: retain

Retain `prepturk/apps/web/public/logo.png` in this checkpoint. A future cleanup must first redirect or retire `capture_logo.py`, determine which logo is approved, regenerate and visually compare the output, and make deletion in a dedicated asset-governance change.
