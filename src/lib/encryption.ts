// Simple encryption using Web Crypto API (built-in, no extra deps)
// Falls back to base64 encoding if crypto not available

export function generateRoomKey(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const key = window.crypto.getRandomValues(new Uint8Array(32))
    return btoa(String.fromCharCode(...key))
  }
  // Server-side fallback
  const { randomBytes } = require('crypto')
  return randomBytes(32).toString('base64')
}

export function encryptMessage(plaintext: string, roomId: string): string {
  // Simple XOR-based encryption with room key for demo
  // In production use AES-GCM via WebCrypto
  const key = deriveKey(roomId)
  const encrypted = xorEncrypt(plaintext, key)
  return btoa(encrypted)
}

export function decryptMessage(ciphertext: string, roomId: string): string {
  try {
    const key = deriveKey(roomId)
    const decoded = atob(ciphertext)
    return xorEncrypt(decoded, key) // XOR is symmetric
  } catch {
    return '[Decryption error]'
  }
}

export function deriveRoomKey(roomId: string): string {
  return roomId
}

function deriveKey(seed: string): string {
  // Derive a repeating key from seed
  let key = ''
  for (let i = 0; i < 64; i++) {
    key += String.fromCharCode((seed.charCodeAt(i % seed.length) * 31 + i) % 256)
  }
  return key
}

function xorEncrypt(text: string, key: string): string {
  return text.split('').map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('')
}
