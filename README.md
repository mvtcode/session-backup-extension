# Session Backup - Browser Extension

[Tiếng Việt](#tiếng-việt) | [English](#english)

---

<div id="english">

## English

**Session Backup** is a powerful browser extension that allows you to easily backup and restore your browsing session data, including Cookies, LocalStorage, SessionStorage, IndexedDB, and Cache Storage.

### 🌟 Features

- **Backup everything**: Export Cookies, LocalStorage, SessionStorage, IndexedDB, and Cache Storage to a JSON file.
- **Selective Restore**: Choose exactly what you want to restore.
- **Secure Encryption**: Protect your backup files with AES-256 encryption using a custom password.
- **Domain Validation**: Warns the user when trying to restore session data to a different website to prevent accidents.
- **Modern UI**: Sleek, tab-based interface with Dark Mode support.
- **Multi-language**: Supports both English and Vietnamese.

### 💡 Why use Session Backup?

- **Development & Testing**: Easily capture and replicate complex session states for debugging or testing across different environments.
- **Session Sharing**: Share browsing sessions with colleagues without exposing sensitive credentials (passwords) or requiring repetitive OTP verification.
- **Absolute Privacy**: Your session information and security keys are never stored or transmitted to any server. All data processing happens locally on your machine.

### 🚀 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/mvtcode/session-backup-extension.git
   ```
2. Navigate to the project directory:
   ```bash
   cd session-backup-extension
   ```
3. Run `npm install` to install dependencies.
4. Run `npm run build` to build the extension.
5. Open your browser and go to `chrome://extensions/` (or `edge://extensions/`).
6. Enable **Developer mode**.
7. Click **Load unpacked** and select the `dist` folder.

### 📖 How to Use

#### Backup

1. Navigate to the website you want to backup.
2. Open the **Session Backup** popup.
3. Select the data types you want to backup (Cookies, LocalStorage, etc.).
4. (Optional) Enter a password to encrypt the file.
5. Click **Backup Now**.

#### Restore

1. Navigate to the target website.
2. Open the popup and switch to the **Restore** tab.
3. Click **Select backup file** and choose your `.json` backup file.
4. If the file is encrypted, enter the password.
5. Click **Restore Data**.

</div>

---

<div id="tiếng-việt">

## Tiếng Việt

**Session Backup** là một tiện ích mở rộng trình duyệt mạnh mẽ cho phép bạn dễ dàng sao lưu và phục hồi dữ liệu phiên làm việc, bao gồm Cookies, LocalStorage, SessionStorage, IndexedDB và Cache Storage.

### 🌟 Tính năng chính

- **Sao lưu toàn diện**: Xuất Cookies, LocalStorage, SessionStorage, IndexedDB và Cache Storage ra file JSON.
- **Khôi phục tùy chọn**: Chọn chính xác những gì bạn muốn khôi phục.
- **Mã hóa an toàn**: Bảo vệ file sao lưu bằng mã hóa AES-256 với mật khẩu tùy chọn.
- **Cảnh báo tên miền**: Đưa ra cảnh báo khi người dùng cố gắng khôi phục dữ liệu vào sai trang web để tránh nhầm lẫn.
- **Giao diện hiện đại**: Giao diện dạng tab mượt mà, hỗ trợ Chế độ tối (Dark Mode).
- **Đa ngôn ngữ**: Hỗ trợ cả Tiếng Anh và Tiếng Việt.

### 💡 Tại sao nên sử dụng Session Backup?

- **Hỗ trợ Phát triển & Kiểm thử**: Dễ dàng ghi lại và tái hiện các trạng thái phiên phức tạp để phục vụ mục tiêu gỡ lỗi (debug) hoặc kiểm thử trên các môi trường khác nhau.
- **Chia sẻ Phiên làm việc**: Chia sẻ phiên truy cập với đồng nghiệp mà không cần tiết lộ thông tin nhạy cảm (mật khẩu) hoặc yêu cầu xác thực OTP lặp lại.
- **An tâm Tuyệt đối**: Thông tin session và khóa bảo mật của bạn không bao giờ bị lưu trữ hay gửi về bất kỳ máy chủ nào. Mọi quá trình xử lý đều diễn ra cục bộ trên máy tính của bạn.

### 🚀 Cài đặt

1. Clone mã nguồn này về máy:
   ```bash
   git clone https://github.com/mvtcode/session-backup-extension.git
   ```
2. Truy cập vào thư mục dự án:
   ```bash
   cd session-backup-extension
   ```
3. Chạy lệnh `npm install` để cài đặt các thư viện cần thiết.
4. Chạy lệnh `npm run build` để biên dịch extension.
5. Mở trình duyệt và truy cập `chrome://extensions/` (hoặc `edge://extensions/`).
6. Bật **Chế độ dành cho nhà phát triển (Developer mode)**.
7. Nhấn **Tải tiện ích đã giải nén (Load unpacked)** và chọn thư mục `dist`.

### 📖 Hướng dẫn sử dụng

#### Sao lưu

1. Truy cập trang web bạn muốn sao lưu dữ liệu.
2. Mở popup **Session Backup**.
3. Chọn các loại dữ liệu muốn sao lưu (Cookies, LocalStorage, v.v.).
4. (Tùy chọn) Nhập mật khẩu để mã hóa file.
5. Nhấn **Sao lưu ngay**.

#### Phục hồi

1. Truy cập trang web mục tiêu.
2. Mở popup và chuyển sang tab **Phục hồi**.
3. Nhấn **Chọn file backup** và chọn file `.json` đã lưu.
4. Nếu file được mã hóa, hãy nhập mật khẩu tương ứng.
5. Nhấn **Phục hồi dữ liệu**.

</div>

---

## 🛠 Tech Stack

- **Framework**: Vite + TypeScript
- **Styling**: Vanilla CSS
- **Security**: CryptoJS (AES-256)
- **i18n**: Chrome i18n API

## 👤 Author

**Mạc Tân**

- **GitHub**: [mvtcode](https://github.com/mvtcode)
- **Docker Hub**: [tanmv](https://hub.docker.com/u/tanmv)
- **npmjs**: [mvtcode](https://www.npmjs.com/~mvtcode)
- **Facebook**: [Mạc Tân](https://www.facebook.com/mvt.hp.star/)
- **Email**: [macvantan@gmail.com](mailto:macvantan@gmail.com)

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](file:///Users/tanmv/projects/session-backup-extension/LICENSE) file for details.
