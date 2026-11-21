import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as XLSX from "xlsx";
import { expect, test } from "@fixtures/BaseTest";
import { SessionManager } from "../../src/auth/SessionManager";
import { CsvReader } from "../../src/test-data/readers/CsvReader";
import { ExcelReader } from "../../src/test-data/readers/ExcelReader";
import { JsonReader } from "../../src/test-data/readers/JsonReader";

test.describe("parallel isolation", () => {
  test.describe.configure({ mode: "parallel" });

  test("browser context state is private to this test", async ({ context }) => {
    const existing = await context.cookies("http://parallel.example.test");
    expect(existing).toEqual([]);

    await context.addCookies([
      {
        name: "parallel-marker",
        value: "context-a",
        url: "http://parallel.example.test",
      },
    ]);
    expect(await context.cookies("http://parallel.example.test")).toHaveLength(
      1,
    );
  });

  test("another parallel test starts without the other test's cookies", async ({
    context,
  }) => {
    expect(await context.cookies("http://parallel.example.test")).toEqual([]);
    await context.addCookies([
      {
        name: "parallel-marker",
        value: "context-b",
        url: "http://parallel.example.test",
      },
    ]);
    expect(await context.cookies("http://parallel.example.test")).toHaveLength(
      1,
    );
  });

  test("test execution identifiers and auth cache directories are distinct", async ({
    testExecutionId,
  }, testInfo) => {
    expect(testExecutionId).toContain(testInfo.testId);
    expect(testExecutionId).toContain("retry-0");
    expect(testExecutionId).toMatch(/^[a-zA-Z0-9-]+$/);
    expect(SessionManager.workerDirectory("playwright/.auth", 0)).not.toBe(
      SessionManager.workerDirectory("playwright/.auth", 1),
    );
  });

  test("reader results cannot mutate shared JSON, CSV, or Excel data", () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "parallel-data-"));
    const jsonFile = path.join(directory, "data.json");
    const csvFile = path.join(directory, "data.csv");
    const excelFile = path.join(directory, "data.xlsx");

    try {
      fs.writeFileSync(
        jsonFile,
        JSON.stringify({ item: { label: "original" } }),
      );
      fs.writeFileSync(csvFile, "key,label\nitem,original\n");
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([
        ["key", "label"],
        ["item", "original"],
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, excelFile);

      const jsonReader = new JsonReader<{ label: string }>(
        "data.json",
        directory,
      );
      const csvReader = new CsvReader<{ key: string; label: string }>(
        "data.csv",
        directory,
      );
      const excelReader = new ExcelReader<{ key: string; label: string }>(
        "data.xlsx",
        "Data",
        directory,
      );

      jsonReader.get("item").label = "mutated";
      jsonReader.read().item!.label = "mutated-again";
      csvReader.get("item").label = "mutated";
      csvReader.read()[0]!.label = "mutated-again";
      excelReader.get("item").label = "mutated";
      excelReader.read()[0]!.label = "mutated-again";

      expect(jsonReader.get("item").label).toBe("original");
      expect(csvReader.get("item").label).toBe("original");
      expect(excelReader.get("item").label).toBe("original");
    } finally {
      JsonReader.clearFileCache(jsonFile);
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
