import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { renderCyberTheme } from "../lib/audio/renderTheme";

function writeWav(file: string, left: Float32Array, right: Float32Array, sampleRate: number) {
  const frames = left.length;
  const buffer = Buffer.alloc(44 + frames * 4);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + frames * 4, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(frames * 4, 40);
  for (let i = 0; i < frames; i += 1) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buffer.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buffer.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  writeFileSync(file, buffer);
}

const started = Date.now();
const rendered = renderCyberTheme(44100);
console.log(`rendered ${rendered.left.length} frames in ${Date.now() - started}ms`);
writeWav("/tmp/powertech-theme.wav", rendered.left, rendered.right, 44100);
const encoded = spawnSync(
  "ffmpeg",
  ["-y", "-i", "/tmp/powertech-theme.wav", "-codec:a", "libmp3lame", "-b:a", "160k", "public/cyberpunk-theme.mp3"],
  { stdio: "inherit" },
);
if (encoded.status !== 0) process.exit(encoded.status ?? 1);
