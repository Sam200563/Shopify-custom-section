# Section Builder Studio

A powerful, universal code studio for building, testing, and previewing web sections. Originally designed for Shopify Liquid, it now supports React (JSX) and raw CSS, offering a true "code-to-design" experience.

## 🚀 Features

### 1. Universal Live Preview Engine
The core of the studio is the `DynamicPreview` engine, which automatically detects your code type and mocks the environment:

*   **Shopify Liquid Mode**:
    *   Full schema parsing (settings & blocks).
    *   Simulates `{% for block in section.blocks %}` loops with mock data.
    *   Mocks Shopify filters (`asset_url`, `t`, `money`).
    *   Handles `{% render %}`, `{% form %}`, `{% assign %}` tags.
*   **React Mode (JSX)**:
    *   Auto-detects React components (`export default function...`).
    *   Compiles JSX in the browser using **Babel Standalone**.
    *   Renders components instantly securely sandboxed.
*   **CSS Mode**:
    *   Renders raw CSS in an isolated style playground.

### 2. Live Split-Screen Editor
*   **Real-time Synchronization**: The Upload page features a 50/50 split view. Type code on the left, see the result on the right instantly.
*   **Error Handling**: Graceful error boundaries for runtime JS/Liquid errors.

### 3. Section Library
*   **Static Sections**: Pre-built premium sections (Heroes, Testimonials, etc.).
*   **Custom Sections**: Your uploaded sections are saved to LocalStorage.
*   **Deduplication**: Intelligent store logic prevents duplicate components.

### 4. Single-Block Architecture
*   Sections are stored as single "Block" units (Code + Metadata), mirroring the modern file structure of Shopify 2.0 Themes.

## 🛠 Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Styling**: Tailwind CSS
*   **UI Components**: ShadCN UI + Lucide React
*   **State Management**: Zustand (with LocalStorage persistence)
*   **Sandboxing**: React & Babel Standalone (Client-side compilation)

## 📦 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open Studio**:
    Visit `http://localhost:3000`

## 📝 Usage

### creating a Custom Section
1.  Navigate to **/upload**.
2.  Choose a name (this becomes the `slug`).
3.  Paste your code.
    *   *Tip: Try pasting a standard Shopify Liquid section file.*
    *   *Tip: Try pasting a React component `export default function MyComp() { return <h1>Hi</h1> }`.*
4.  Watch the preview update live.
5.  Click **Create Section** to save it to your library.

## 🤝 Project Structure

*   `app/upload/page.tsx`: The main studio interface.
*   `components/shared/DynamicPreview.tsx`: The heart of the application. Contains the regex parsers, Babel injection, and mock engines.
*   `lib/section-store.ts`: LocalStorage persistence logic.
*   `data/sections.ts`: Registry of pre-built sections.

---
Built with ❤️ by the Section Builder Team.
