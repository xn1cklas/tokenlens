import { describe, expect, it } from "vitest";
import { compactJson } from "@tokenlens/helpers";
import { countTokens } from "@tokenlens/tokenizer";

describe("Token reduction with actual tokenizer", () => {
  it("should reduce actual tokens when using compactJson with GPT models", async () => {
    // Sample data - realistic transcript/structured data
    const transcriptData = [
      {
        text: "Hey there",
        start: 30,
        end: 40,
        speaker: "John Doe",
        confidence: 0.9,
      },
      {
        text: "Hello",
        start: 41,
        end: 45,
        speaker: "Jane Doe",
        confidence: 0.95,
      },
      {
        text: "How are you?",
        start: 46,
        end: 50,
        speaker: "John Doe",
        confidence: 0.88,
      },
      {
        text: "I'm doing great!",
        start: 51,
        end: 55,
        speaker: "Jane Doe",
        confidence: 0.92,
      },
      {
        text: "That's wonderful",
        start: 56,
        end: 60,
        speaker: "John Doe",
        confidence: 0.87,
      },
    ];

    // Format 1: Standard JSON
    const jsonFormat = JSON.stringify(transcriptData);

    // Format 2: Compact pipe-separated format
    const compactFormat = compactJson(transcriptData);

    // Count tokens with GPT-4o (uses tiktoken locally, no API key needed)
    const jsonTokens = await countTokens("gpt-4o", jsonFormat);
    const compactTokens = await countTokens("gpt-4o", compactFormat);

    // Assertions
    expect(jsonTokens).toBeDefined();
    expect(compactTokens).toBeDefined();

    if (jsonTokens === undefined || compactTokens === undefined) {
      throw new Error("Token counts should be defined");
    }

    expect(jsonTokens).toBeGreaterThan(0);
    expect(compactTokens).toBeGreaterThan(0);

    // The compact format should use fewer tokens
    expect(compactTokens).toBeLessThan(jsonTokens);

    // Calculate actual token savings
    const tokenSavings = jsonTokens - compactTokens;
    const tokenSavingsPercent = (tokenSavings / jsonTokens) * 100;

    // Log the results for visibility
    console.log("\nToken Reduction Analysis (GPT-4o):");
    console.log(`   JSON format:    ${jsonTokens} tokens`);
    console.log(`   Compact format: ${compactTokens} tokens`);
    console.log(
      `   Savings:        ${tokenSavings} tokens (${tokenSavingsPercent.toFixed(1)}%)`,
    );

    // We expect at least 15% token reduction for this data
    expect(tokenSavingsPercent).toBeGreaterThan(15);
  });

  it("should show significant token reduction with larger datasets", async () => {
    // Larger dataset - 20 items
    const largeDataset = Array.from({ length: 20 }, (_, i) => ({
      id: `ORD-${String(i + 1).padStart(3, "0")}`,
      customer: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      amount: 1000 + i * 500,
      status: i % 3 === 0 ? "paid" : i % 3 === 1 ? "pending" : "shipped",
      date: `2024-10-${String((i % 28) + 1).padStart(2, "0")}`,
    }));

    const jsonFormat = JSON.stringify(largeDataset);
    const compactFormat = compactJson(largeDataset);

    const jsonTokens = await countTokens("gpt-4o", jsonFormat);
    const compactTokens = await countTokens("gpt-4o", compactFormat);

    expect(jsonTokens).toBeDefined();
    expect(compactTokens).toBeDefined();

    if (jsonTokens === undefined || compactTokens === undefined) {
      throw new Error("Token counts should be defined");
    }

    expect(compactTokens).toBeLessThan(jsonTokens);

    const tokenSavings = jsonTokens - compactTokens;
    const tokenSavingsPercent = (tokenSavings / jsonTokens) * 100;

    console.log("\nToken Reduction Analysis - Large Dataset (GPT-4o):");
    console.log(`   Dataset size:   20 items`);
    console.log(`   JSON format:    ${jsonTokens} tokens`);
    console.log(`   Compact format: ${compactTokens} tokens`);
    console.log(
      `   Savings:        ${tokenSavings} tokens (${tokenSavingsPercent.toFixed(1)}%)`,
    );

    // Larger datasets should show even better savings (30%+)
    expect(tokenSavingsPercent).toBeGreaterThan(25);
  });

  it("should work with GPT-5 model", async () => {
    const data = [
      { name: "Alice", age: 30, role: "Engineer" },
      { name: "Bob", age: 25, role: "Designer" },
      { name: "Charlie", age: 35, role: "Manager" },
    ];

    const jsonFormat = JSON.stringify(data);
    const compactFormat = compactJson(data);

    // Test with gpt-5 model
    const jsonTokens = await countTokens("gpt-5", jsonFormat);
    const compactTokens = await countTokens("gpt-5", compactFormat);

    expect(jsonTokens).toBeDefined();
    expect(compactTokens).toBeDefined();

    if (jsonTokens === undefined || compactTokens === undefined) {
      throw new Error("Token counts should be defined");
    }

    expect(compactTokens).toBeLessThan(jsonTokens);

    const tokenSavings = jsonTokens - compactTokens;
    const tokenSavingsPercent = (tokenSavings / jsonTokens) * 100;

    console.log("\nToken Reduction Analysis (GPT-5):");
    console.log(`   JSON format:    ${jsonTokens} tokens`);
    console.log(`   Compact format: ${compactTokens} tokens`);
    console.log(
      `   Savings:        ${tokenSavings} tokens (${tokenSavingsPercent.toFixed(1)}%)`,
    );

    expect(tokenSavingsPercent).toBeGreaterThan(10);
  });

  it("should show even more savings without header for very structured data", async () => {
    const data = Array.from({ length: 15 }, (_, i) => ({
      metric: `metric_${i}`,
      value: 100 + i * 10,
      unit: "ms",
    }));

    const jsonFormat = JSON.stringify(data);

    // Test with header
    const compactWithHeader = compactJson(data, { includeHeader: true });
    const tokensWithHeader = await countTokens("gpt-4o", compactWithHeader);

    // Test without header
    const compactWithoutHeader = compactJson(data, { includeHeader: false });
    const tokensWithoutHeader = await countTokens(
      "gpt-4o",
      compactWithoutHeader,
    );

    const jsonTokens = await countTokens("gpt-4o", jsonFormat);

    if (
      jsonTokens === undefined ||
      tokensWithHeader === undefined ||
      tokensWithoutHeader === undefined
    ) {
      throw new Error("Token counts should be defined");
    }

    expect(tokensWithoutHeader).toBeLessThan(tokensWithHeader);
    expect(tokensWithoutHeader).toBeLessThan(jsonTokens);

    const savingsWithHeader =
      ((jsonTokens - tokensWithHeader) / jsonTokens) * 100;
    const savingsWithoutHeader =
      ((jsonTokens - tokensWithoutHeader) / jsonTokens) * 100;

    console.log("\nToken Reduction Analysis - Header Impact (GPT-4o):");
    console.log(`   JSON format:              ${jsonTokens} tokens`);
    console.log(
      `   Compact with header:      ${tokensWithHeader} tokens (${savingsWithHeader.toFixed(1)}% savings)`,
    );
    console.log(
      `   Compact without header:   ${tokensWithoutHeader} tokens (${savingsWithoutHeader.toFixed(1)}% savings)`,
    );
    console.log(
      `   Extra savings w/o header: ${(savingsWithoutHeader - savingsWithHeader).toFixed(1)}%`,
    );

    expect(savingsWithoutHeader).toBeGreaterThan(savingsWithHeader);
  });
});
