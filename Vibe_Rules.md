# Vibe Coding Master Checklist: Microservice Website

A checklist of everything to remember (and tell your AI) when building a full website made of multiple microservices. Copy the relevant sections into your prompts so the AI never has to guess.

## How to use this doc

- Work top to bottom. Phases 1 to 3 should be decided **before** you write any code.
- Paste the relevant section into your prompt, e.g. "Implement auth following this checklist: ..."
- Tick items off with ☐ → ✅ as you go.
- Keep a `PROJECT_RULES.md` (or `CLAUDE.md`) in your repo with your decisions so the AI remembers them every session.

---

## Phase 1: Product and planning

- ☐ One-paragraph description of what the product does and who it is for
- ☐ List of user roles (guest, user, admin, moderator, etc.)
- ☐ List of core features for v1 (and a separate "later" list)
- ☐ User flows written out (sign up → onboarding → main action → logout)
- ☐ Tech stack chosen and fixed (frontend framework, backend language, DB, hosting). Tell the AI: "Do not introduce new libraries without asking."
- ☐ Naming conventions (files, folders, API routes, DB tables, env vars)
- ☐ Folder/monorepo structure decided
- ☐ Git workflow: branches, commit message style, never commit secrets

## Phase 2: Microservices architecture

- ☐ List every service and what it owns (e.g. auth, users, payments, notifications, content, files)
- ☐ Each service owns its own database/schema (no shared tables)
- ☐ API gateway or single entry point for the frontend
- ☐ How services talk: REST, gRPC, or message queue/events (pick one default)
- ☐ Service-to-service authentication (internal tokens, mTLS, or signed requests)
- ☐ Shared contracts: API specs (OpenAPI), shared types, versioning (`/v1/`)
- ☐ Consistent error format across all services (code, message, details, request ID)
- ☐ Consistent response/pagination format
- ☐ Timeouts, retries, and circuit breakers for service calls
- ☐ Idempotency for anything that can be retried (payments, emails)
- ☐ Health check endpoint in every service (`/health`, `/ready`)
- ☐ Config via environment variables, with a documented `.env.example` per service
- ☐ Local development setup (Docker Compose to run everything with one command)
- ☐ Service discovery/networking decided (Docker network, Kubernetes, etc.)
- ☐ Background jobs and queues (emails, reports, cleanups)
- ☐ Event/log correlation: a request ID passed through every service

## Phase 3: Authentication and authorization

- ☐ Sign up with email + password
- ☐ Email verification flow
- ☐ Login, logout, "remember me"
- ☐ Forgot password and reset password (expiring one-time tokens)
- ☐ Change password and change email
- ☐ Password rules and hashing (bcrypt/argon2, never plain text)
- ☐ Social login (Google, GitHub, etc.) if needed
- ☐ Two-factor authentication (TOTP/SMS/email) if needed
- ☐ Session strategy: JWT access token + refresh token, or server sessions
- ☐ Tokens stored safely (httpOnly, secure, sameSite cookies; avoid localStorage for tokens)
- ☐ Token expiry, refresh rotation, and revoke-on-logout
- ☐ Rate limiting and lockout on login, signup, and reset endpoints
- ☐ Role-based access control (RBAC) enforced **on the backend**, not just hidden in the UI
- ☐ Protected routes on the frontend plus redirect to login and back
- ☐ Account deletion and data export
- ☐ Admin user creation process (never hardcode admin credentials)
- ☐ Audit log for sensitive actions (login, password change, role change)
- ☐ Clear, non-leaky error messages (do not reveal whether an email exists)
- ☐ Bot protection (CAPTCHA) on public forms

## Phase 4: UI / UX

### Design foundation

- ☐ Design system defined: colors, fonts, spacing scale, border radius, shadows
- ☐ Component library chosen (shadcn/ui, MUI, Tailwind, etc.) and used consistently
- ☐ Reusable components: button, input, modal, toast, dropdown, table, card, tabs
- ☐ Light and dark mode
- ☐ Fully responsive: mobile, tablet, desktop (mobile-first)
- ☐ Logo, favicon, and app icons

### States the AI often forgets

- ☐ Loading states (skeletons/spinners)
- ☐ Empty states ("No items yet" with a call to action)
- ☐ Error states with a retry option
- ☐ Success feedback (toasts/confirmations)
- ☐ Disabled and in-progress button states (prevent double submit)
- ☐ 404 page, 500 page, and "no permission" (403) page
- ☐ Offline/network error handling
- ☐ Session expired handling

### Forms

- ☐ Client-side and server-side validation (never trust the client)
- ☐ Inline error messages next to the field
- ☐ Show/hide password, autofill support, correct input types
- ☐ Confirmation dialogs for destructive actions

### Navigation and layout

- ☐ Header/navbar with logged-in and logged-out versions
- ☐ Footer with legal and social links
- ☐ Mobile menu
- ☐ Breadcrumbs or clear back navigation
- ☐ Search, filters, sorting, pagination where lists exist
- ☐ User settings/profile area
- ☐ Onboarding flow for new users

