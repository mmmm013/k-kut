export type StlFullmixRow = Record<string, string>;

export function parseCsv(text: string): StlFullmixRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(value); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = []; value = "";
    } else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const [headers = [], ...records] = rows;
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

export function fullmixSummary(rows: StlFullmixRow[]) {
  const withOriginalUrl = rows.filter((row) => Boolean(row["Original download URL"])).length;
  const withWavUrl = rows.filter((row) => Boolean(row["WAV URL"])).length;
  const formats = rows.reduce<Record<string, number>>((totals, row) => {
    const key = row["Original format"] || "";
    totals[key] = (totals[key] || 0) + 1;
    return totals;
  }, {});
  return { total: rows.length, withOriginalUrl, withWavUrl, formats };
}
