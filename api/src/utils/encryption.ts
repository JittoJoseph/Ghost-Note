async function getCryptoKey(secret: string): Promise<CryptoKey> {
  // Hash the string secret to ensure we have a 256-bit key for AES-256-GCM
  const encoder = new TextEncoder();
  const secretBuffer = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", secretBuffer);

  return crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptMessage(
  text: string,
  secret: string,
): Promise<string> {
  const key = await getCryptoKey(secret);
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Generate a random 12-byte IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  // Format: base64(iv):base64(ciphertext)
  return `${bufferToBase64(iv.buffer)}:${bufferToBase64(ciphertext)}`;
}

export async function decryptMessage(
  encryptedData: string,
  secret: string,
): Promise<string> {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 2) {
      // Fallback for unencrypted legacy messages
      return encryptedData;
    }

    const iv = base64ToBuffer(parts[0]);
    const ciphertext = base64ToBuffer(parts[1]);

    const key = await getCryptoKey(secret);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      ciphertext,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Failed to decrypt message:", error);
    return "Encrypted message (Decryption failed)";
  }
}
