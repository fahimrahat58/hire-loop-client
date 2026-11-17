# 🚀 HireLoop

### Find Better Jobs. Build Better Careers.

**HireLoop** is a modern full-stack job marketplace platform designed to connect job seekers with recruiters and companies. Users can discover job opportunities, apply for positions, save jobs, manage applications, and access personalized dashboards based on their role.

🔗 **Live Website:** https://hire-loop-client-smoky.vercel.app/

---

## ✨ Features

### 👤 Authentication & Accounts
- Secure user authentication with **Better Auth**
- Email and password sign-up/sign-in
- Role-based account registration
- Job seeker and recruiter roles
- Profile image upload support
- Secure session management
- Logout functionality

### 🔎 Job Search & Discovery
- Browse available job opportunities
- Search jobs by title or company
- View detailed job information
- Explore job requirements and details
- Save jobs for later
- Apply to available positions

### 🧑‍💼 Job Seeker Dashboard
- Personalized seeker dashboard
- View applied jobs
- Track application status
- Manage saved jobs
- Manage profile information
- Update account settings
- Access billing information

### 🏢 Recruiter Dashboard
- Recruiter-specific dashboard
- Create and publish jobs
- Manage existing job postings
- View applicants
- Manage recruiter profile
- Application management
- Recruiter billing and settings

### 🛡️ Admin Dashboard
- Admin overview dashboard
- Manage users
- Manage companies
- Manage jobs
- Review payments
- Admin profile management
- Admin settings

### 💳 Pricing & Billing
- Starter plan
- Growth plan
- Premium plan
- Monthly and yearly billing options
- Pricing comparison
- FAQ section
- Subscription management

### 📊 Dashboard & Analytics
- Interactive dashboard interface
- Application and job-related statistics
- Data visualization with charts
- Role-specific dashboard navigation
- Responsive dashboard layouts

### 📱 Responsive Design
- Mobile-friendly interface
- Tablet support
- Desktop optimized layouts
- Responsive navigation menu
- Mobile dashboard experience

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Lucide React**

### Authentication
- **Better Auth**

### Database
- **MongoDB**

### UI & Components
- **shadcn/ui**
- **Radix/Base UI components**
- **Sonner**
- **Next Themes**

### Data Visualization
- **Recharts**

### Utilities
- **date-fns**
- **class-variance-authority**
- **cmdk**
- **Embla Carousel**
- **Shiki**

### Deployment
- **Vercel**

---

## 📂 Project Structure

```text
hire-loop/
├── app/
│   ├── api/
│   │   └── auth/
│   ├── dashboard/
│   │   ├── admin/
│   │   ├── recruiter/
│   │   ├── seeker/
│   │   └── jobs/
│   ├── jobs/
│   ├── billing/
│   ├── pricing/
│   ├── sign-in/
│   ├── sign-up/
│   ├── lib/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── dashboard/
│   ├── shared/
│   ├── ui/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── pricing.tsx
│   ├── feature.tsx
│   └── site-chrome.tsx
│
├── hooks/
│   ├── use-jobs.ts
│   ├── use-saved-jobs.ts
│   ├── use-seeker-applications.ts
│   └── use-job-feedback.tsx
│
├── lib/
│   ├── highlighter.tsx
│   └── utils.ts
│
├── public/
│
├── next.config.ts
├── package.json
└── README.md
```

The application contains separate dashboard areas for **admin, recruiter, and seeker** users, along with dedicated job, pricing, billing, authentication, and API-related routes.

---

## 🔐 User Roles

HireLoop is designed around three primary user roles:

### 👨‍💻 Job Seeker
Job seekers can:

- Browse jobs
- Search for opportunities
- Apply for jobs
- Save jobs
- Track applications
- Manage their profile
- Manage account settings

### 🧑‍💼 Recruiter
Recruiters can:

- Create job postings
- Manage jobs
- View applicants
- Review applications
- Manage recruiter profiles
- Access recruiter billing and settings

### 👑 Admin
Administrators can:

- Manage users
- Manage companies
- Manage job postings
- Monitor payments
- Manage admin settings

---

## 💰 Pricing Plans

HireLoop includes three subscription levels:

| Plan | Monthly | Yearly |
|------|---------|--------|
| Starter | $0 | $0 |
| Growth | $17 | $13 |
| Premium | $99 | $79 |

### Starter
- Daily AI match brief
- Verified salary bands
- Company insight dashboards
- Unlimited 1-click applications

### Growth
- Everything in Starter
- Advanced AI job matching
- Priority recommendations
- Detailed company insights
- Application tracking
- Priority support

### Premium
- Everything in Growth
- Multi-profile career portfolios
- Shared talent rooms
- Recruiter view
- Advanced career analytics
- Dedicated support

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project

```bash
cd hire-loop
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the root directory.

Example:

```env
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string

NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

> Make sure to use your own production credentials when deploying the application.

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 📜 Available Scripts

```bash
npm run dev
```

Start the development server.

```bash
npm run build
```

Create a production build.

```bash
npm run start
```

Start the production server.

```bash
npm run lint
```

Run ESLint.

```bash
npm run typecheck
```

Run TypeScript type checking.

```bash
npm run format
```

Format TypeScript and TSX files with Prettier.

---

## 🔒 Security

HireLoop uses role-based access patterns and authenticated sessions to protect dashboard functionality.

Protected areas include:

- Admin dashboard
- Recruiter dashboard
- Seeker dashboard
- Application management
- Job management
- Profile settings
- Billing sections

---

## 🎨 UI & UX

HireLoop uses a modern dark interface with:

- Glassmorphism-inspired elements
- Responsive layouts
- Smooth hover states
- Modern cards
- Dashboard navigation
- Interactive forms
- Responsive mobile navigation
- Data visualization
- Accessible UI components

The interface is designed to provide a clean experience for both job seekers and recruiters.

---

## 🚀 Deployment

The application is deployed using **Vercel**.

### Live Demo

👉 https://hire-loop-client-smoky.vercel.app/

---

## 📌 Future Improvements

Possible future improvements include:

- Advanced AI-powered job recommendations
- Resume/CV builder
- Resume parsing
- Interview scheduling
- Real-time recruiter messaging
- Email notifications
- Advanced recruiter analytics
- Job recommendation personalization
- Candidate ranking system
- More payment provider integrations

---

## 👨‍💻 Developer

**Fahim Muntasir Rahat**

Full-Stack Web Developer focused on building modern, responsive, and user-friendly web applications.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**HireLoop — Find opportunities. Build careers.**
