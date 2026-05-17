# ChatGPT Clone — Edisi MNET

  Clone UI ChatGPT yang dibuat semirip mungkin, menggunakan OpenRouter
  dengan model gratis, dan dibangun memakai React.

  ## Fitur

  - 🎨 UI dark mode mirip ChatGPT: sidebar, chat, settings, dan user
  menu
  - 💬 Chat streaming secara real-time melalui model gratis OpenRouter
  - 🧠 Animasi titik “thinking” saat AI sedang merespons
  - ⚡ Streaming teks langsung dengan cursor berkedip
  - 🌐 UI bahasa Prancis sesuai tampilan screenshot
  - ⚙️ Modal pengaturan lengkap: Général, Notifications,
  Personnalisation, dan lainnya
  - 🔒 Toggle Jailbreak Mode BETA, hanya kosmetik
  - 👤 Profil pengguna: MNET
  - 🗂 Riwayat percakapan dengan fitur hapus

  ## Mulai Cepat

  ```bash
  # 1. Install dependency
  npm install

  # 2. Jalankan dev server
  npm run dev

  # 3. Buka http://localhost:5173

  ## Build untuk Production / Desktop

  # Build
  npm run build

  # Preview hasil build
  npm run preview

  ### Bungkus sebagai Aplikasi Desktop

  Dengan Electron:

  npm install --save-dev electron electron-builder

  Tambahkan ke package.json:

  "main": "electron.js",
  "build": {
    "appId": "com.mnet.chatgpt",
    "productName": "ChatGPT MNET"
  }

  Dengan Tauri, lebih ringan:

  npm create tauri-app

  ## Tech Stack

  - React 18 + Vite
  - OpenRouter API dengan model meta-llama/llama-3.1-8b-instruct:free
  - CSS murni tanpa UI library
  - SSE streaming untuk respons real-time

  ## API

  Menggunakan OpenRouter free tier.

  Model:

  meta-llama/llama-3.1-8b-instruct:free
