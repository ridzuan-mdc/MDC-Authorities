// MDC Authority Platform (Summary-only version, no charts)
const STORAGE_KEY = "mdcAuthorityRecordsV2";

// ===================== PRESET DATA =====================

// Batching plants (fixed rows)
const BATCHING_PLANTS = [
  { id: "SG BULOH", name: "SG BULOH", majlis: "" },
  { id: "TEMPLER", name: "TEMPLER", majlis: "" },
  { id: "SG BUAYA", name: "SG BUAYA", majlis: "" },
  { id: "SELAYANG (CLOSED)", name: "SELAYANG (CLOSED)", majlis: "" },
  { id: "KUNDANG", name: "KUNDANG", majlis: "" },
  { id: "DESA PARK CITY", name: "DESA PARK CITY", majlis: "" },
  { id: "KEMUNING UTAMA 2", name: "KEMUNING UTAMA 2", majlis: "" },
  { id: "KG RASAH", name: "KG RASAH", majlis: "" },
  { id: "SUBANG", name: "SUBANG", majlis: "" },
  { id: "PUNCAK ALAM 5", name: "PUNCAK ALAM 5", majlis: "" },
  { id: "PULAU INDAH 1 & 2", name: "PULAU INDAH 1 & 2", majlis: "" },
  { id: "JERAM", name: "JERAM", majlis: "" },
  { id: "KAPAR", name: "KAPAR", majlis: "" },
  { id: "CHAN SOW LIN 1 & 2", name: "CHAN SOW LIN 1 & 2", majlis: "" },
  { id: "PETALING JAYA", name: "PETALING JAYA", majlis: "" },
  { id: "SEMENYIH", name: "SEMENYIH", majlis: "" },
  { id: "SG LONG", name: "SG LONG", majlis: "" },
  { id: "BALAKONG", name: "BALAKONG", majlis: "" },
  { id: "PULAU MERANTI", name: "PULAU MERANTI", majlis: "" },
  { id: "JENDERAM", name: "JENDERAM", majlis: "" },
  { id: "NILAI", name: "NILAI", majlis: "" },
  { id: "CHENDOR", name: "CHENDOR", majlis: "" },
  { id: "KUANTAN", name: "KUANTAN", majlis: "" },
  { id: "BUKIT RAMBAI", name: "BUKIT RAMBAI", majlis: "" },
  { id: "JASIN", name: "JASIN", majlis: "" },
  { id: "ALOR GAJAH 3", name: "ALOR GAJAH 3", majlis: "" },
  { id: "KULAI", name: "KULAI", majlis: "" },
  { id: "PELABUHAN TANJUNG PELEPAS", name: "PELABUHAN TANJUNG PELEPAS", majlis: "" }
];

// Preset Majlis (PBT)
const MAJLIS = [
  "MPSepang",
  "MPSelayang",
  "DBKL",
  "MBSA",
  "MBDK",
  "MPKS",
  "MBPJ",
  "MPS",
  "MBKJ",
  "MBSNS",
  "MPKJ",
  "MBK",
  "MBMB",
  "MPJ",
  "MPKULAI"
];

// Authority / Agency (badan teknikal)
const AUTHORITIES = [
  "LUAS",
  "DOE",
  "JKKP",
  "MIDA",
  "BOMBA",
  "ST",
  "Others"
];

// Permit columns (fixed, after removal)
const PERMIT_TYPES = [
  { id: "KM", label: "KEBENARAN MERANCANG (KM)" },
  { id: "BP", label: "BUILDING PERMIT (BP)" },
  { id: "BUSINESS_LICENSE", label: "BUSINESS LICENCES" },
  { id: "REG_PLANT", label: "REGISTRATION OF PLANT" },
  { id: "REG_AIR_COMP", label: "REGISTRATION OF AIR COMPRESSOR" },
  { id: "OSH_C", label: "COMPETENT PERSON WITH OSH-C CERT" },
  { id: "PAT", label: "PENDAFTARAN AWAL TAPAK (PAT)" },
  { id: "LUAS", label: "LUAS (Water Meter / Licence)" },
  { id: "DIESEL", label: "DIESEL – KPDNKK (BLESS)" },
  { id: "DEPOSIT", label: "DEPOSIT PAYMENT" },
  { id: "COMPOUND", label: "COMPOUND / SUMMON" }
];

