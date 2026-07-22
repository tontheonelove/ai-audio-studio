import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🌐 อนุญาตทุก origin ใน DEV mode (FC รัน dev จาก IP/hostname ไหนก็ได้)
  allowedDevOrigins: ["*"],

  // 🙈 ซ่อนไอคอน N (Next.js dev indicator) ใน dev
  devIndicators: false,
};

export default nextConfig;