/**
 * Options for JSON to compact string conversion
 */
export interface JsonToCompactOptions {
  /** Whether to include a header row with field names. Default: true */
  includeHeader?: boolean;
  /** Delimiter to use between values. Default: ' | ' */
  delimiter?: string;
  /** Fields to extract (in order). If not provided, all fields from first object are used */
  fields?: string[];
}

/**
 * Converts JSON data to a compact pipe-separated format to reduce token count.
 * This is useful for LLM prompts where you want to include structured data
 * in a more token-efficient format than JSON.
 *
 * @param input - JSON string, object, or array of objects
 * @param options - Configuration options for formatting
 * @returns Formatted string in compact format
 *
 * @example
 * ```typescript
 * const data = [
 *   { name: "Alice", age: 30, city: "NYC" },
 *   { name: "Bob", age: 25, city: "LA" }
 * ];
 * const result = jsonToCompact(data);
 * // Returns:
 * // name | age | city
 * // Alice | 30 | NYC
 * // Bob | 25 | LA
 * ```
 */
export function jsonToCompact(
  input: string | object | object[],
  options: JsonToCompactOptions = {},
): string {
  const {
    includeHeader = true,
    delimiter = " | ",
    fields: customFields,
  } = options;

  // Parse JSON string if needed
  let data: object | object[];
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch (error) {
      throw new Error(
        `Invalid JSON string: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } else {
    data = input;
  }

  // Ensure we have an array
  const items = Array.isArray(data) ? data : [data];

  if (items.length === 0) {
    return "";
  }

  // Determine fields to use
  const fields =
    customFields ||
    Object.keys(items[0] as Record<string, unknown>).filter(
      (key) =>
        typeof (items[0] as Record<string, unknown>)[key] !== "object" ||
        (items[0] as Record<string, unknown>)[key] === null,
    );

  // Build header
  const lines: string[] = [];
  if (includeHeader) {
    lines.push(fields.join(delimiter));
  }

  // Build data rows
  for (const item of items) {
    const row = fields
      .map((field) => {
        const value = (item as Record<string, unknown>)[field];
        // Convert value to string, handling null/undefined
        if (value === null || value === undefined) {
          return "";
        }
        if (typeof value === "object") {
          return JSON.stringify(value);
        }
        return String(value);
      })
      .join(delimiter);
    lines.push(row);
  }

  return lines.join("\n");
}

/**
 * Estimates token savings by comparing JSON format vs compact format.
 * Note: This is a rough estimate based on character count, not actual tokenization.
 *
 * @param input - JSON string, object, or array of objects
 * @param options - Configuration options for formatting
 * @returns Object with original size, compact size, and estimated savings
 */
export function estimateTokenSavings(
  input: string | object | object[],
  options: JsonToCompactOptions = {},
): {
  originalChars: number;
  compactChars: number;
  savings: number;
  savingsPercent: number;
} {
  const originalJson =
    typeof input === "string" ? input : JSON.stringify(input);
  const compact = jsonToCompact(input, options);

  const originalChars = originalJson.length;
  const compactChars = compact.length;
  const savings = originalChars - compactChars;
  const savingsPercent = (savings / originalChars) * 100;

  return {
    originalChars,
    compactChars,
    savings,
    savingsPercent,
  };
}