const STATUS_OPTIONS = [
  "Draft",
  "Submitted",
  "Pending",
  "Query",
  "Approved",
  "Rejected",
  "Expired"
];

const PAYMENT_STATUS_OPTIONS = ["Paid", "Partial", "Unpaid"];

let records = [];

// ===================== UTILITIES =====================

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    records = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load records", e);
    records = [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function generateId() {
  return "REC-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

function formatCurrency(num) {
  const value = Number(num || 0);
  if (!value) return "-";
  return value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  // Expecting YYYY-MM-DD
  const [yyyy, mm, dd] = dateStr.split("-");
  if (!yyyy || !mm || !dd) return dateStr;
  return `${dd}/${mm}/${yyyy}`;
}

function getRecordYear(record) {
  const dateStr = record.invoiceDate || record.submissionDate || record.approvalDate || "";
  if (!dateStr || dateStr.length < 4) return null;
  return dateStr.slice(0, 4);
}

function parseISODate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// ===================== FORM & ENTRY =====================

function populateSelectOptions(selectEl, options, includeEmpty = true) {
  if (includeEmpty) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "-- Pilih --";
    selectEl.appendChild(opt);
  }
  options.forEach((val) => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    selectEl.appendChild(opt);
  });
}

function populatePermitSelect(selectEl, includeEmpty = true) {
  if (includeEmpty) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "-- Pilih --";
    selectEl.appendChild(opt);
  }
  PERMIT_TYPES.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label;
    selectEl.appendChild(opt);
  });
}

function computeTotalCostFromForm() {
  const fee = parseFloat(document.getElementById("fee-amount").value || "0") || 0;
  const compound = parseFloat(document.getElementById("compound-amount").value || "0") || 0;
  const deposit = parseFloat(document.getElementById("deposit-amount").value || "0") || 0;
  const total = fee + compound + deposit;
  document.getElementById("total-cost").value = total ? formatCurrency(total) : "";
}

function resetForm() {
  document.getElementById("record-id").value = "";
  document.getElementById("entry-form").reset();
  document.getElementById("total-cost").value = "";
}

function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("record-id").value || generateId();
  const plantName = document.getElementById("plant-name").value;
  const majlis = document.getElementById("majlis").value;
  const authorityBody = document.getElementById("authority-body").value;
  const permitType = document.getElementById("permit-type").value;
  const applicationType = document.getElementById("application-type").value;
  const status = document.getElementById("status").value;
  const refNo = document.getElementById("ref-no").value.trim();
  const submissionDate = document.getElementById("submission-date").value || "";
  const approvalDate = document.getElementById("approval-date").value || "";
  const expiryDate = document.getElementById("expiry-date").value || "";

  const invoiceNo = document.getElementById("invoice-no").value.trim();
  const invoiceDate = document.getElementById("invoice-date").value || "";
  const feeAmount = parseFloat(document.getElementById("fee-amount").value || "0") || 0;
  const compoundAmount =
    parseFloat(document.getElementById("compound-amount").value || "0") || 0;
  const depositAmount =
    parseFloat(document.getElementById("deposit-amount").value || "0") || 0;
  const paymentStatus = document.getElementById("payment-status").value;

  const changeNotes = document.getElementById("change-notes").value.trim();
  const attachments = document.getElementById("attachments").value.trim();
  const remarks = document.getElementById("remarks").value.trim();
  const nowISO = new Date().toISOString();

  if (!plantName || !permitType || !applicationType || !status) {
    alert(
      "Sila lengkapkan Plant, Jenis Permit, Jenis Permohonan dan Status sebelum save."
    );
    return;
  }

  const existingIndex = records.findIndex((r) => r.id === id);
  const existingRecord = existingIndex >= 0 ? records[existingIndex] : null;
  const previousStatus = existingRecord ? existingRecord.status : null;
  const previousHistory = existingRecord ? existingRecord.statusHistory || [] : [];

  const record = {
    id,
    plantName,
    majlis,
    authorityBody,
    permitType,
    applicationType,
    status,
    refNo,
    submissionDate,
    approvalDate,
    expiryDate,
    invoiceNo,
    invoiceDate,
    feeAmount,
    compoundAmount,
    depositAmount,
    paymentStatus,
    changeNotes,
    attachments,
    remarks,
    statusHistory: previousHistory,
    createdAt: existingRecord ? existingRecord.createdAt : nowISO,
    updatedAt: nowISO
  };

  // Status history logic
  const today = todayISO();
  if (!previousStatus) {
    record.statusHistory = [...previousHistory, { date: today, status }];
  } else if (previousStatus !== status) {
    record.statusHistory = [...previousHistory, { date: today, status }];
  }

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  saveRecords();
  rebuildYearFilterOptions();
  renderRecordsTable();
  renderSummary();

  alert("Rekod telah disimpan / dikemas kini.");
  resetForm();
}

