# Structure Lab — Cross-App Concept Protocol / Draft 0.1

## Purpose
Chemistry Structure Lab, Physics Structure Lab, Learning & Life OS and other subject applications should be able to reference the same ideas without requiring shared login, a central server, or automatic synchronization.

This document is a **design draft**, not an assertion that all linked apps have implemented the protocol.

## Identifiers and namespacing
- Stable concept ID: `chem.hs.2-2.a` or `chem.uni.quantum`. Names are localized; identifiers are not.
- Future subject namespaces: `phys.*`, `math.*`, `bio.*`; never use a translated title as a primary key.
- Existing `chem.hs.2-2.a` remains stable after editorial revisions. An incompatible meaning change requires a new concept ID plus an explicit `supersedes` relation.
- Distinguish **lesson**, **concept**, and **field** identifiers. Current atlas uses two concepts per high-school chapter and university field-level nodes as a first-pass scaffold. University fields are *not* themselves fully specified atomic concepts.

## Relation types
- `prerequisite` — knowledge that helps interpret another idea. It is not a mandatory progression gate.
- `analogy` — structural similarity, with limits recorded in the explanation.
- `contrast` — important differences to avoid conflation.
- `application` — a concept applied to a different context.
- `reinterpret` — a later perspective that changes or refines an earlier understanding.

Every relation has source, target, relation type, short ja/en justification, `provenance`, and (later) optional sources, scope and caveats. The displayed graph may be traversed in both directions, but the semantic relation's stored direction must be respected by inference engines.

## Provenance is mandatory
1. `curated-draft`: authored curriculum link; not yet independently reviewed.
2. `curated-reviewed`: explicitly reviewed by a subject-matter expert with reviewer/date/source record.
3. `learner-hypothesis`: user-originated connection, not certified scientific truth.
4. `learner-reflection`: a dated observation about the user's evolving understanding.

A personal hypothesis must never silently become curated content or train a recommender without explicit permission and validation.

## Interchange
Reference example (illustrative, not yet implemented as a complete endpoint):

```json
{
  "schema": "structure-lab-concepts",
  "schemaVersion": "0.1",
  "sourceApp": "chemistry-structure-lab",
  "concepts": [
    {
      "id": "chem.hs.2-2.a",
      "labels": { "ja": "動的平衡", "en": "Dynamic equilibrium" },
      "references": [{ "app": "chemistry-structure-lab", "chapterId": "2-2" }]
    }
  ],
  "relations": [
    {
      "from": "chem.hs.2-2.a",
      "to": "phys.thermodynamics.equilibrium",
      "type": "analogy",
      "provenance": "curated-draft",
      "explanation": {"ja": "両分野で平衡の概念を比較する。", "en": "Compare equilibrium concepts across domains."}
    }
  ]
}
```

The example's `phys.thermodynamics.equilibrium` ID is **proposed**, not known to exist in the physics app. Cross-app references must be resolved against an installed provider or remain as clearly marked pending links.

## Security and privacy
- Local notes are private by default; no automatic network upload.
- Manual JSON export/import requires `schema` and `schemaVersion` verification, validation of permitted IDs/types, size limits, and explicit consent for overwrites.
- Do not execute user-supplied JSON as code; escape all free-form text.
- Apps must not attempt to read each other's browser localStorage across origins.
- Avoid storing email addresses, API keys, or identity details in concept-note files.

## Learning experience contract
- No mandatory mastery thresholds or forced study order.
- Revisiting a previously read concept is a normal learning event, not evidence of failure.
- A graph route is a way to discover relationships, not a prescription to finish topics in sequence.
- Learners may record a changed understanding and contradictory hypotheses; review and revision should be supported, not automatically erased.

## Development acceptance checks
- Every content node exists, has a stable ID and ja/en labels.
- Every relation resolves to valid endpoints and has a meaningful justification.
- No orphan concepts; disconnected areas are labeled instead of hidden.
- Both languages navigate to the same concept IDs.
- Offline shell caches the data JSON and supports learning without AI.
- Old records are neither modified nor deleted during migration.
- Scientific models disclose assumptions, approximations and limits.
