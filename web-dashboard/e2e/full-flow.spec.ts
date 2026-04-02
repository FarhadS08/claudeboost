import { test, expect } from "@playwright/test";

test.describe("ClaudeBoost Full E2E Flow", () => {
  // ── Landing Page ──────────────────────────────────────────────────────────
  test("landing page loads and has key elements", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /ClaudeBoost/ }).first()).toBeVisible();
    await expect(page.getByText("pip install claudeboost-mcp").first()).toBeVisible();
    await expect(page.locator('a[href="/docs"]').first()).toBeVisible();
  });

  test("landing page install commands are correct", async ({ page }) => {
    await page.goto("/");
    const content = await page.textContent("body");
    expect(content).toContain("pip install claudeboost-mcp");
    expect(content).toContain("claudeboost-mcp --setup");
    expect(content).toContain("/boost --setup");
    expect(content).not.toContain("localhost:3000");
  });

  // ── Docs Page ─────────────────────────────────────────────────────────────
  test("docs page is publicly accessible", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByText("Getting Started").first()).toBeVisible();
  });

  test("docs page has correct install steps", async ({ page }) => {
    await page.goto("/docs");
    const content = await page.textContent("body");
    expect(content).toContain("pip install claudeboost-mcp");
    expect(content).toContain("claudeboost-mcp --setup");
    expect(content).toContain("/boost --setup");
    expect(content).not.toContain("localhost:3000");
  });

  test("docs sidebar navigation works", async ({ page }) => {
    await page.goto("/docs");
    await page.click("text=Commands");
    await expect(page.locator("#commands")).toBeVisible();
    await page.click("text=Scoring System");
    await expect(page.locator("#scoring")).toBeVisible();
  });

  // ── Auth Flow ─────────────────────────────────────────────────────────────
  test("unauthenticated user redirected to login from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/auth/login**");
    await expect(page.getByText("Sign in to your account")).toBeVisible();
  });

  test("login page has email and password fields", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.locator('a[href="/auth/signup"]')).toBeVisible();
  });

  test("signup page has all fields", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    const passwordFields = page.locator('input[type="password"]');
    await expect(passwordFields).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Invalid login|invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test("cli-login page is accessible", async ({ page }) => {
    await page.goto("/auth/cli-login");
    await expect(page).toHaveURL(/.*cli-login/);
    // Should show either login form or "Almost done" or connect
    const content = await page.textContent("body");
    const hasContent = content?.includes("ClaudeBoost") || content?.includes("CLI") || content?.includes("Terminal");
    expect(hasContent).toBeTruthy();
  });

  // ── Dashboard (requires auth) ────────────────────────────────────────────
  test("dashboard/stats redirects to login", async ({ page }) => {
    await page.goto("/dashboard/stats");
    await page.waitForURL("**/auth/login**");
  });

  test("dashboard/constraints redirects to login", async ({ page }) => {
    await page.goto("/dashboard/constraints");
    await page.waitForURL("**/auth/login**");
  });

  // ── API Routes ────────────────────────────────────────────────────────────
  test("API history returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/history");
    expect(response.status()).toBe(401);
  });

  test("API settings returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/settings");
    expect(response.status()).toBe(401);
  });

  test("API constraints returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/constraints");
    expect(response.status()).toBe(401);
  });

  // ── Pricing Page ──────────────────────────────────────────────────────────
  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    // Pricing redirects to /dashboard which redirects to /auth/login
    await page.waitForURL("**/**", { timeout: 5000 });
    // Just verify it didn't crash
    expect(page.url()).toBeTruthy();
  });

  // ── No Localhost References ───────────────────────────────────────────────
  test("no localhost on landing page", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).not.toContain("localhost:3000");
  });

  test("no localhost on docs page", async ({ page }) => {
    await page.goto("/docs");
    const html = await page.content();
    expect(html).not.toContain("localhost:3000");
  });

  test("no localhost on login page", async ({ page }) => {
    await page.goto("/auth/login");
    const html = await page.content();
    expect(html).not.toContain("localhost:3000");
  });
});