// Load record into form for editing
function loadRecordIntoForm(recordId) {
  const record = records.find((r) => r.id === recordId);
  if (!record) return;

  document.getElementById("record-id").value = record.id;
  document.getElementById("plant-name").value = record.plantName || "";
  document.getElementById("majlis").value = record.majlis || "";
  document.getElementById("authority-body").value = record.authorityBody || "";
  document.getElementById("permit-type").value = record.permitType || "";
  document.getElementById("application-type").value = record.applicationType || "";
  document.getElementById("status").value = record.status || "";
  document.getElementById("ref-no").value = record.refNo || "";
  document.getElementById("submission-date").value = record.submissionDate || "";
  document.getElementById("approval-date").value = record.approvalDate || "";
  document.getElementById("expiry-date").value = record.expiryDate || "";
  document.getElementById("invoice-no").value = record.invoiceNo || "";
  document.getElementById("invoice-date").value = record.invoiceDate || "";
  document.getElementById("fee-amount").value =
    record.feeAmount !== undefined ? record.feeAmount : "";
  document.getElementById("compound-amount").value =
    record.compoundAmount !== undefined ? record.compoundAmount : "";
  document.getElementById("deposit-amount").value =
    record.depositAmount !== undefined ? record.depositAmount : "";
  document.getElementById("payment-status").value = record.paymentStatus || "";
  document.getElementById("change-notes").value = record.changeNotes || "";
  document.getElementById("attachments").value = record.attachments || "";
  document.getElementById("remarks").value = record.remarks || "";

  computeTotalCostFromForm();
}

// ===================== RECORDS TABLE (ENTRY PAGE) =====================

