import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateProgress,
  filterGuidance,
  makeExportPayload,
  normalizeTurkish,
} from "../../site/assets/app.mjs";
import {
  CHECKLIST,
  GUIDANCE,
  PROVINCES,
  REVIEW_DATE,
  SOURCES,
} from "../../site/assets/data.mjs";

test("province catalogue contains unique official codes 01 through 81", () => {
  assert.equal(PROVINCES.length, 81);
  assert.equal(new Set(PROVINCES.map(({ code }) => code)).size, 81);
  assert.deepEqual(PROVINCES.map(({ code }) => code), Array.from({ length: 81 }, (_, index) => String(index + 1).padStart(2, "0")));
  assert.deepEqual(PROVINCES.find(({ code }) => code === "34"), { code: "34", name: "İstanbul", region: "Marmara" });
});

test("guidance references only declared official sources", () => {
  const sourceIds = new Set(SOURCES.map(({ id }) => id));
  assert.ok(GUIDANCE.length >= 8);
  for (const source of SOURCES) {
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    assert.ok(url.hostname === "turkiye.gov.tr" || url.hostname.endsWith(".gov.tr"));
    assert.equal(source.reviewedAt, REVIEW_DATE);
  }
  for (const item of GUIDANCE) {
    assert.ok(item.steps.length >= 3);
    assert.ok(item.sourceIds.length > 0);
    for (const sourceId of item.sourceIds) assert.ok(sourceIds.has(sourceId));
  }
});

test("search is Turkish-diacritic tolerant and category aware", () => {
  assert.equal(normalizeTurkish("ÇÖK–KAPAN, IĞDIR"), "cok–kapan, igdir");
  assert.deepEqual(filterGuidance(GUIDANCE, "gaz kokusu").map(({ id }) => id), ["deprem-sonrasi"]);
  assert.deepEqual(filterGuidance(GUIDANCE, "cok kapan").map(({ id }) => id), ["deprem-aninda"]);
  assert.ok(filterGuidance(GUIDANCE, "112", "Sağlık").some(({ id }) => id === "ilk-yardim"));
  assert.equal(filterGuidance(GUIDANCE, "deprem", "Sel").length, 0);
});

test("readiness score counts only known true checklist entries", () => {
  const checked = Object.fromEntries(CHECKLIST.slice(0, 3).map(({ id }) => [id, true]));
  checked.unknown = true;
  assert.deepEqual(calculateProgress(checked), { completed: 3, total: 12, percent: 25 });
  assert.deepEqual(calculateProgress({}, 0), { completed: 0, total: 0, percent: 0 });
});

test("export is deterministic and contains no account or secret field", () => {
  const now = new Date("2026-08-30T12:00:00.000Z");
  const payload = makeExportPayload({
    provinceCode: "65",
    checked: { "plan-meeting": true },
    plan: { meetingPoint: "Açık alan", backupPoint: "Okul bahçesi", contactPlan: "SMS" },
  }, now);

  assert.equal(payload.exportedAt, "2026-08-30T12:00:00.000Z");
  assert.equal(payload.province.name, "Van");
  assert.deepEqual(payload.readiness, { completed: 1, total: 12, percent: 8 });
  assert.equal(payload.checklist.length, 12);
  assert.doesNotMatch(JSON.stringify(payload), /password|token|secret|apiKey/i);
});
