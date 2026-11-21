// Read ZIP central-directory sizes before decompression to reject oversized archives.
export function validateDocxArchive(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  let end = -1;
  for (let i = view.byteLength - 22; i >= Math.max(0, view.byteLength - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error("Invalid DOCX archive");
  const entries = view.getUint16(end + 10, true);
  if (entries > 2000) throw new Error("DOCX archive contains too many entries");
  let offset = view.getUint32(end + 16, true);
  let total = 0;
  for (let i = 0; i < entries; i++) {
    if (offset + 46 > view.byteLength || view.getUint32(offset, true) !== 0x02014b50)
      throw new Error("Invalid DOCX archive directory");
    total += view.getUint32(offset + 24, true);
    if (total > 40 * 1024 * 1024) throw new Error("DOCX archive expands beyond the safe document limit");
    offset += 46 + view.getUint16(offset + 28, true) + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true);
  }
}