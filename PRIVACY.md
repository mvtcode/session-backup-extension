# Privacy Policy

**Effective Date: April 20, 2026**

This Privacy Policy describes how the **Session Backup** browser extension handles your data.

## 1. Data Collection and Usage

**Session Backup** is designed with privacy as the top priority.

- **No Data Collection**: We do not collect, store, or transmit any of your session information, security keys, personal data, or browsing history to any external servers.
- **Local Processing**: All processing (backup and restoration) happens entirely on your local machine within your browser's environment.
- **Data Responsibility**: You are the sole owner of the backup files generated. We recommend using the encryption feature to protect sensitive session data (like login cookies) if you plan to share or store the backup files in insecure locations.

## 2. Permissions Explained

To function correctly, the extension requires the following permissions:

- **`cookies`**: Required to read and write cookies for the websites you choose to backup/restore.
- **`storage`**: Used to save your settings (like language preference and theme).
- **`activeTab`**: Allows the extension to interact with the current website you are viewing.
- **`scripting`**: Required to access and modify `LocalStorage` and `SessionStorage` on the target website.
- **`host_permissions` (`<all_urls>`)**: Necessary because the extension needs to be able to backup and restore session data for any website you choose.

## 3. Security

- **AES-256 Encryption**: When you provide a password for backup, the extension uses industry-standard AES-256 encryption via the `CryptoJS` library to secure your data inside the JSON file.
- **Open Source**: The code is open for audit to ensure that it behaves exactly as described.

## 4. Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be reflected by updating the "Effective Date" at the top of this document.

## 5. Contact

If you have any questions about this privacy policy, you can contact the project maintainer through the repository's issue tracker.
