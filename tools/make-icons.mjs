// Renders Susu's app icons procedurally — no image libraries available, so we
// rasterise into an RGBA buffer and encode the PNG by hand (zlib + CRC32).
//
// The mark is the app's own ring: members seated around a circle with one lit
// gold, which is what the product is.

import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------- png ---- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ----------------------------------------------------------- paint ---- */

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const C = {
  bg0: hex("#171033"),
  bg1: hex("#0B0910"),
  // Lifted well off the background: at favicon sizes the unlit seats have to
  // stay visible or the mark collapses to a single gold dot.
  ring: hex("#544678"),
  seat: hex("#3B3160"),
  seatEdge: hex("#7C68B4"),
  gold: hex("#F5C877"),
};

/** Supersampled canvas: draw in float, resolve to 8-bit RGBA at the end. */
function canvas(size, ss = 4) {
  const S = size * ss;
  const buf = new Float64Array(S * S * 4);
  return {
    S,
    ss,
    size,
    px(x, y, [r, g, b], a) {
      if (a <= 0 || x < 0 || y < 0 || x >= S || y >= S) return;
      const i = (y * S + x) * 4;
      const inv = 1 - a;
      buf[i] = buf[i] * inv + r * a;
      buf[i + 1] = buf[i + 1] * inv + g * a;
      buf[i + 2] = buf[i + 2] * inv + b * a;
      buf[i + 3] = buf[i + 3] * inv + 255 * a;
    },
    /** Downsample the supersampled buffer to the final RGBA image. */
    resolve() {
      const out = Buffer.alloc(size * size * 4);
      const n = ss * ss;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          let r = 0, g = 0, b = 0, a = 0;
          for (let dy = 0; dy < ss; dy++) {
            for (let dx = 0; dx < ss; dx++) {
              const i = ((y * ss + dy) * S + (x * ss + dx)) * 4;
              r += buf[i]; g += buf[i + 1]; b += buf[i + 2]; a += buf[i + 3];
            }
          }
          const o = (y * size + x) * 4;
          out[o] = Math.round(r / n);
          out[o + 1] = Math.round(g / n);
          out[o + 2] = Math.round(b / n);
          out[o + 3] = Math.round(a / n);
        }
      }
      return out;
    },
  };
}

const disc = (c, cx, cy, r, color, alpha = 1) => {
  const x0 = Math.max(0, Math.floor(cx - r - 1)), x1 = Math.min(c.S - 1, Math.ceil(cx + r + 1));
  const y0 = Math.max(0, Math.floor(cy - r - 1)), y1 = Math.min(c.S - 1, Math.ceil(cy + r + 1));
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) c.px(x, y, color, alpha);
};

const annulus = (c, cx, cy, r, w, color, alpha = 1) => {
  const outer = r + w / 2, inner = r - w / 2;
  const x0 = Math.max(0, Math.floor(cx - outer - 1)), x1 = Math.min(c.S - 1, Math.ceil(cx + outer + 1));
  const y0 = Math.max(0, Math.floor(cy - outer - 1)), y1 = Math.min(c.S - 1, Math.ceil(cy + outer + 1));
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d <= outer && d >= inner) c.px(x, y, color, alpha);
    }
};

/** Soft radial falloff, used for the gold seat's glow. */
const glow = (c, cx, cy, r, color, peak) => {
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(c.S - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(c.S - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d < r) c.px(x, y, color, peak * Math.pow(1 - d / r, 2.2));
    }
};

/**
 * The mark. `bg` false leaves the background transparent (Android foreground,
 * splash); `mono` renders flat white for the Android monochrome layer.
 */
function drawIcon(size, { bg = true, scale = 1, mono = false } = {}) {
  const c = canvas(size, 4);
  const S = c.S, mid = S / 2;

  if (bg) {
    // Diagonal wash so the tile has depth instead of reading as flat black.
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const t = (x / S + y / S) / 2;
        c.px(x, y, [
          C.bg0[0] + (C.bg1[0] - C.bg0[0]) * t,
          C.bg0[1] + (C.bg1[1] - C.bg0[1]) * t,
          C.bg0[2] + (C.bg1[2] - C.bg0[2]) * t,
        ], 1);
      }
  }

  const R = S * 0.29 * scale;   // ring radius
  const seat = S * 0.093 * scale; // seat radius
  const white = [255, 255, 255];

  annulus(c, mid, mid, R, S * 0.011 * scale, mono ? white : C.ring, mono ? 0.55 : 1);

  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = mid + R * Math.cos(a), y = mid + R * Math.sin(a);
    const lit = i === 0; // the member collecting this round

    if (mono) {
      disc(c, x, y, seat, white, lit ? 1 : 0.55);
      continue;
    }
    if (lit) {
      glow(c, x, y, seat * 2.6, C.gold, 0.5);
      disc(c, x, y, seat, C.gold);
    } else {
      disc(c, x, y, seat, C.seatEdge);
      disc(c, x, y, seat - S * 0.006 * scale, C.seat);
    }
  }
  return { c, buf: c.resolve() };
}

/* ------------------------------------------------------------ write ---- */

const out = process.argv[2];
if (!out) throw new Error("usage: make-icons.mjs <assets-dir>");

const write = (name, size, opts) => {
  const { buf } = drawIcon(size, opts);
  const file = path.join(out, name);
  fs.writeFileSync(file, encodePNG(size, size, buf));
  console.log(`${name.padEnd(32)} ${size}x${size}  ${(fs.statSync(file).size / 1024).toFixed(1)}kb`);
};

write("icon.png", 1024, {});
write("splash-icon.png", 512, { bg: false, scale: 1.0 });
write("favicon.png", 64, {});
write("android-icon-foreground.png", 1024, { bg: false, scale: 0.62 });
write("android-icon-monochrome.png", 1024, { bg: false, scale: 0.62, mono: true });

// Android's background layer is a flat wash behind the foreground.
{
  const size = 1024, c = canvas(size, 1);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const t = (x / size + y / size) / 2;
      c.px(x, y, [
        C.bg0[0] + (C.bg1[0] - C.bg0[0]) * t,
        C.bg0[1] + (C.bg1[1] - C.bg0[1]) * t,
        C.bg0[2] + (C.bg1[2] - C.bg0[2]) * t,
      ], 1);
    }
  fs.writeFileSync(path.join(out, "android-icon-background.png"), encodePNG(size, size, c.resolve()));
  console.log("android-icon-background.png".padEnd(32) + " 1024x1024");
}
