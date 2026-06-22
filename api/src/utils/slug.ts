export function generateSlug(): string {
  // Create an 8-character URL-safe random hex slug
  return Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