function renderRecordsTable() {
  const tbody = document.querySelector("#records-table tbody");
  tbody.innerHTML = "";

  const filterPlant = document.getElementById("filter-plant-records").value;
  const filterPermit = document.getElementById("filter-permit-records").value;
  const searchText = document
    .getElementById("filter-search-records")
    .value.toLowerCase()
    .trim();

  let filtered = [...records];

  if (filterPlant) {
    filtered = filtered.filter((r) => r.plantName === filterPlant);
  }
  if (filterPermit) {
    filtered = filtered.filter((r) => r.permitType === filterPermit);
  }
  if (searchText) {
    filtered = filtered.filter((r) => {
      const haystack =
        (r.refNo || "") +
        " " +
        (r.remarks || "") +
        " " +
        (r.changeNotes || "");
      return haystack.toLowerCase().includes(searchText);
    });
  }

  filtered.sort((a, b) => (a.submissionDate || "").localeCompare(b.submissionDate || ""));

  filtered.forEach((r) => {
    const tr = document.createElement("tr");
    const permitLabel =
      PERMIT_TYPES.find((p) => p.id === r.permitType)?.label || r.permitType || "-";

    const totalCost = (r.feeAmount || 0) + (r.compoundAmount || 0) + (r.depositAmount || 0);

    tr.innerHTML = `
      <td>${r.plantName || "-"}</td>
      <td>${r.majlis || "-"}</td>
      <td>${permitLabel}</td>
      <td>${r.authorityBody || "-"}</td>
      <td>${r.status || "-"}</td>
      <td>${r.refNo || "-"}</td>
      <td>${r.submissionDate ? formatDateDisplay(r.submissionDate) : "-"}</td>
      <td>${r.invoiceDate ? formatDateDisplay(r.invoiceDate) : "-"}</td>
      <td>${formatCurrency(totalCost)}</td>
      <td>
        <button class="btn small ghost" data-edit-id="${r.id}">Edit</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===================== SUMMARY FILTERS =====================

function rebuildYearFilterOptions() {
  const yearSelect = document.getElementById("filter-year-summary");
  if (!yearSelect) return;

  const existingValue = yearSelect.value;
  const years = new Set();

  records.forEach((r) => {
    const y = getRecordYear(r);
    if (y) years.add(y);
  });

  const sortedYears = Array.from(years).sort();

  yearSelect.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "All Years";
  yearSelect.appendChild(optAll);

  sortedYears.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  if (existingValue && years.has(existingValue)) {
    yearSelect.value = existingValue;
  }
}

function getFilteredRecordsForSummary() {
  const year = document.getElementById("filter-year-summary").value;
  const plantFilter = document.getElementById("filter-plant-summary").value;
  const permitFilter = document.getElementById("filter-permit-summary").value;
  const statusFilter = document.getElementById("filter-status-summary").value;

  let filtered = [...records];

  if (year) {
    filtered = filtered.filter((r) => getRecordYear(r) === year);
  }
  if (plantFilter) {
    filtered = filtered.filter((r) => r.plantName === plantFilter);
  }
  if (permitFilter) {
    filtered = filtered.filter((r) => r.permitType === permitFilter);
  }
  if (statusFilter) {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }

  return filtered;
}

// ===================== SUMMARY MATRIX =====================

function computeExpiryDateForRecords(recordsForCell) {
  const today = todayISO();
  const todayDate = parseISODate(today);

  const dates = recordsForCell
    .map((r) => r.expiryDate)
    .filter((d) => d)
    .map((d) => parseISODate(d))
    .filter((d) => !!d);

  if (!dates.length) return null;

  const futureOrToday = dates.filter((d) => d.getTime() >= todayDate.getTime());
  if (futureOrToday.length) {
    let nearest = futureOrToday[0];
    let minDiff = nearest.getTime() - todayDate.getTime();
    for (let i = 1; i < futureOrToday.length; i++) {
      const diff = futureOrToday[i].getTime() - todayDate.getTime();
      if (diff < minDiff) {
        nearest = futureOrToday[i];
        minDiff = diff;
      }
    }
    return nearest;
  } else {
    let latest = dates[0];
    for (let i = 1; i < dates.length; i++) {
      if (dates[i].getTime() > latest.getTime()) latest = dates[i];
    }
    return latest;
  }
}

function computeMatrixCellData(plantId, permitId, filteredRecords) {
  const cellRecs = filteredRecords.filter(
    (r) => r.plantName === plantId && r.permitType === permitId
  );

  if (!cellRecs.length) {
    return {
      hasData: false
    };
  }

  const total = cellRecs.length;

  // Collect status history lines
  const allHistory = [];
  cellRecs.forEach((r) => {
    (r.statusHistory || []).forEach((h) => {
      allHistory.push({
        date: h.date,
        status: h.status
      });
    });
  });

  allHistory.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const maxLines = 3;
  const selectedLines = allHistory.slice(0, maxLines);

  let historyLines = [];
  if (selectedLines.length) {
    historyLines = selectedLines.map((h) => ({
      dateText: formatDateDisplay(h.date),
      status: h.status
    }));
  } else {
    const uniqueStatuses = Array.from(new Set(cellRecs.map((r) => r.status))).filter(
      Boolean
    );
    historyLines = uniqueStatuses.map((s) => ({
      dateText: "",
      status: s
    }));
  }

  const expDateObj = computeExpiryDateForRecords(cellRecs);
  const expDateText = expDateObj
    ? formatDateDisplay(expDateObj.toISOString().slice(0, 10))
    : "";

  return {
    hasData: true,
    total,
    historyLines,
    expDateText
  };
}

function renderMatrixHeader() {
  const theadRow = document.querySelector("#summary-matrix-table thead tr");
  while (theadRow.children.length > 3) {
    theadRow.removeChild(theadRow.lastChild);
  }

  PERMIT_TYPES.forEach((p) => {
    const th = document.createElement("th");
    th.textContent = p.label;
    theadRow.appendChild(th);
  });

  const thRemarks = document.createElement("th");
  thRemarks.textContent = "Remarks";
  theadRow.appendChild(thRemarks);
}

function renderSummaryMatrix() {
  const tbody = document.querySelector("#summary-matrix-table tbody");
  tbody.innerHTML = "";

  const filtered = getFilteredRecordsForSummary();
  const plantFilter = document.getElementById("filter-plant-summary").value;
  const plantsToShow = plantFilter
    ? BATCHING_PLANTS.filter((p) => p.id === plantFilter)
    : BATCHING_PLANTS;

  plantsToShow.forEach((plant, index) => {
    const tr = document.createElement("tr");

    const tdNo = document.createElement("td");
    tdNo.textContent = index + 1;
    tr.appendChild(tdNo);

    const tdPlant = document.createElement("td");
    tdPlant.textContent = plant.name;
    tr.appendChild(tdPlant);

    // Majlis – guna config jika ada, kalau tak ambil majlis paling kerap dari rekod
    const tdMajlis = document.createElement("td");
    let majlisText = plant.majlis || "";
    if (!majlisText) {
      const plantRecs = filtered.filter((r) => r.plantName === plant.id && r.majlis);
      if (plantRecs.length) {
        const freqMap = new Map();
        plantRecs.forEach((r) => {
          const m = r.majlis;
          if (!m) return;
          freqMap.set(m, (freqMap.get(m) || 0) + 1);
        });
        if (freqMap.size > 0) {
          majlisText = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1])[0][0];
        }
      }
    }
    tdMajlis.textContent = majlisText || "-";
    tr.appendChild(tdMajlis);

    // Permit columns
    PERMIT_TYPES.forEach((permit) => {
      const cellData = computeMatrixCellData(plant.id, permit.id, filtered);
      const td = document.createElement("td");
      td.className = "matrix-cell";

      if (!cellData.hasData) {
        td.textContent = "-";
      } else {
        const lines = [];
        lines.push(`<div class="matrix-cell-total">Total: ${cellData.total}</div>`);

        if (cellData.historyLines && cellData.historyLines.length) {
          const statusLinesHtml = cellData.historyLines
            .map((h) => {
              const prefix = h.dateText ? `${h.dateText} – ` : "";
              return `<div class="matrix-cell-line">${prefix}${h.status}</div>`;
            })
            .join("");
          lines.push(`<div class="matrix-cell-lines">${statusLinesHtml}</div>`);
        }

        const expText = cellData.expDateText
          ? `EXP Date: ${cellData.expDateText}`
          : "EXP Date: -";
        lines.push(`<div class="matrix-cell-exp">${expText}</div>`);

        td.innerHTML = lines.join("");
      }

      tr.appendChild(td);
    });

    // Remarks column
    const remarksCell = document.createElement("td");
    const plantRecs = filtered.filter((r) => r.plantName === plant.id);
    const remarksList = [];

    plantRecs.forEach((r) => {
      if (r.remarks) remarksList.push(r.remarks);
      if (r.changeNotes) remarksList.push(r.changeNotes);
    });

    const uniqueRemarks = Array.from(new Set(remarksList));
    remarksCell.textContent = uniqueRemarks.length ? uniqueRemarks.slice(0, 2).join(" | ") : "-";
    tr.appendChild(remarksCell);

    tbody.appendChild(tr);
  });

  const yearTitleEl = document.getElementById("summary-year-title");
  const statusDateEl = document.getElementById("summary-status-date");
  const year = document.getElementById("filter-year-summary").value;
  yearTitleEl.textContent = `PERMIT AND LICENCE FOR THE YEAR OF ${
    year || "All Years"
  }`;

  const today = todayISO();
  statusDateEl.textContent = `Status as at: ${formatDateDisplay(today)}`;
}

// ===================== COST SUMMARY =====================

function computeCostSummaryByPlant(filtered) {
  const map = new Map();

  BATCHING_PLANTS.forEach((p) => {
    map.set(p.id, {
      plantId: p.id,
      plantName: p.name,
      totalApplications: 0,
      totalCost: 0,
      paidCost: 0,
      partialCost: 0,
      unpaidCost: 0
    });
  });

  filtered.forEach((r) => {
    const entry = map.get(r.plantName);
    if (!entry) return;

    const cost =
      (r.feeAmount || 0) + (r.compoundAmount || 0) + (r.depositAmount || 0);

    entry.totalApplications += 1;
    entry.totalCost += cost;

    if (r.paymentStatus === "Paid") {
      entry.paidCost += cost;
    } else if (r.paymentStatus === "Partial") {
      entry.partialCost += cost;
    } else if (r.paymentStatus === "Unpaid") {
      entry.unpaidCost += cost;
    }
  });

  return Array.from(map.values());
}

function renderCostSummaryTable() {
  const tbody = document.querySelector("#cost-summary-table tbody");
  tbody.innerHTML = "";

  const filtered = getFilteredRecordsForSummary();
  const rows = computeCostSummaryByPlant(filtered);

  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${row.plantName}</td>
      <td>${row.totalApplications}</td>
      <td>${formatCurrency(row.totalCost)}</td>
      <td>${formatCurrency(row.paidCost)}</td>
      <td>${formatCurrency(row.partialCost)}</td>
      <td>${formatCurrency(row.unpaidCost)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ===================== EXPORT CSV =====================

function exportSummaryToCSV() {
  const filtered = getFilteredRecordsForSummary();
  if (!filtered.length) {
    alert("Tiada rekod untuk di-export (ikut filter semasa).");
    return;
  }

  const header = [
    "Record ID",
    "Plant",
    "Majlis",
    "Authority",
    "Permit Type",
    "Application Type",
    "Status",
    "Reference No",
    "Submission Date",
    "Approval Date",
    "Expiry Date",
    "Invoice No",
    "Invoice Date",
    "Fee Amount",
    "Compound Amount",
    "Deposit Amount",
    "Total Cost",
    "Payment Status",
    "Change Notes",
    "Attachments",
    "Remarks"
  ];

  const rows = filtered.map((r) => {
    const totalCost = (r.feeAmount || 0) + (r.compoundAmount || 0) + (r.depositAmount || 0);
    const permitLabel =
      PERMIT_TYPES.find((p) => p.id === r.permitType)?.label || r.permitType || "";
    return [
      r.id,
      r.plantName,
      r.majlis || "",
      r.authorityBody || "",
      permitLabel,
      r.applicationType,
      r.status,
      r.refNo || "",
      r.submissionDate || "",
      r.approvalDate || "",
      r.expiryDate || "",
      r.invoiceNo || "",
      r.invoiceDate || "",
      r.feeAmount || 0,
      r.compoundAmount || 0,
      r.depositAmount || 0,
      totalCost,
      r.paymentStatus || "",
      (r.changeNotes || "").replace(/\r?\n/g, " "),
      (r.attachments || "").replace(/\r?\n/g, " "),
      (r.remarks || "").replace(/\r?\n/g, " ")
    ];
  });

  const lines = [];
  lines.push(header.join(","));
  rows.forEach((row) => {
    const escaped = row.map((cell) => {
      const c = String(cell ?? "");
      if (c.includes(",") || c.includes('"') || c.includes("\n")) {
        return '"' + c.replace(/"/g, '""') + '"';
      }
      return c;
    });
    lines.push(escaped.join(","));
  });

  const csvContent = lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = todayISO();
  a.href = url;
  a.download = `mdc-authority-summary-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===================== NAVIGATION & SUMMARY =====================

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    const target = "view-" + btn.dataset.view;
    btn.classList.toggle("active", target === viewId);
  });

  if (viewId === "view-summary") {
    renderSummary();
  }
}

