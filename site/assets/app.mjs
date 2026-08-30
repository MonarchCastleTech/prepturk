import { CHECKLIST, GUIDANCE, PROVINCES, REVIEW_DATE, SOURCES } from "./data.mjs";

export const STORAGE_KEY = "prepturk-pages-workspace-v1";

export function normalizeTurkish(value = "") {
  return String(value)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("ı", "i");
}

export function filterGuidance(items, query = "", category = "Tümü") {
  const needle = normalizeTurkish(query.trim());
  return items.filter((item) => {
    if (category !== "Tümü" && item.category !== category) return false;
    if (!needle) return true;
    const sourceText = item.sourceIds
      .map((id) => SOURCES.find((source) => source.id === id)?.organization ?? "")
      .join(" ");
    const haystack = normalizeTurkish([
      item.title,
      item.summary,
      item.category,
      item.phase,
      item.steps.join(" "),
      item.keywords.join(" "),
      sourceText,
    ].join(" "));
    return haystack.includes(needle);
  });
}

export function calculateProgress(checked = {}, total = CHECKLIST.length) {
  const completed = CHECKLIST.slice(0, total).filter((item) => checked[item.id] === true).length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function makeExportPayload(state, now = new Date()) {
  const province = PROVINCES.find((item) => item.code === state.provinceCode) ?? PROVINCES[5];
  const progress = calculateProgress(state.checked);
  return {
    schemaVersion: 1,
    application: "PrepTürk Çevrimdışı Hazırlık Alanı",
    exportedAt: now.toISOString(),
    guidanceReviewedAt: REVIEW_DATE,
    province,
    readiness: progress,
    plan: {
      meetingPoint: state.plan?.meetingPoint ?? "",
      backupPoint: state.plan?.backupPoint ?? "",
      contactPlan: state.plan?.contactPlan ?? "",
    },
    checklist: CHECKLIST.map((item) => ({
      id: item.id,
      group: item.group,
      label: item.label,
      completed: state.checked?.[item.id] === true,
    })),
  };
}

const DEFAULT_STATE = Object.freeze({
  provinceCode: "06",
  checked: {},
  plan: { meetingPoint: "", backupPoint: "", contactPlan: "" },
});

function safeState(value) {
  const provinceCode = PROVINCES.some((item) => item.code === value?.provinceCode)
    ? value.provinceCode
    : DEFAULT_STATE.provinceCode;
  const checked = Object.fromEntries(
    CHECKLIST.map((item) => [item.id, value?.checked?.[item.id] === true]),
  );
  return {
    provinceCode,
    checked,
    plan: {
      meetingPoint: String(value?.plan?.meetingPoint ?? "").slice(0, 120),
      backupPoint: String(value?.plan?.backupPoint ?? "").slice(0, 120),
      contactPlan: String(value?.plan?.contactPlan ?? "").slice(0, 400),
    },
  };
}

function readState(storage) {
  try {
    const stored = storage.getItem(STORAGE_KEY);
    return stored ? safeState(JSON.parse(stored)) : safeState(DEFAULT_STATE);
  } catch {
    return safeState(DEFAULT_STATE);
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  }[character]));
}

