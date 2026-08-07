import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the exported /blog page serves and lists the placeholder title", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Pink Paprikaa Blog" })).toBeVisible();
  await expect(page.getByRole("listitem")).toContainText(["Placeholder"]);
});

test("/blog has no critical or serious axe violations", async ({ page }) => {
  await page.goto("/blog");
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
  expect(blocking).toEqual([]);
});

test("no founder names in the served HTML", async ({ page }) => {
  const response = await page.goto("/blog");
  const body = (await response?.text()) ?? "";
  expect(body).not.toMatch(/rishav|pandey|anand/i);
});
