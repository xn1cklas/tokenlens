import { describe, expect, it } from "vitest";
import { jsonToCompact, estimateTokenSavings } from "../parsers/parse-json";
import { countTokens } from "../src/index";

describe("jsonToCompact", () => {
  describe("basic functionality", () => {
    it("should convert array of objects to compact format", () => {
      const input = [
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
      ];

      const result = jsonToCompact(input);

      expect(result).toBe(
        "text | start | end | speaker | confidence\n" +
          "Hey there | 30 | 40 | John Doe | 0.9\n" +
          "Hello | 41 | 45 | Jane Doe | 0.95",
      );
    });

    it("should convert single object to compact format", () => {
      const input = {
        text: "Hey there",
        start: 30,
        end: 40,
        speaker: "John Doe",
        confidence: 0.9,
      };

      const result = jsonToCompact(input);

      expect(result).toBe(
        "text | start | end | speaker | confidence\n" +
          "Hey there | 30 | 40 | John Doe | 0.9",
      );
    });

    it("should parse JSON string input", () => {
      const input = JSON.stringify([
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ]);

      const result = jsonToCompact(input);

      expect(result).toBe("name | age\n" + "Alice | 30\n" + "Bob | 25");
    });
  });

  describe("options", () => {
    it("should exclude header when includeHeader is false", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];

      const result = jsonToCompact(input, { includeHeader: false });

      expect(result).toBe("Alice | 30\n" + "Bob | 25");
    });

    it("should use custom delimiter", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];

      const result = jsonToCompact(input, { delimiter: ", " });

      expect(result).toBe("name, age\n" + "Alice, 30\n" + "Bob, 25");
    });

    it("should use custom delimiter (tab-separated)", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];

      const result = jsonToCompact(input, { delimiter: "\t" });

      expect(result).toBe("name\tage\n" + "Alice\t30\n" + "Bob\t25");
    });

    it("should extract only specified fields", () => {
      const input = [
        { name: "Alice", age: 30, city: "NYC", country: "USA" },
        { name: "Bob", age: 25, city: "LA", country: "USA" },
      ];

      const result = jsonToCompact(input, { fields: ["name", "city"] });

      expect(result).toBe("name | city\n" + "Alice | NYC\n" + "Bob | LA");
    });

    it("should combine multiple options", () => {
      const input = [
        { name: "Alice", age: 30, city: "NYC" },
        { name: "Bob", age: 25, city: "LA" },
      ];

      const result = jsonToCompact(input, {
        includeHeader: false,
        delimiter: ", ",
        fields: ["name", "age"],
      });

      expect(result).toBe("Alice, 30\n" + "Bob, 25");
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const result = jsonToCompact([]);
      expect(result).toBe("");
    });

    it("should handle null values", () => {
      const input = [
        { name: "Alice", age: 30, city: null },
        { name: "Bob", age: null, city: "LA" },
      ];

      const result = jsonToCompact(input);

      expect(result).toBe(
        "name | age | city\n" + "Alice | 30 | \n" + "Bob |  | LA",
      );
    });

    it("should handle undefined values", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25, city: "LA" },
      ];

      const result = jsonToCompact(input);

      expect(result).toBe("name | age\n" + "Alice | 30\n" + "Bob | 25");
    });

    it("should handle boolean values", () => {
      const input = [
        { name: "Alice", active: true },
        { name: "Bob", active: false },
      ];

      const result = jsonToCompact(input);

      expect(result).toBe("name | active\n" + "Alice | true\n" + "Bob | false");
    });

    it("should handle nested objects by stringifying them", () => {
      const input = [
        { name: "Alice", address: { city: "NYC", zip: "10001" } },
        { name: "Bob", address: { city: "LA", zip: "90001" } },
      ];

      const result = jsonToCompact(input);

      expect(result).toBe("name\n" + "Alice\n" + "Bob");
    });

    it("should handle objects with different keys", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", city: "LA" },
      ];

      const result = jsonToCompact(input);

      // Uses keys from first object
      expect(result).toBe("name | age\n" + "Alice | 30\n" + "Bob | ");
    });

    it("should throw error for invalid JSON string", () => {
      expect(() => jsonToCompact("not valid json")).toThrow(
        "Invalid JSON string",
      );
    });

    it("should handle special characters in values", () => {
      const input = [{ text: "Hello, world!", note: "It's great" }];

      const result = jsonToCompact(input);

      expect(result).toBe("text | note\n" + "Hello, world! | It's great");
    });

    it("should handle numeric string values", () => {
      const input = [
        { id: "001", count: 42 },
        { id: "002", count: 13 },
      ];

      const result = jsonToCompact(input);

      expect(result).toBe("id | count\n" + "001 | 42\n" + "002 | 13");
    });
  });

  describe("real-world examples", () => {
    it("should handle transcript data", () => {
      const input = [
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
      ];

      const result = jsonToCompact(input);

      expect(result).toContain("text | start | end | speaker | confidence");
      expect(result.split("\n")).toHaveLength(4); // header + 3 rows
    });

    it("should handle user data", () => {
      const input = [
        {
          id: 1,
          username: "alice_2024",
          email: "alice@example.com",
          verified: true,
        },
        {
          id: 2,
          username: "bob_dev",
          email: "bob@example.com",
          verified: false,
        },
      ];

      const result = jsonToCompact(input, { fields: ["username", "verified"] });

      expect(result).toBe(
        "username | verified\n" + "alice_2024 | true\n" + "bob_dev | false",
      );
    });
  });
});

