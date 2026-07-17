// src/lib/zentrale/auth.ts — Token-Prüfung für die schreibenden Pages Functions der
// Steuerzentrale (z. B. "beantworten"). Web-Crypto-frei mit Absicht: die eigentliche Anforderung
// ist nicht Kryptographie, sondern ein Vergleich, dessen Laufzeit nicht verrät, an welcher
// Stelle zwei Strings sich unterscheiden — dafür reicht ein Byte-für-Byte-XOR ohne Early-Exit.

/** Vergleicht zwei Strings byteweise (UTF-8), ohne bei der ersten Abweichung abzubrechen —
 * auch bei unterschiedlicher Länge wird über die volle Länge des längeren Inputs iteriert,
 * damit die Laufzeit nichts über die Länge des Geheimnisses verrät. */
export function constantTimeEqual(a: string, b: string): boolean {
  const bytesA = new TextEncoder().encode(a)
  const bytesB = new TextEncoder().encode(b)
  const len = Math.max(bytesA.length, bytesB.length)
  let diff = bytesA.length ^ bytesB.length
  for (let i = 0; i < len; i++) {
    const byteA = i < bytesA.length ? bytesA[i] : 0
    const byteB = i < bytesB.length ? bytesB[i] : 0
    diff |= byteA ^ byteB
  }
  return diff === 0
}

/** Fail closed: ein fehlendes/leeres Secret gibt nie "true" — sonst würde ein nicht
 * konfiguriertes Secret die Prüfung versehentlich abschalten statt sie zu verweigern. */
export function checkToken(headerValue: string | null, secret: string | undefined | null): boolean {
  if (!secret) return false
  if (headerValue === null) return false
  return constantTimeEqual(headerValue, secret)
}