function init() {
  const storage = window.localStorage;
  let state = readState(storage);
  let selectedCategory = "Tümü";
  let saveTimer;
  let offlineReady = false;

  const elements = {
    categoryFilters: document.querySelector("#category-filters"),
    checklistGroups: document.querySelector("#checklist-groups"),
    connectionLabel: document.querySelector("#connection-label"),
    contactPlan: document.querySelector("#contact-plan"),
    emptyResults: document.querySelector("#empty-results"),
    guidanceGrid: document.querySelector("#guidance-grid"),
    meetingPoint: document.querySelector("#meeting-point"),
    backupPoint: document.querySelector("#backup-point"),
    officialProvince: document.querySelector("#official-province"),
    progressBar: document.querySelector("[role='progressbar']"),
    progressFill: document.querySelector("#progress-fill"),
    provinceCode: document.querySelector("#province-code"),
    provinceName: document.querySelector("#province-name"),
    provinceRegion: document.querySelector("#province-region"),
    provinceSelect: document.querySelector("#province-select"),
    resultCount: document.querySelector("#result-count"),
    saveStatus: document.querySelector("#save-status"),
    scoreDetail: document.querySelector("#score-detail"),
    scoreValue: document.querySelector("#score-value"),
    search: document.querySelector("#guide-search"),
    sourceRows: document.querySelector("#source-rows"),
  };

  const writeState = () => {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      elements.saveStatus.textContent = "Cihaza kaydedildi";
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        elements.saveStatus.textContent = "Yalnızca bu cihazda saklanır";
      }, 1800);
    } catch {
      elements.saveStatus.textContent = "Kaydedilemedi — dışa aktar";
    }
  };

  const renderProgress = () => {
    const progress = calculateProgress(state.checked);
    elements.scoreValue.textContent = `${progress.percent}%`;
    elements.scoreDetail.textContent = `${progress.completed} / ${progress.total} adım tamamlandı`;
    elements.progressFill.style.width = `${progress.percent}%`;
    elements.progressBar.setAttribute("aria-valuenow", String(progress.percent));
  };

  const renderProvince = () => {
    const province = PROVINCES.find((item) => item.code === state.provinceCode) ?? PROVINCES[5];
    elements.provinceCode.textContent = province.code;
    elements.provinceName.textContent = province.name;
    elements.provinceRegion.textContent = `${province.region} Bölgesi`;
    elements.officialProvince.textContent = province.name;
    elements.provinceSelect.value = province.code;
  };

  const renderGuidance = () => {
    const items = filterGuidance(GUIDANCE, elements.search.value, selectedCategory);
    elements.resultCount.textContent = `${items.length} kılavuz`;
    elements.emptyResults.hidden = items.length !== 0;
    elements.guidanceGrid.replaceChildren();

    for (const item of items) {
      const sources = item.sourceIds
        .map((id) => SOURCES.find((source) => source.id === id))
        .filter(Boolean);
      const card = document.createElement("article");
      card.className = "guidance-card";
      card.innerHTML = `
        <div class="card-meta"><span>${escapeHtml(item.category)}</span><span>${escapeHtml(item.phase)}</span></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <details>
          <summary>Adımları aç <span aria-hidden="true">+</span></summary>
          <ol>${item.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </details>
        <div class="card-source">
          <span>${sources.map((source) => escapeHtml(source.organization)).join(" · ")}</span>
          <span>Kontrol ${formatDate(REVIEW_DATE)}</span>
          <a href="#source-${escapeHtml(sources[0].id)}">Kaynağı gör</a>
        </div>`;
      elements.guidanceGrid.append(card);
    }
  };

  const categories = ["Tümü", ...new Set(GUIDANCE.map((item) => item.category))];
  for (const category of categories) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = category;
    button.setAttribute("aria-pressed", String(category === selectedCategory));
    button.addEventListener("click", () => {
      selectedCategory = category;
      for (const filter of elements.categoryFilters.querySelectorAll("button")) {
        filter.setAttribute("aria-pressed", String(filter === button));
      }
      renderGuidance();
    });
    elements.categoryFilters.append(button);
  }

  elements.provinceSelect.innerHTML = PROVINCES.map(
    (province) => `<option value="${province.code}">${province.code} · ${escapeHtml(province.name)}</option>`,
  ).join("");

  const groups = new Map();
  for (const item of CHECKLIST) {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push(item);
  }
  for (const [group, items] of groups) {
    const fieldset = document.createElement("fieldset");
    fieldset.innerHTML = `<legend>${escapeHtml(group)}</legend>`;
    for (const item of items) {
      const label = document.createElement("label");
      label.className = "check-row";
      label.innerHTML = `<input type="checkbox" value="${item.id}"><span>${escapeHtml(item.label)}</span>`;
      const checkbox = label.querySelector("input");
      checkbox.checked = state.checked[item.id] === true;
      checkbox.addEventListener("change", () => {
        state.checked[item.id] = checkbox.checked;
        writeState();
        renderProgress();
      });
      fieldset.append(label);
    }
    elements.checklistGroups.append(fieldset);
  }

  for (const source of SOURCES) {
    const row = document.createElement("tr");
    row.id = `source-${source.id}`;
    row.innerHTML = `
      <td><strong>${escapeHtml(source.organization)}</strong><span>${escapeHtml(source.title)}</span></td>
      <td><time datetime="${source.sourceDate}">${formatDate(source.sourceDate)}</time></td>
      <td><span class="reviewed-badge">Gözden geçirildi</span><time datetime="${source.reviewedAt}">${formatDate(source.reviewedAt)}</time></td>
      <td><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Resmî sayfa ↗</a></td>`;
    elements.sourceRows.append(row);
  }

  elements.meetingPoint.value = state.plan.meetingPoint;
  elements.backupPoint.value = state.plan.backupPoint;
  elements.contactPlan.value = state.plan.contactPlan;

  elements.provinceSelect.addEventListener("change", () => {
    state.provinceCode = elements.provinceSelect.value;
    writeState();
    renderProvince();
  });
  elements.search.addEventListener("input", renderGuidance);

  document.querySelector("#plan-form").addEventListener("input", () => {
    state.plan = {
      meetingPoint: elements.meetingPoint.value,
      backupPoint: elements.backupPoint.value,
      contactPlan: elements.contactPlan.value,
    };
    writeState();
  });

  document.querySelector("#export-button").addEventListener("click", () => {
    const payload = makeExportPayload(state);
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const province = payload.province.name.toLocaleLowerCase("tr-TR").replaceAll(" ", "-");
    anchor.href = url;
    anchor.download = `prepturk-hazirlik-${province}-${payload.exportedAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  });

  document.querySelector("#print-button").addEventListener("click", () => window.print());
  document.querySelector("#reset-button").addEventListener("click", () => {
    if (!window.confirm("Bu cihazdaki PrepTürk planı ve kontrol listesi silinsin mi?")) return;
    state = safeState(DEFAULT_STATE);
    storage.removeItem(STORAGE_KEY);
    window.location.reload();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      elements.search.focus();
    }
  });

  const updateConnectionLabel = () => {
    if (navigator.onLine) {
      elements.connectionLabel.textContent = offlineReady
        ? "Cihaz kaydı etkin · çevrimdışı hazır"
        : "Cihaz kaydı etkin · çevrimiçi";
      return;
    }
    elements.connectionLabel.textContent = offlineReady
      ? "Çevrimdışı · içerik cihazda"
      : "Çevrimdışı · önbellek kontrol ediliyor";
  };
  window.addEventListener("online", updateConnectionLabel);
  window.addEventListener("offline", updateConnectionLabel);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("./sw.js", { scope: "./" });
        await navigator.serviceWorker.ready;
        offlineReady = true;
      } catch {
        offlineReady = false;
      }
      updateConnectionLabel();
    });
  }

  renderProvince();
  renderProgress();
  renderGuidance();
  updateConnectionLabel();
}

if (typeof document !== "undefined") init();
