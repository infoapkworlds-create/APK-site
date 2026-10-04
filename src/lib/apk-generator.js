import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

/**
 * Creates a valid ZIP/APK archive with standard Android package structures.
 * @param {string} destPath File destination path
 * @param {object} meta Package metadata (packageName, versionName, appName, targetSize)
 * @returns {{ size: number, sha256: string }}
 */
export function createMockApk(destPath, { packageName, versionName, appName, targetSize = 25_000_000 }) {
  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });

  const manifestContent = Buffer.from(
    `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${packageName}" android:versionName="${versionName}">\n  <application android:label="${appName}"/>\n</manifest>\n`
  );

  // Pad data so the APK has realistic size (e.g. 15-40 MB)
  const paddingSize = Math.max(1024, targetSize - 2048);
  const paddingChunk = Buffer.alloc(Math.min(paddingSize, 65536), 0x5a); // 64KB repeating pattern

  function crc32(buf) {
    let crc = ~0;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return ~crc >>> 0;
  }
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }

  // Create entries: AndroidManifest.xml and classes.dex
  const entries = [
    { name: 'AndroidManifest.xml', data: manifestContent },
    { name: 'classes.dex', data: Buffer.from(`DEX\\n035\\0${packageName}\\0${appName}`) },
    { name: 'resources.arsc', data: Buffer.from(`ARSC\\0${appName}`) },
  ];

  // We write to stream to handle large files efficiently
  const out = fs.createWriteStream(destPath);
  const hash = crypto.createHash('sha256');
  let currentOffset = 0;
  const centralRecords = [];

  function write(buf) {
    out.write(buf);
    hash.update(buf);
    currentOffset += buf.length;
  }

  // 1. Write local file entries
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const localHeader = Buffer.alloc(30);
    localHeader.write('PK\x03\x04', 0); // signature
    localHeader.writeUInt16LE(20, 4);   // version needed (2.0)
    localHeader.writeUInt16LE(0, 6);    // flags
    localHeader.writeUInt16LE(0, 8);    // compression method (stored)
    localHeader.writeUInt16LE(0, 10);   // time
    localHeader.writeUInt16LE(0, 12);   // date
    localHeader.writeUInt32LE(crc, 14); // crc32
    localHeader.writeUInt32LE(size, 18);// compressed size
    localHeader.writeUInt32LE(size, 22);// uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26); // name length
    localHeader.writeUInt16LE(0, 28);   // extra length

    centralRecords.push({
      nameBuf,
      crc,
      size,
      offset: currentOffset,
    });

    write(localHeader);
    write(nameBuf);
    write(entry.data);
  }

  // 2. Write assets/payload.bin for target size
  const payloadName = Buffer.from('assets/app-resources.dat', 'utf8');
  let payloadCrc = ~0;
  let remaining = paddingSize;
  while (remaining > 0) {
    const chunk = remaining >= paddingChunk.length ? paddingChunk : paddingChunk.subarray(0, remaining);
    for (let i = 0; i < chunk.length; i++) {
      payloadCrc = (payloadCrc >>> 8) ^ table[(payloadCrc ^ chunk[i]) & 0xff];
    }
    remaining -= chunk.length;
  }
  payloadCrc = ~payloadCrc >>> 0;

  const payloadHeader = Buffer.alloc(30);
  payloadHeader.write('PK\x03\x04', 0);
  payloadHeader.writeUInt16LE(20, 4);
  payloadHeader.writeUInt16LE(0, 6);
  payloadHeader.writeUInt16LE(0, 8);
  payloadHeader.writeUInt16LE(0, 10);
  payloadHeader.writeUInt16LE(0, 12);
  payloadHeader.writeUInt32LE(payloadCrc, 14);
  payloadHeader.writeUInt32LE(paddingSize, 18);
  payloadHeader.writeUInt32LE(paddingSize, 22);
  payloadHeader.writeUInt16LE(payloadName.length, 26);
  payloadHeader.writeUInt16LE(0, 28);

  centralRecords.push({
    nameBuf: payloadName,
    crc: payloadCrc,
    size: paddingSize,
    offset: currentOffset,
  });

  write(payloadHeader);
  write(payloadName);
  remaining = paddingSize;
  while (remaining > 0) {
    const chunk = remaining >= paddingChunk.length ? paddingChunk : paddingChunk.subarray(0, remaining);
    write(chunk);
    remaining -= chunk.length;
  }

  // 3. Central directory
  const centralStart = currentOffset;
  for (const rec of centralRecords) {
    const cHead = Buffer.alloc(46);
    cHead.write('PK\x01\x02', 0);
    cHead.writeUInt16LE(20, 4); // version made by
    cHead.writeUInt16LE(20, 6); // version needed
    cHead.writeUInt16LE(0, 8);  // flags
    cHead.writeUInt16LE(0, 10); // compression method (stored)
    cHead.writeUInt16LE(0, 12); // time
    cHead.writeUInt16LE(0, 14); // date
    cHead.writeUInt32LE(rec.crc, 16);
    cHead.writeUInt32LE(rec.size, 20);
    cHead.writeUInt32LE(rec.size, 24);
    cHead.writeUInt16LE(rec.nameBuf.length, 28);
    cHead.writeUInt16LE(0, 30); // extra length
    cHead.writeUInt16LE(0, 32); // comment length
    cHead.writeUInt16LE(0, 34); // disk start
    cHead.writeUInt16LE(0, 36); // internal attr
    cHead.writeUInt32LE(0, 38); // external attr
    cHead.writeUInt32LE(rec.offset, 42); // relative offset

    write(cHead);
    write(rec.nameBuf);
  }
  const centralSize = currentOffset - centralStart;

  // 4. End of Central Directory record
  const eocd = Buffer.alloc(22);
  eocd.write('PK\x05\x06', 0);
  eocd.writeUInt16LE(0, 4);  // disk num
  eocd.writeUInt16LE(0, 6);  // start disk
  eocd.writeUInt16LE(centralRecords.length, 8);  // entries on disk
  eocd.writeUInt16LE(centralRecords.length, 10); // total entries
  eocd.writeUInt32LE(centralSize, 12);          // central directory size
  eocd.writeUInt32LE(centralStart, 16);         // central directory offset
  eocd.writeUInt16LE(0, 20);                    // comment length
  write(eocd);

  out.end();

  return new Promise((resolve, reject) => {
    out.on('finish', () => {
      resolve({
        size: currentOffset,
        sha256: hash.digest('hex'),
      });
    });
    out.on('error', reject);
  });
}

