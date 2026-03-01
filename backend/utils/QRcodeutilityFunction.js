function normalizeCode(s) {
  return String(s || "").trim();
}

function buildSequentialCodes({ prefix = "", suffix = "", startingFrom = 1, count = 1, padLength }) {
  if (count <= 0) return [];
  const startStr = String(startingFrom);
  const pad = padLength && padLength > 0 ? padLength : startStr.length;

  const result = [];
  for (let i = 0; i < count; i++) {
    const n = startingFrom + i;
    const seq = String(n).padStart(pad, "0");
    result.push(normalizeCode(`${prefix}${seq}${suffix}`));
  }
  return result;
}

function findDuplicatesInArray(values) {
  const seen = new Set();
  const dups = new Set();
  for (const v of values) {
    if (seen.has(v)) dups.add(v);
    else seen.add(v);
  }
  return [...dups];
}

module.exports = { normalizeCode, buildSequentialCodes, findDuplicatesInArray };