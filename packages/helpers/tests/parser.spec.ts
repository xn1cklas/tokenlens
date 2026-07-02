import { describe, expect, it } from "vitest";
import { compactJson, estimateTokenSavings } from "../src/index";

describe("compactJson", () => {
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

      const result = compactJson(input);

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

      const result = compactJson(input);

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

      const result = compactJson(input);

      expect(result).toBe("name | age\n" + "Alice | 30\n" + "Bob | 25");
    });
  });

  describe("options", () => {
    it("should exclude header when includeHeader is false", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];

      const result = compactJson(input, { includeHeader: false });

      expect(result).toBe("Alice | 30\n" + "Bob | 25");
    });

    it("should use custom delimiter", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];

      const result = compactJson(input, { delimiter: ", " });

      expect(result).toBe("name, age\n" + "Alice, 30\n" + "Bob, 25");
    });

    it("should use custom delimiter (tab-separated)", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];

      const result = compactJson(input, { delimiter: "\t" });

      expect(result).toBe("name\tage\n" + "Alice\t30\n" + "Bob\t25");
    });

    it("should extract only specified fields", () => {
      const input = [
        { name: "Alice", age: 30, city: "NYC", country: "USA" },
        { name: "Bob", age: 25, city: "LA", country: "USA" },
      ];

      const result = compactJson(input, { fields: ["name", "city"] });

      expect(result).toBe("name | city\n" + "Alice | NYC\n" + "Bob | LA");
    });

    it("should combine multiple options", () => {
      const input = [
        { name: "Alice", age: 30, city: "NYC" },
        { name: "Bob", age: 25, city: "LA" },
      ];

      const result = compactJson(input, {
        includeHeader: false,
        delimiter: ", ",
        fields: ["name", "age"],
      });

      expect(result).toBe("Alice, 30\n" + "Bob, 25");
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const result = compactJson([]);
      expect(result).toBe("");
    });

    it("should handle null values", () => {
      const input = [
        { name: "Alice", age: 30, city: null },
        { name: "Bob", age: null, city: "LA" },
      ];

      const result = compactJson(input);

      expect(result).toBe(
        "name | age | city\n" + "Alice | 30 | \n" + "Bob |  | LA",
      );
    });

    it("should handle undefined values", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25, city: "LA" },
      ];

      const result = compactJson(input);

      expect(result).toBe("name | age\n" + "Alice | 30\n" + "Bob | 25");
    });

    it("should handle boolean values", () => {
      const input = [
        { name: "Alice", active: true },
        { name: "Bob", active: false },
      ];

      const result = compactJson(input);

      expect(result).toBe("name | active\n" + "Alice | true\n" + "Bob | false");
    });

    it("should handle nested objects by stringifying them", () => {
      const input = [
        { name: "Alice", address: { city: "NYC", zip: "10001" } },
        { name: "Bob", address: { city: "LA", zip: "90001" } },
      ];

      const result = compactJson(input);

      expect(result).toBe("name\n" + "Alice\n" + "Bob");
    });

    it("should stringify nested objects when they are explicitly selected", () => {
      const input = [{ address: { city: "NYC", zip: "10001" } }];

      const result = compactJson(input, { fields: ["address"] });

      expect(result).toBe('address\n{"city":"NYC","zip":"10001"}');
    });

    it("should handle objects with different keys", () => {
      const input = [
        { name: "Alice", age: 30 },
        { name: "Bob", city: "LA" },
      ];

      const result = compactJson(input);

      // Uses keys from first object
      expect(result).toBe("name | age\n" + "Alice | 30\n" + "Bob | ");
    });

    it("should throw error for invalid JSON string", () => {
      expect(() => compactJson("not valid json")).toThrow(
        "Invalid JSON string",
      );
    });

    it("should handle special characters in values", () => {
      const input = [{ text: "Hello, world!", note: "It's great" }];

      const result = compactJson(input);

      expect(result).toBe("text | note\n" + "Hello, world! | It's great");
    });

    it("should handle numeric string values", () => {
      const input = [
        { id: "001", count: 42 },
        { id: "002", count: 13 },
      ];

      const result = compactJson(input);

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

      const result = compactJson(input);

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

      const result = compactJson(input, { fields: ["username", "verified"] });

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