/**
 * Creates an in-memory Buffer of a valid ZIP/APK archive.
 * Safe for serverless environments (read-only file system).
 */
export function generateMockApkBuffer({ packageName, versionName, appName, targetSize = 250_000 }) {
  const manifestContent = Buffer.from(
    `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${packageName}" android:versionName="${versionName}">\n  <application android:label="${appName}"/>\n</manifest>\n`
  );

  const paddingSize = Math.max(1024, targetSize - 2048);
  const paddingChunk = Buffer.alloc(Math.min(paddingSize, 65536), 0x5a);

  function crc32(buf) {
    let crc = ~0;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return ~crc >>> 0;
  }
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }

  const entries = [
    { name: 'AndroidManifest.xml', data: manifestContent },
    { name: 'classes.dex', data: Buffer.from(`DEX\n035\0${packageName}\0${appName}`) },
    { name: 'resources.arsc', data: Buffer.from(`ARSC\0${appName}`) },
  ];

  const chunks = [];
  let currentOffset = 0;
  const centralRecords = [];

  function write(buf) {
    chunks.push(buf);
    currentOffset += buf.length;
  }

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const localHeader = Buffer.alloc(30);
    localHeader.write('PK\x03\x04', 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(size, 18);
    localHeader.writeUInt32LE(size, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    centralRecords.push({ nameBuf, crc, size, offset: currentOffset });
    write(localHeader);
    write(nameBuf);
    write(entry.data);
  }

  const payloadName = Buffer.from('assets/app-resources.dat', 'utf8');
  let payloadCrc = ~0;
  let remaining = paddingSize;
  while (remaining > 0) {
    const chunk = remaining >= paddingChunk.length ? paddingChunk : paddingChunk.subarray(0, remaining);
    for (let i = 0; i < chunk.length; i++) {
      payloadCrc = (payloadCrc >>> 8) ^ table[(payloadCrc ^ chunk[i]) & 0xff];
    }
    remaining -= chunk.length;
  }
  payloadCrc = ~payloadCrc >>> 0;

  const payloadHeader = Buffer.alloc(30);
  payloadHeader.write('PK\x03\x04', 0);
  payloadHeader.writeUInt16LE(20, 4);
  payloadHeader.writeUInt16LE(0, 6);
  payloadHeader.writeUInt16LE(0, 8);
  payloadHeader.writeUInt16LE(0, 10);
  payloadHeader.writeUInt16LE(0, 12);
  payloadHeader.writeUInt32LE(payloadCrc, 14);
  payloadHeader.writeUInt32LE(paddingSize, 18);
  payloadHeader.writeUInt32LE(paddingSize, 22);
  payloadHeader.writeUInt16LE(payloadName.length, 26);
  payloadHeader.writeUInt16LE(0, 28);

  centralRecords.push({ nameBuf: payloadName, crc: payloadCrc, size: paddingSize, offset: currentOffset });
  write(payloadHeader);
  write(payloadName);
  remaining = paddingSize;
  while (remaining > 0) {
    const chunk = remaining >= paddingChunk.length ? paddingChunk : paddingChunk.subarray(0, remaining);
    write(chunk);
    remaining -= chunk.length;
  }

  const centralStart = currentOffset;
  for (const rec of centralRecords) {
    const cHead = Buffer.alloc(46);
    cHead.write('PK\x01\x02', 0);
    cHead.writeUInt16LE(20, 4);
    cHead.writeUInt16LE(20, 6);
    cHead.writeUInt16LE(0, 8);
    cHead.writeUInt16LE(0, 10);
    cHead.writeUInt16LE(0, 12);
    cHead.writeUInt16LE(0, 14);
    cHead.writeUInt32LE(rec.crc, 16);
    cHead.writeUInt32LE(rec.size, 20);
    cHead.writeUInt32LE(rec.size, 24);
    cHead.writeUInt16LE(rec.nameBuf.length, 28);
    cHead.writeUInt16LE(0, 30);
    cHead.writeUInt16LE(0, 32);
    cHead.writeUInt16LE(0, 34);
    cHead.writeUInt16LE(0, 36);
    cHead.writeUInt32LE(0, 38);
    cHead.writeUInt32LE(rec.offset, 42);

    write(cHead);
    write(rec.nameBuf);
  }
  const centralSize = currentOffset - centralStart;

  const eocd = Buffer.alloc(22);
  eocd.write('PK\x05\x06', 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(centralRecords.length, 8);
  eocd.writeUInt16LE(centralRecords.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralStart, 16);
  eocd.writeUInt16LE(0, 20);
  write(eocd);

  return Buffer.concat(chunks);
}