## Phase 5: Pages checklist

### Public pages

- ☐ Home / landing page (hero, value proposition, features, social proof, call to action)
- ☐ About page
- ☐ Pricing page (if applicable)
- ☐ Features / How it works
- ☐ Contact page (form + email)
- ☐ FAQ / Help center
- ☐ Blog / Changelog (optional)
- ☐ Careers / Team (optional)

### Legal pages

- ☐ Privacy Policy
- ☐ Terms of Service
- ☐ Cookie Policy and cookie consent banner (needed for EU/UK visitors)
- ☐ Refund / Cancellation Policy (if you take payments)
- ☐ Acceptable Use Policy (if users post content)
- ☐ Disclaimer (if relevant)
- ☐ Checkbox on signup: "I agree to the Terms and Privacy Policy" (store the timestamp)
- ☐ Have a lawyer or a reputable generator review these before launch

### Auth pages

- ☐ Sign up, Login, Forgot password, Reset password, Verify email

### App pages

- ☐ Dashboard
- ☐ Profile and Settings (account, security, notifications, billing)
- ☐ Feature-specific pages (list, detail, create, edit)
- ☐ Notifications page
- ☐ Admin panel (users, content, analytics, logs)

### System pages

- ☐ 404, 500, 403, Maintenance page
- ☐ Email-sent confirmation pages
- ☐ Payment success/failure pages

## Phase 6: Backend and API

- ☐ RESTful, consistent route naming and HTTP status codes
- ☐ Input validation on every endpoint (schemas like Zod, Pydantic, Joi)
- ☐ Pagination, filtering, sorting on list endpoints
- ☐ Rate limiting per IP and per user
- ☐ CORS configured to specific origins only
- ☐ File uploads: size and type limits, virus scan, storage in S3/R2 not on the server disk
- ☐ Soft delete vs hard delete decision
- ☐ Transactions for multi-step writes
- ☐ Centralized error handling middleware
- ☐ API documentation (Swagger/OpenAPI) generated automatically
- ☐ Webhooks (sending and receiving) with signature verification
- ☐ Scheduled jobs (cron) for cleanups, reminders, reports

## Phase 7: Database and data

- ☐ Schema design reviewed before coding (tables, relations, constraints)
- ☐ Migrations tool used; never edit the DB by hand
- ☐ Indexes on frequently queried and foreign key columns
- ☐ Created/updated timestamps on every table
- ☐ Unique constraints (e.g. email)
- ☐ Seed data for development
- ☐ Backups, automated and tested for restore
- ☐ Caching layer (Redis) where needed
- ☐ Search (Postgres full text, Elasticsearch, Meilisearch) if needed
- ☐ Data retention rules

## Phase 8: Security

