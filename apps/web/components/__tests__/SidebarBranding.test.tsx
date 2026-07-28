import { readFileSync } from "node:fs";
import { join } from "node:path";

test("sidebar uses the full dark PrepTürk lockup", () => {
  const source = readFileSync(join(process.cwd(), "components", "Sidebar.tsx"), "utf8");
  expect(source).toContain('src="/prepturk-logo-dark.png"');
  expect(source).not.toContain('className="object-contain"');
});
