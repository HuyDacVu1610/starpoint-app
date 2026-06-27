<p align="center">
  <img src="https://img.shields.io/badge/StarPointApp-v1.0.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/NestJS-v11-ea2845?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/React-v19-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Prisma-v7-2d3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker" alt="Docker" />
</p>

# 🏆 StarPointApp — Hệ thống Quản lý Điểm thưởng & Thành tích Sinh viên

**StarPointApp** là hệ thống quản lý điểm thưởng, thành tích thi đấu và xét duyệt học bổng dành cho sinh viên tại các cơ sở giáo dục đại học. Hệ thống hỗ trợ 3 vai trò người dùng: **Admin**, **Nhân viên (Staff)**, và **Sinh viên (Student)** — với quy trình phân quyền RBAC linh hoạt, giao diện hiện đại, hỗ trợ cả chế độ sáng (Light Mode) lẫn tối (Dark Mode).

---

## 📋 Mục lục

- [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Tính năng chính](#-tính-năng-chính)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Khởi chạy](#-cài-đặt--khởi-chạy)
  - [Chạy bằng Docker (Khuyến nghị)](#-chạy-bằng-docker-khuyến-nghị)
  - [Chạy thủ công (Development)](#️-chạy-thủ-công-development)
- [Biến môi trường](#-biến-môi-trường)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [Kiểm thử](#-kiểm-thử)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)

---

## 🏗 Tổng quan kiến trúc

```
┌─────────────────────┐     ┌─────────────────────┐
│     Frontend         │     │      Backend         │
│  React + Vite + TS   │◄───►│  NestJS + Prisma     │
│  Ant Design + Redux  │     │  REST API + JWT      │
│  Port: 80            │     │  Port: 3001          │
└─────────────────────┘     └──────────┬────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
             ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
             │   MySQL 8   │   │  Redis 7    │   │ RabbitMQ 3  │
             │  Port: 3307 │   │  Port: 6379 │   │  Port: 5672 │
             │  Database   │   │  Cache      │   │  Message Q  │
             └─────────────┘   └─────────────┘   └─────────────┘
```

Hệ thống sử dụng kiến trúc **Monorepo** với 3 workspace:
- **`shared/`** — Các kiểu dữ liệu, enum, interface dùng chung giữa frontend và backend.
- **`backend/`** — API server (NestJS), xử lý nghiệp vụ, xác thực JWT, ORM Prisma.
- **`frontend/`** — Giao diện người dùng SPA (React + Vite), quản lý state bằng Redux Toolkit.

---

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Ant Design 5, Redux Toolkit, TailwindCSS |
| **Backend** | NestJS 11, TypeScript, Prisma ORM 7, Passport JWT |
| **Database** | MySQL 8.0 (qua MariaDB adapter) |
| **Cache** | Redis 7 (Alpine) |
| **Message Queue** | RabbitMQ 3 (Management Alpine) |
| **Email** | Nodemailer (SMTP — Gmail App Password) |
| **Containerization** | Docker, Docker Compose |
| **Testing** | Jest, Supertest (E2E) |
| **Shared** | TypeScript package chia sẻ enums/interfaces |

---

## ✨ Tính năng chính

### 🔐 Xác thực & Phân quyền
- Đăng nhập/đăng xuất bằng JWT (Access Token + Refresh Token).
- Quên mật khẩu qua OTP email (6 chữ số, thời hạn 15 phút).
- Hệ thống phân quyền RBAC (Role-Based Access Control): Admin, Staff, Student.
- Quản lý vai trò (Role) và quyền hạn (Permission) chi tiết theo từng chức năng.

### 📊 Dashboard
- Bảng điều khiển tổng quan hiển thị thống kê: tổng sinh viên, cuộc thi, thành tích, học bổng.
- Biểu đồ phân bố xếp loại GPA, học lực, hạnh kiểm.
- Thông báo hệ thống từ quản trị viên.

### 🎓 Quản lý Sinh viên
- Danh sách sinh viên, tìm kiếm và lọc nâng cao.
- Thêm/sửa/xóa (soft delete) tài khoản sinh viên.
- Xem chi tiết hồ sơ sinh viên: thông tin cá nhân, điểm học kỳ, thành tích.

### 📅 Quản lý Học kỳ
- Tạo và quản lý học kỳ với năm học, số kỳ, ngày bắt đầu/kết thúc.
- Kiểm tra trùng lặp tự động.

### 🏅 Quản lý Cuộc thi
- Tạo và quản lý danh sách cuộc thi (cấp Trung ương / cấp Học viện).
- Liên kết cuộc thi với học kỳ tương ứng.

### 🏆 Quản lý Thành tích
- Khai báo thành tích: cuộc thi, tham gia tổ chức, thành tích đặc biệt.
- Xếp hạng giải thưởng: Nhất, Nhì, Ba, Không xếp hạng.
- Quy trình duyệt/từ chối thành tích (trạng thái: Chờ duyệt → Đã duyệt / Từ chối).
- Đính kèm minh chứng (upload file).

### 📈 Điểm thưởng & Điểm mở rộng
- Import điểm học kỳ (GPA, hạnh kiểm) từ file Excel (.xlsx).
- Tự động tính điểm thưởng tối đa từ các thành tích đã duyệt.
- Tính điểm mở rộng: `extendedGpa = gpa + maxBonusPoint`.

### 🎖 Xét duyệt Học bổng
- Tự động xét duyệt ứng viên học bổng dựa trên điểm mở rộng, hạnh kiểm, và xếp loại GPA.
- Phân loại mức học bổng: Xuất sắc, Giỏi, Khá.
- Xuất danh sách học bổng.

### 👨‍🎓 Giao diện Sinh viên
- Xem thành tích cá nhân, khai báo thành tích mới.
- Xem điểm thưởng, điểm mở rộng theo từng học kỳ.
- Theo dõi tình trạng học bổng.

### 🌙 Giao diện & Trải nghiệm
- Giao diện Light Mode / Dark Mode toàn hệ thống.
- Thiết kế split-screen hiện đại cho các trang xác thực (Đăng nhập, Quên mật khẩu).
- Responsive trên desktop và mobile.
- Bảng dữ liệu có phân trang, tìm kiếm, sắp xếp.

### 📝 Nhật ký hoạt động (Audit Log)
- Ghi nhận mọi thao tác quan trọng của người dùng trong hệ thống.
- Truy vết theo module, hành động, thời gian.

---

## 📁 Cấu trúc thư mục

```
CNPM/
├── shared/                    # Package dùng chung (enums, interfaces)
│   └── src/
│       ├── enums/
│       └── interfaces/
│
├── backend/                   # NestJS API Server
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Migration files
│   │   └── seed.ts            # Dữ liệu mẫu ban đầu
│   ├── src/
│   │   ├── auth/              # Xác thực (Login, JWT, Forgot Password)
│   │   ├── users/             # Quản lý người dùng
│   │   ├── roles/             # Quản lý vai trò
│   │   ├── permissions/       # Quản lý quyền hạn
│   │   ├── semesters/         # Quản lý học kỳ
│   │   ├── competitions/      # Quản lý cuộc thi
│   │   ├── achievements/      # Quản lý thành tích
│   │   ├── scores/            # Điểm học kỳ & điểm thưởng
│   │   ├── scholarships/      # Xét duyệt học bổng
│   │   ├── dashboard/         # Dashboard & thống kê
│   │   ├── upload/            # Upload file minh chứng
│   │   ├── audit-log/         # Nhật ký hệ thống
│   │   └── prisma/            # PrismaService
│   ├── test/                  # E2E test suites
│   └── Dockerfile
│
├── frontend/                  # React SPA Client
│   ├── src/
│   │   ├── components/        # UI components tái sử dụng
│   │   ├── features/          # Redux slices (auth, theme)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layouts/           # AdminLayout, StudentLayout
│   │   ├── pages/             # Các trang giao diện
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── achievements/
│   │   │   ├── bonus-points/
│   │   │   ├── competitions/
│   │   │   ├── scholarships/
│   │   │   ├── semesters/
│   │   │   ├── students/
│   │   │   └── student/       # Giao diện dành cho sinh viên
│   │   ├── routes/            # Routing & ProtectedRoute
│   │   ├── services/          # API service layer (Axios)
│   │   └── store/             # Redux store config
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml         # Production Docker Compose
├── docker-compose.dev.yml     # Development override
├── .env.docker.example        # Mẫu biến môi trường
└── package.json               # Root workspace config
```

---

## 💻 Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|-----------|---------------------|
| **Node.js** | v22.x trở lên |
| **npm** | v10.x trở lên |
| **Docker** | v24.x trở lên |
| **Docker Compose** | v2.x trở lên |
| **Git** | v2.x trở lên |

---

## 🚀 Cài đặt & Khởi chạy

### 1. Clone dự án

```bash
git clone https://github.com/HuyDacVu1610/starpoint-app.git
cd starpoint-app
```

### 🐳 Chạy bằng Docker (Khuyến nghị)

Đây là cách đơn giản nhất — chỉ cần Docker, không cần cài Node.js hay MySQL thủ công.

#### Bước 1: Tạo file biến môi trường

```bash
cp .env.docker.example .env
```

Mở file `.env` và cập nhật thông tin SMTP email (để chức năng quên mật khẩu hoạt động):

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM="StarPoint Support <noreply@starpoint.edu.vn>"
```

> **💡 Lưu ý:** Sử dụng [App Password](https://support.google.com/accounts/answer/185833) của Gmail, không phải mật khẩu thường.

#### Bước 2: Build và khởi chạy

```bash
docker compose up -d --build
```

Quá trình này sẽ tự động:
- Tạo container MySQL, Redis, RabbitMQ.
- Build và khởi chạy Backend (NestJS) trên port `3001`.
- Build và khởi chạy Frontend (React/Nginx) trên port `80`.
- Chạy migration và seed dữ liệu mẫu.

#### Bước 3: Truy cập ứng dụng

| Dịch vụ | URL |
|---------|-----|
| 🌐 **Frontend** | [http://localhost](http://localhost) |
| 🔗 **Backend API** | [http://localhost:3001](http://localhost:3001) |
| 🐰 **RabbitMQ Management** | [http://localhost:15672](http://localhost:15672) (guest/guest) |

#### Các lệnh Docker hữu ích

```bash
# Xem logs
docker compose logs -f backend
docker compose logs -f frontend

# Dừng hệ thống
docker compose down

# Dừng và xóa toàn bộ dữ liệu (volumes)
docker compose down -v

# Rebuild sau khi sửa code
docker compose up -d --build
```

---

### 🛠️ Chạy thủ công (Development)

Phương pháp này phù hợp khi bạn muốn phát triển và debug trực tiếp trên máy.

#### Bước 1: Cài đặt dependencies

```bash
# Tại thư mục gốc (root)
npm install
```

> Lệnh này sẽ cài đặt đồng thời cho cả 3 workspace: `shared`, `backend`, `frontend`.

#### Bước 2: Khởi động cơ sở hạ tầng

Bạn cần có MySQL, Redis, và RabbitMQ đang chạy. Cách nhanh nhất là dùng Docker chỉ cho phần infra:

```bash
docker compose up -d mysql redis rabbitmq
```

#### Bước 3: Cấu hình biến môi trường cho Backend

```bash
cp backend/.env.example backend/.env
```

Chỉnh sửa file `backend/.env`:

```env
PORT=3000
DATABASE_URL="mysql://root:161005@localhost:3307/starpoint_db"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
REDIS_URL="redis://localhost:6379"
RABBITMQ_URL="amqp://localhost:5672"
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
```

#### Bước 4: Khởi tạo database

```bash
# Generate Prisma Client
cd backend
npx prisma generate

# Chạy migration
npx prisma migrate deploy

# Seed dữ liệu mẫu
npx prisma db seed
```

#### Bước 5: Build shared package

```bash
# Tại thư mục gốc
npm run build -w @starpointapp/shared
```

#### Bước 6: Khởi chạy Backend

```bash
npm run start:dev -w backend
```

Backend sẽ chạy tại: `http://localhost:3000`

#### Bước 7: Khởi chạy Frontend

Mở terminal mới:

```bash
npm run dev -w frontend
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🔐 Biến môi trường

### File `.env` (Root — cho Docker Compose)

| Biến | Mô tả | Ví dụ |
|------|--------|-------|
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USER` | Email gửi OTP | `example@gmail.com` |
| `MAIL_PASS` | App password Gmail | `xxxx xxxx xxxx xxxx` |
| `MAIL_FROM` | Tên hiển thị email | `"StarPoint Support <noreply@starpoint.edu.vn>"` |

### File `backend/.env` (cho chạy thủ công)

| Biến | Mô tả |
|------|--------|
| `PORT` | Port backend (mặc định: `3000`) |
| `DATABASE_URL` | Connection string MySQL |
| `JWT_SECRET` | Secret key cho JWT Access Token |
| `JWT_REFRESH_SECRET` | Secret key cho JWT Refresh Token |
| `REDIS_URL` | Connection string Redis |
| `RABBITMQ_URL` | Connection string RabbitMQ |
| `MAIL_*` | Cấu hình SMTP (tương tự bảng trên) |

---

## 👤 Tài khoản mặc định

Sau khi chạy seed, hệ thống tạo sẵn các tài khoản sau:

| Vai trò | Mã số (Username) | Mật khẩu | Ghi chú |
|---------|-------------------|-----------|---------|
| **Admin** | `ADMIN001` | `password123` | Toàn quyền quản trị hệ thống |
| **Staff** | `STAFF001` | `password123` | Quản lý nghiệp vụ |
| **Student** | `SV001` | `password123` | Tài khoản sinh viên mẫu |
| **Student** | `SV002` | `password123` | Tài khoản sinh viên mẫu |

> ⚠️ **Lưu ý:** Hãy đổi mật khẩu mặc định ngay khi triển khai vào môi trường thực tế.

---

## 🧪 Kiểm thử

### Chạy E2E Tests (Backend)

```bash
cd backend
npm run test:e2e
```

Hệ thống có **8 bộ test E2E** bao phủ:

| Test Suite | Nội dung |
|------------|----------|
| `auth.e2e-spec.ts` | Đăng nhập, JWT, Refresh Token, Quên mật khẩu |
| `rbac-users.e2e-spec.ts` | CRUD người dùng, phân quyền |
| `core-modules.e2e-spec.ts` | Học kỳ, Cuộc thi, Thành tích |
| `scores.e2e-spec.ts` | Import điểm, tính điểm thưởng |
| `scholarships.e2e-spec.ts` | Xét duyệt học bổng |
| `dashboard.e2e-spec.ts` | Dashboard thống kê |
| `upload.e2e-spec.ts` | Upload file minh chứng |
| `infrastructure.e2e-spec.ts` | Health check, Redis, RabbitMQ |

### Kết quả mong đợi

```
Test Suites: 8 passed, 8 total
Tests:       62 passed, 62 total
```

---

## 📖 Hướng dẫn sử dụng

### 1. Đăng nhập

- Truy cập `http://localhost` → Trang đăng nhập hiện ra.
- Nhập **Mã số sinh viên / Mã người dùng** và **Mật khẩu**.
- Hệ thống tự động chuyển hướng đến Dashboard tương ứng theo vai trò.

### 2. Quên mật khẩu

- Tại trang đăng nhập, nhấn **"Quên mật khẩu?"**.
- **Bước 1:** Nhập mã số sinh viên và email đã đăng ký → Nhấn **"Gửi mã xác nhận"**.
- **Bước 2:** Nhập mã OTP 6 chữ số nhận được trong email → Nhấn **"Xác thực mã"**.
- **Bước 3:** Nhập mật khẩu mới và xác nhận → Nhấn **"Đặt lại mật khẩu"**.

### 3. Admin / Staff — Quản lý hệ thống

Sau khi đăng nhập với tài khoản Admin hoặc Staff:

| Menu | Chức năng |
|------|-----------|
| **Dashboard** | Xem tổng quan thống kê, biểu đồ |
| **Quản lý Sinh viên** | Thêm/sửa/xóa sinh viên, xem chi tiết hồ sơ |
| **Quản lý Học kỳ** | Tạo/sửa/xóa học kỳ |
| **Quản lý Cuộc thi** | Tạo/sửa/xóa cuộc thi gắn với học kỳ |
| **Quản lý Thành tích** | Xem/duyệt/từ chối thành tích sinh viên khai báo |
| **Điểm thưởng** | Import điểm từ Excel, tính toán điểm thưởng và điểm mở rộng |
| **Học bổng** | Xét duyệt và xem danh sách ứng viên học bổng |

### 4. Sinh viên — Theo dõi cá nhân

Sau khi đăng nhập với tài khoản Student:

| Menu | Chức năng |
|------|-----------|
| **Thành tích của tôi** | Xem danh sách thành tích, khai báo thành tích mới |
| **Điểm thưởng** | Xem điểm GPA, điểm thưởng, điểm mở rộng theo học kỳ |
| **Học bổng** | Theo dõi tình trạng xét duyệt học bổng |

### 5. Chuyển đổi Light / Dark Mode

- Nhấn biểu tượng 🌙/☀️ trên góc phải của trang đăng nhập hoặc trong thanh header.
- Chế độ được lưu và duy trì xuyên suốt phiên làm việc.

---

<p align="center">
  Made with ❤️ by <strong>StarPoint Team</strong>
</p>