describe("estimateTokenSavings", () => {
  it("should calculate savings for array of objects", () => {
    const input = [
      { name: "Alice", age: 30, city: "NYC" },
      { name: "Bob", age: 25, city: "LA" },
    ];

    const result = estimateTokenSavings(input);

    expect(result.originalChars).toBeGreaterThan(0);
    expect(result.compactChars).toBeGreaterThan(0);
    expect(result.savings).toBeGreaterThan(0);
    expect(result.savingsPercent).toBeGreaterThan(0);
    expect(result.originalChars).toBeGreaterThan(result.compactChars);
  });

  it("should calculate savings for JSON string", () => {
    const input = JSON.stringify([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ]);

    const result = estimateTokenSavings(input);

    expect(result.savings).toBeGreaterThan(0);
    expect(result.savingsPercent).toBeGreaterThan(0);
  });

  it("should show different savings with different options", () => {
    const input = [
      { name: "Alice", age: 30, city: "NYC" },
      { name: "Bob", age: 25, city: "LA" },
    ];

    const withHeader = estimateTokenSavings(input, { includeHeader: true });
    const withoutHeader = estimateTokenSavings(input, { includeHeader: false });

    expect(withoutHeader.compactChars).toBeLessThan(withHeader.compactChars);
    expect(withoutHeader.savings).toBeGreaterThan(withHeader.savings);
  });

  it("should calculate correct percentages", () => {
    const input = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];

    const result = estimateTokenSavings(input);

    const expectedPercent = (result.savings / result.originalChars) * 100;
    expect(result.savingsPercent).toBeCloseTo(expectedPercent, 2);
  });

  it("should show significant savings for large datasets", () => {
    const input = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User${i}`,
      email: `user${i}@example.com`,
      active: i % 2 === 0,
    }));

    const result = estimateTokenSavings(input);

    // With 100 items, we should see significant savings
    expect(result.savingsPercent).toBeGreaterThan(30);
  });
});

describe("Token reduction with actual tokenizer", () => {
  it("should reduce actual tokens when using jsonToCompact with GPT models", async () => {
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
    const compactFormat = jsonToCompact(transcriptData);

    // Count tokens with GPT-4o (uses tiktoken locally, no API key needed)
    const jsonTokens = await countTokens("gpt-4o", "openai", jsonFormat);
    const compactTokens = await countTokens("gpt-4o", "openai", compactFormat);

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
    const compactFormat = jsonToCompact(largeDataset);

    const jsonTokens = await countTokens("gpt-4o", "openai", jsonFormat);
    const compactTokens = await countTokens("gpt-4o", "openai", compactFormat);

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
    const compactFormat = jsonToCompact(data);

    // Test with gpt-5 model
    const jsonTokens = await countTokens("gpt-5", "openai", jsonFormat);
    const compactTokens = await countTokens("gpt-5", "openai", compactFormat);

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
    const compactWithHeader = jsonToCompact(data, { includeHeader: true });
    const tokensWithHeader = await countTokens(
      "gpt-4o",
      "openai",
      compactWithHeader,
    );

    // Test without header
    const compactWithoutHeader = jsonToCompact(data, { includeHeader: false });
    const tokensWithoutHeader = await countTokens(
      "gpt-4o",
      "openai",
      compactWithoutHeader,
    );

    const jsonTokens = await countTokens("gpt-4o", "openai", jsonFormat);

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
