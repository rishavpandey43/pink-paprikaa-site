import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the exported home page serves and renders the brand heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pink Paprikaa" })).toBeVisible();
});

test("home has no critical or serious axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
  expect(blocking).toEqual([]);
});

test("no founder names in the served HTML", async ({ page }) => {
  const response = await page.goto("/");
  const body = (await response?.text()) ?? "";
  expect(body).not.toMatch(/rishav|pandey|anand/i);
});
