import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Automatically cleanup after each test run
afterEach(() => {
  cleanup()
})

// Mock window.crypto.subtle for environments where jsdom has partial support
if (!globalThis.crypto) {
  // @ts-expect-error mock crypto
  globalThis.crypto = {}
}

if (!globalThis.crypto.subtle) {
  // @ts-expect-error mock subtle
  globalThis.crypto.subtle = {
    digest: async (_algorithm: string, data: ArrayBuffer) => {
      // Simple fallback SHA-256 implementation or mock for tests if needed
      // but in Node.js 18+ webcrypto is present in globalThis.crypto
      const nodeCrypto = await import('crypto')
      const hash = nodeCrypto.createHash('sha256')
      hash.update(Buffer.from(data))
      return hash.digest().buffer
    },
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {}
