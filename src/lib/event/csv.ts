import type { EventData } from "./types";
export function parseCSV(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        if (
          (!quoted && cell.length) ||
          (quoted &&
            i + 1 < input.length &&
            ![",", "\n", "\r"].includes(input[i + 1]))
        ) {
          throw new Error("CSV contains a misplaced quote");
        }
        quoted = !quoted;
      }
    } else if (c === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export function previewCSV(d: EventData, input: string) {
  const [header, ...rows] = parseCSV(input.replace(/^\uFEFF/, ""));
  if (
    !header ||
    !["name", "roll", "phone"].every((k) =>
      header.map((h) => h.toLowerCase()).includes(k),
    )
  )
    throw new Error("CSV header must contain name,roll,phone");
  if (rows.length > 2000)
    throw new Error("Import at most 2,000 participants at a time");
  const cols = header.map((h) => h.toLowerCase()),
    rolls = new Set(d.participants.map((p) => p.roll)),
    phones = new Set(d.participants.map((p) => p.phone));
  return rows.map((row, i) => {
    const name = (row[cols.indexOf("name")] || "").trim(),
      roll = (row[cols.indexOf("roll")] || "").trim().toLowerCase(),
      phone = (row[cols.indexOf("phone")] || "").replace(/[\s()+-]/g, "");
    const errors: string[] = [];
    if (row.length !== header.length)
      errors.push("Column count does not match header");
    if (!name || name.length > 80)
      errors.push("Name required (maximum 80 characters)");
    if (!roll || roll.length > 80)
      errors.push("Roll number required (maximum 80 characters)");
    if (!/^\d{10,15}$/.test(phone))
      errors.push("Phone must contain 10–15 digits");
    if (rolls.has(roll) || phones.has(phone))
      errors.push("Duplicate roll number or phone");
    if (!errors.length) {
      rolls.add(roll);
      phones.add(phone);
    }
    return { row: i + 2, name, roll, phone, errors };
  });
}
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