function renderSummary() {
  renderMatrixHeader();
  renderSummaryMatrix();
  renderCostSummaryTable();
}

// ===================== INIT =====================

document.addEventListener("DOMContentLoaded", () => {
  loadRecords();

  // Populate selects
  const plantSelect = document.getElementById("plant-name");
  BATCHING_PLANTS.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    plantSelect.appendChild(opt);
  });

  populateSelectOptions(document.getElementById("majlis"), MAJLIS, true);
  populateSelectOptions(
    document.getElementById("authority-body"),
    AUTHORITIES,
    true
  );
  populatePermitSelect(document.getElementById("permit-type"), true);
  populateSelectOptions(document.getElementById("status"), STATUS_OPTIONS, true);
  populateSelectOptions(
    document.getElementById("payment-status"),
    PAYMENT_STATUS_OPTIONS,
    false
  );

  // Filters (records table)
  const filterPlantRecords = document.getElementById("filter-plant-records");
  const filterPermitRecords = document.getElementById("filter-permit-records");
  const filterSearchRecords = document.getElementById("filter-search-records");

  BATCHING_PLANTS.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    filterPlantRecords.appendChild(opt);
  });

  populatePermitSelect(filterPermitRecords, true);

  filterPlantRecords.addEventListener("change", renderRecordsTable);
  filterPermitRecords.addEventListener("change", renderRecordsTable);
  filterSearchRecords.addEventListener("input", renderRecordsTable);

  // Summary filters
  const plantSummarySelect = document.getElementById("filter-plant-summary");
  const permitSummarySelect = document.getElementById("filter-permit-summary");
  const statusSummarySelect = document.getElementById("filter-status-summary");

  BATCHING_PLANTS.forEach((p) => {
    const opt1 = document.createElement("option");
    opt1.value = p.id;
    opt1.textContent = p.name;
    plantSummarySelect.appendChild(opt1);
  });

  populatePermitSelect(permitSummarySelect, true);
  populateSelectOptions(statusSummarySelect, STATUS_OPTIONS, true);

  rebuildYearFilterOptions();

  // Nav events
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchView("view-" + btn.dataset.view);
    });
  });

  // Form events
  document.getElementById("entry-form").addEventListener("submit", handleFormSubmit);
  document
    .getElementById("reset-form-btn")
    .addEventListener("click", () => resetForm());

  ["fee-amount", "compound-amount", "deposit-amount"].forEach((id) => {
    document.getElementById(id).addEventListener("input", computeTotalCostFromForm);
  });

  // Records table edit button handler
  document
    .getElementById("records-table")
    .addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-edit-id]");
      if (!btn) return;
      const id = btn.getAttribute("data-edit-id");
      loadRecordIntoForm(id);
      switchView("view-entry");
    });

  // Summary filters events
  document
    .getElementById("filter-year-summary")
    .addEventListener("change", renderSummary);
  document
    .getElementById("filter-plant-summary")
    .addEventListener("change", renderSummary);
  document
    .getElementById("filter-permit-summary")
    .addEventListener("change", renderSummary);
  document
    .getElementById("filter-status-summary")
    .addEventListener("change", renderSummary);

  // Export CSV
  document
    .getElementById("export-summary-csv-btn")
    .addEventListener("click", exportSummaryToCSV);

  // Initial render
  renderRecordsTable();
  renderSummary();

  // PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.error("SW registration failed", err));
  }
});