- ☐ HTTPS everywhere, HSTS enabled
- ☐ Secrets in environment variables or a secrets manager; never in code or Git
- ☐ `.gitignore` includes `.env`, keys, and credentials
- ☐ Protection against SQL injection (use ORM/parameterized queries)
- ☐ Protection against XSS (sanitize and escape user content)
- ☐ CSRF protection if using cookies
- ☐ Security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- ☐ Authorization check on every resource (users must not access other users' data by changing an ID)
- ☐ Dependency vulnerability scanning (npm audit, Dependabot)
- ☐ No sensitive data in logs or error messages
- ☐ Encryption for sensitive fields at rest
- ☐ Least-privilege access for services and DB users
- ☐ Admin routes extra protected
- ☐ Regular secret rotation plan

## Phase 9: Integrations

- ☐ Transactional email (Resend, SendGrid, SES): templates, SPF/DKIM/DMARC set up
- ☐ Payments (Stripe/Razorpay): checkout, subscriptions, webhooks, invoices, failed payment handling, taxes (GST/VAT)
- ☐ Push/in-app/email notifications with user preferences
- ☐ File storage and CDN
- ☐ Analytics (Plausible, GA, PostHog)
- ☐ Customer support chat or helpdesk
- ☐ Third-party API keys isolated per environment
- ☐ Fallback behaviour when a third-party service is down

## Phase 10: Performance and SEO

- ☐ Image optimization, lazy loading, modern formats (WebP/AVIF)
- ☐ Code splitting and lazy-loaded routes
- ☐ Caching headers and CDN
- ☐ Database query optimization (avoid N+1 queries)
- ☐ Meta titles, descriptions, Open Graph and Twitter cards on every public page
- ☐ `sitemap.xml` and `robots.txt`
- ☐ Semantic HTML and proper heading structure
- ☐ Server-side rendering or static generation for public pages
- ☐ Core Web Vitals checked (Lighthouse)
- ☐ Canonical URLs and clean URL structure

## Phase 11: Accessibility and internationalization

- ☐ Keyboard navigation works everywhere
- ☐ Visible focus states
- ☐ Alt text on images, labels on inputs, ARIA where needed
- ☐ Sufficient color contrast
- ☐ Respect reduced-motion preferences
- ☐ Multi-language support (i18n) if needed; no hardcoded strings
- ☐ Date, time, currency, and timezone handling

## Phase 12: Testing and quality

- ☐ Unit tests for business logic
- ☐ Integration tests per service (with a test database)
- ☐ Contract tests between services
- ☐ End-to-end tests for critical flows (signup, login, payment) with Playwright/Cypress
- ☐ Linter and formatter (ESLint, Prettier, Ruff) enforced
- ☐ Type checking (TypeScript strict mode)
- ☐ Pre-commit hooks
- ☐ Test on real mobile devices and multiple browsers
- ☐ Ask the AI to write tests **with** every feature, not afterward

## Phase 13: DevOps and deployment

- ☐ Dockerfile per service, small and secure images
- ☐ Separate environments: local, staging, production
- ☐ CI pipeline: lint, test, build on every push
- ☐ CD pipeline: automatic deploy to staging, approved deploy to production
- ☐ Infrastructure as code (Terraform/Pulumi) if scaling up
- ☐ Database migrations run safely during deploy
- ☐ Zero-downtime deploys and rollback plan
- ☐ Domain, DNS, SSL certificates
- ☐ Auto-scaling and resource limits
- ☐ Cost monitoring and budget alerts

## Phase 14: Monitoring and observability

- ☐ Centralized structured logging with request IDs
- ☐ Error tracking (Sentry)
- ☐ Metrics and dashboards (Grafana/Datadog)
- ☐ Distributed tracing across services (OpenTelemetry)
- ☐ Uptime monitoring and alerts
- ☐ Alerts on error spikes, slow responses, failed jobs
- ☐ Status page (optional)

## Phase 15: Compliance and data protection

- ☐ GDPR/DPDP (India)/CCPA basics: consent, data access, deletion, export
- ☐ Cookie consent before non-essential cookies
- ☐ Data processing records and a list of third-party processors
- ☐ Breach response plan
- ☐ Age restrictions (if children could use the site)
- ☐ PCI compliance handled by using a hosted payment provider (never store card data)

## Phase 16: Documentation and handover

- ☐ README per service: purpose, how to run, env vars, endpoints
- ☐ Architecture diagram showing services and data flow
- ☐ API documentation
- ☐ Decision log (why you chose X over Y)
- ☐ Runbook: what to do when something breaks
- ☐ Onboarding guide for future developers
- ☐ Changelog

## Phase 17: Pre-launch checklist

- ☐ All placeholder text, test data, and "lorem ipsum" removed
- ☐ All legal pages live and linked in the footer
- ☐ Production secrets different from dev secrets
- ☐ Debug mode and verbose errors disabled
- ☐ Emails send from your real domain and don't land in spam
- ☐ Payments tested in live mode with a small real transaction
- ☐ Backups verified, monitoring and alerts active
- ☐ Load test on critical endpoints
- ☐ Security review of auth and permissions
- ☐ Full walkthrough of every user flow on mobile and desktop
- ☐ Analytics and error tracking working
- ☐ Rollback plan ready

---

## Vibe coding workflow tips

1. **Plan before prompting.** Ask the AI to produce an architecture and a task list first. Review it, then build one piece at a time.
2. **One service or feature per prompt.** Large vague prompts produce messy code.
3. **Give constraints up front.** Stack, folder structure, naming, error format, and "don't add new dependencies."
4. **Ask for the unhappy path.** Always add: "Also handle loading, empty, error, and unauthorized states."
5. **Make the AI write tests** and run them before moving on.
6. **Commit often.** Small commits let you roll back when the AI breaks something.
7. **Review security-critical code yourself** (auth, payments, permissions) or have a second AI pass review it.
8. **Keep a rules file** in the repo and tell the AI to read it at the start of every session.
9. **Ask the AI to audit itself.** Periodically prompt: "Review this service against the checklist and list what's missing."
10. **Don't trust, verify.** Run the app, click everything, and read the diffs.

## Reusable prompt template

> I'm building \[feature\] in the \[service name\] service. Stack: \[stack\]. Follow the conventions in PROJECT\_RULES.md. Requirements: \[list\]. Also include: input validation, error handling using our standard error format, authorization checks, loading/empty/error UI states, logging with request ID, and tests. Do not add new dependencies or change other services without asking. First give me a short plan, then implement it step by step.

## Starter PROJECT\_RULES.md outline

- Project summary and architecture overview
- Tech stack and approved libraries
- Folder structure and naming conventions
- Auth and permission rules
- API error and response format
- Coding standards (types, linting, testing)
- Security rules (never log secrets, always validate input)
- UI rules (design system, required states, accessibility)
- Definition of done: tests pass, lint passes, docs updated, no secrets committed
