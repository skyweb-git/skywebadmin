# Skyweb Private Limited — Admin Control Console

Modern, high-performance Management Console for Skyweb with seamless MongoDB & Cloudinary synchronization.

---

## 🚀 Quick Start

### 1. Ensure Backend is Running
The backend must run on port `5000`:
```bash
cd "c:\skyweb projects\skyweb\skyweb\backend"
npm start
# or npm run dev
```

### 2. Start the Admin App
The Admin App is configured to run on port `3001` so it doesn't conflict with the client frontend (`3000`):
```bash
cd "c:\skyweb projects\skyweb\skyweb\admin-app"
npm install
npm start
```
Then visit: **`http://localhost:3001`**

---

## 🎛 Features & Capabilities

1. **📊 Telemetry & Overview**: Real-time stats across all collections, conversion ratios, system health probes.
2. **🖼 Gallery Studio**: Upload exhibits directly to Cloudinary CDN, delete items (destroys in Cloudinary + MongoDB), update titles/categories/featured status.
3. **💼 Projects Showcase**: Full CRUD management of case studies, tech stacks, live deployment URLs, completion status, and progress metrics.
4. **📬 Lead Inbox & CRM**: Client inquiries manager with status filters (`New`, `In Review`, `Contacted`, `Archived`), 1-click status transitions, and direct mailto actions.
5. **⚙️ Services Matrix**: Manage service offerings, pricing tiers, badges, and capability lists.
6. **👥 Team & Founders**: Manage team profiles, avatars, roles, social links, and quotes.
7. **❓ Knowledge Base / FAQs**: Manage categorized FAQ questions, answers, and display orders.
8. **🛠 Diagnostic Center**: Check MongoDB connection status, Cloudinary CDN integration, and configure API gateway endpoint.

---

## 🌐 Network Ports Architecture
- **Client App (Skyweb Website)**: `http://localhost:3000`
- **Admin App (Skyweb Console)**: `http://localhost:3001`
- **Backend REST API**: `http://localhost:5000/api`
