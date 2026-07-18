# PrepTürk threat model

Status: active baseline  
Model version: PT-TM-1.0  
Reviewed: 2026-07-18

## Scope and security objective

PrepTürk is a sovereign-first preparedness information system intended to remain useful on a trusted local deployment when upstream connectivity is unavailable. This is a deployment property, not an absolute product claim: `AIRGAP_MODE` disables scheduled outbound ingestion, while host firewall, container-network, DNS and physical-access controls enforce actual isolation.

The security objective is to preserve the confidentiality and integrity of preparedness records while keeping verified guidance available during degraded operations. Availability never overrides authorization, source provenance or safe handling of secrets.

## Protected assets

- **Preparedness data:** plans, notes, inventories, province packs, document metadata and locally generated readiness records.
- **Secrets:** application signing keys, database and Qdrant credentials, TOTP seeds, bearer tokens and encryption material.
- **Uploads:** original files, extracted text, previews, thumbnails and provenance manifests.
- **Logs:** authentication, review, ingestion, scheduler and operational events that may reveal identity, location or system topology.
- **Worker queues:** manifest order, ingestion jobs, retry state, extracted content and vectorisation requests.

## Trust boundaries

1. User browser ↔ reverse proxy/API.
2. Authenticated user ↔ administrator-only user and role management.
3. API ↔ PostgreSQL, Qdrant and local storage.
4. Worker ↔ manifests, uploads, database, Qdrant and local Ollama.
5. Local deployment ↔ any external network.
6. Maintainer workstation ↔ repository, container images and release artifacts.

Public health endpoints disclose only a deterministic capability contract. Preparedness content and ingestion history require an active bearer-token identity; user and role mutations remain administrator-only.

## Threats and mitigations

| Asset or boundary | Threat | Mitigations | Validation |
| --- | --- | --- | --- |
| Preparedness data | Unauthorized reading or modification | Bearer authentication, active-user checks, role-based administrator boundaries, least-privilege database identity | API authentication and governance contract tests |
| Secrets | Default or leaked credentials; accidental logging | Environment injection, production secret rotation, no secret values in capability responses, redact credentials from worker startup logs | Compose review, secret scanning, runtime-contract tests |
| Uploads | Malicious archive/document, parser exploit, path traversal, oversized content | Store outside the web root, canonicalize paths, content/size allowlists, sandbox parsers, retain source hash and quarantine failed files | Adapter tests and pre-release malicious-file fixtures |
| Logs | Tokens, TOTP seeds, locations or document text written to logs | Structured minimal logging, redaction, restricted volume permissions, bounded retention, no request-body logging | Log review and deployment retention policy |
| Worker queues | Duplicate, reordered or poisoned jobs | Sorted manifest discovery, stable job identifiers, `max_instances=1`, coalescing, manifest validation and source hashes | Deterministic worker tests |
| Local services | SSRF or unintended egress through ingestion/model clients | `AIRGAP_MODE=true` by default in Compose for API and worker, local service endpoints, deployment firewall and internal network controls | `docker compose config`, egress-deny deployment test |
| Authentication | Token theft, inactive account reuse, privilege escalation | Short-lived signed tokens, secure cookies in production, TOTP support, active-user enforcement, explicit admin dependency | API authentication suite |
| Availability | Resource exhaustion during emergency use | Upload limits, rate limits, bounded worker concurrency, health/readiness endpoints, offline copies and backups | Load and recovery exercises |
| Supply chain | Compromised dependency or container image | Lockfiles, frozen dependency sync, pinned base/service versions where practical, CI lint/test/build gates | CI-equivalent commands and dependency review |

## Operational mitigations

- Replace every development credential before a non-development deployment.
- Bind user-facing ports only to intended interfaces; do not infer isolation from CSP headers.
- Deny outbound traffic at the host or orchestrator when claiming an air-gapped deployment.
- Encrypt and back up preparedness data according to the operator’s recovery plan.
- Keep uploads and logs on access-controlled volumes with documented retention.
- Review source manifests and hashes before enabling ingestion outside air-gap mode.
- Treat AI output as an unverified aid; source-backed emergency guidance remains authoritative.

## Residual risk

Compromised hosts, malicious administrators, unsafe third-party parsers, physical seizure, stale source material and misconfigured deployment networks remain material risks. Offline operation reduces an attack surface but does not guarantee confidentiality, correctness, availability or safety. Operators must test isolation and recovery in their own environment.

## Security verification gates

- `docker compose config`
- API and worker pytest suites
- Web unit tests, lint and production build
- Deterministic runtime/manifest contracts
- Authentication and administrator-boundary tests
- Release review confirming secrets and sensitive claims are absent
