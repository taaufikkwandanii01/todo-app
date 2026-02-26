"use client";

import { useEffect } from "react";

/**
 * Menampilkan pesan keamanan custom di browser console —
 * seperti yang dilakukan Facebook, Twitter, dan perusahaan besar lainnya.
 * Ini TIDAK menghilangkan peringatan Chrome, tapi menambahkan konteks
 * yang jelas bahwa aplikasi ini aman dan siapa yang boleh pakai console.
 */
export default function ConsoleMessage() {
  useEffect(() => {
    // Hanya tampil di production agar tidak mengganggu saat development
    if (process.env.NODE_ENV !== "production") return;

    console.log(
      "%c✦ TaskFlow",
      "color: #7c6aff; font-size: 24px; font-weight: 900; font-family: sans-serif;"
    );
    console.log(
      "%cHei! Jika ada yang menyuruh Anda paste sesuatu di sini, itu adalah penipuan.",
      "color: #ff5555; font-size: 13px; font-weight: bold;"
    );
    console.log(
      "%cAplikasi ini aman. Console ini hanya untuk developer.",
      "color: #888; font-size: 12px;"
    );
  }, []);

  return null;
}
