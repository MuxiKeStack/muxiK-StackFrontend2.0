/**
 * Adler32 校验和计算
 */
export function calculateAdler32(arrayBuffer: ArrayBuffer): string {
  const view = new Uint8Array(arrayBuffer);
  let a = 1;
  let b = 0;

  for (let i = 0; i < view.length; i++) {
    a = (a + view[i]) % 65521;
    b = (b + a) % 65521;
  }

  return (((b << 16) | a) >>> 0).toString();
}
