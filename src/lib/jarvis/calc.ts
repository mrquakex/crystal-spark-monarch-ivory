export function evalMath(expr: string): string {
  const cleaned = expr
    .replace(/,/g, ".")
    .replace(/×/g, "*")
    .replace(/x/gi, "*")
    .replace(/÷/g, "/")
    .replace(/çarpı/gi, "*")
    .replace(/artı/gi, "+")
    .replace(/eksi/gi, "-")
    .replace(/bölü/gi, "/")
    .replace(/[^0-9+\-*/().\s]/g, "");
  if (!cleaned.trim()) throw new Error("ifade yok");
  if (!/^[\d+\-*/().\s]+$/.test(cleaned)) throw new Error("geçersiz");
  const fn = new Function(`"use strict"; return (${cleaned})`);
  const result = fn();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("tanımsız");
  return Number.isInteger(result) ? String(result) : String(Math.round(result * 10000) / 10000);
}
