# YouTube Clone của Chủ nhân-sama

Một bản clone YouTube hiện đại được phát triển bằng **Next.js, Drizzle ORM**, kết hợp các thư viện UI hiện đại, với khả năng xử lý video nâng cao, phiên âm thời gian thực và giao diện **responsive**.

## Tính Năng Nổi Bật

- 🎥 Trình phát video nâng cao với nhiều tùy chọn chất lượng
- 🎬 Xử lý video thời gian thực với Mux
- 📝 Phiên âm video tự động
- 🖼️ Tạo thumbnail thông minh
- 🤖 AI hỗ trợ tạo tiêu đề và mô tả video
- 📊 Creator Studio với số liệu thống kê
- 🗂️ Quản lý playlist tùy chỉnh
- 📱 Giao diện responsive trên mọi thiết bị
- 🔄 Nhiều feed nội dung khác nhau
- 💬 Hệ thống bình luận tương tác
- 👍 Hệ thống like và đăng ký kênh
- 🎯 Theo dõi lịch sử xem
- 🔐 Xác thực người dùng an toàn
- 📦 Kiến trúc module-based dễ mở rộng
- 🗄️ PostgreSQL với Drizzle ORM
- 🚀 Next.js 15 & React 19
- 🔄 tRPC cho API type-safe
- 💅 TailwindCSS & ShadcnUI cho giao diện

## Công Nghệ Sử Dụng

- **Frontend**: Next.js 15, React 19, TailwindCSS, ShadcnUI
- **Backend**: tRPC, Node.js, Drizzle ORM, PostgreSQL / NeonDB
- **Xử lý video**: Mux
- **AI Features**: OpenAI API (tiêu đề, mô tả, thumbnail)
- **Realtime & Cache**: Upstash Redis & Workflows
- **Authentication**: Clerk

---

## Yêu Cầu Trước Khi Chạy Project

- Node.js 18+ hoặc Bun 1.0+
- PostgreSQL hoặc tài khoản NeonDB
- Tài khoản Mux để xử lý video
- OpenAI API Key cho các tính năng AI
- Upstash account cho Redis và Workflows
- Tài khoản Clerk cho xác thực

---

## Hướng Dẫn Cài Đặt

### Sử dụng Bun (khuyến nghị)

````bash
# Cài đặt dependencies
bun install

# Copy file môi trường
cp .env.example .env

```npm
# Cài đặt dependencies
npm install
# Nếu gặp lỗi, thử:
npm install --legacy-peer-deps

# Copy file môi trường
cp .env.example .env

```BiếnMôiTrường
# Database
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>/<DB_NAME>?sslmode=require&channel_binding=require

# Global
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<CLERK_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<CLERK_SECRET_KEY>

# Mux (Video Processing)
MUX_TOKEN_ID=<MUX_TOKEN_ID>
MUX_TOKEN_SECRET=<MUX_TOKEN_SECRET>
MUX_WEBHOOK_SECRET=<MUX_WEBHOOK_SECRET>

# OpenAI / OpenRouter (AI Features)
OPENROUTER_API_KEY=<OPENROUTER_API_KEY>
OPENROUTER_API_BASE=https://openrouter.ai/api/v1

# Upstash (Redis & Workflows)
UPSTASH_REDIS_REST_URL=<UPSTASH_REDIS_REST_URL>
UPSTASH_REDIS_REST_TOKEN=<UPSTASH_REDIS_REST_TOKEN>
UPSTASH_WORKFLOW_URL=<UPSTASH_WORKFLOW_URL>
QSTASH_TOKEN=<QSTASH_TOKEN>

# Replicate (AI / Model Inference)
REPLICATE_API_KEY=<REPLICATE_API_KEY>

# UploadThing (Upload file / media)
UPLOADTHING_TOKEN=<UPLOADTHING_TOKEN>

```ThiếtLậpDatabase

# Dùng Bun
bun run src/scripts/seed-categories.ts

# Hoặc TSX
tsx src/scripts/seed-categories.ts

```ChạyProject
# Dùng Bun
bun run dev:all

# Dùng npm
npm run dev:all

```TàiNguyênThamKhảo
Next.js Documentation
Drizzle ORM
UploadThing
Mux Video
Clerk Auth
TailwindCSS
ShadcnUI
Radix UI
Upstash

---
````
