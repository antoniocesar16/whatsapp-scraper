const RAPIDAPI_HOST = "whatsapp-scraper1.p.rapidapi.com";
const RAPIDAPI_DOCS_URL = "https://rapidapi.com/antoniocesar16794/api/whatsapp-scraper1";

function buildApiKeyHelpMessage(reason) {
  return `${reason}\nGet your API key at: ${RAPIDAPI_DOCS_URL}`;
}

function sanitizeNumber(number) {
  return String(number || "").replace(/\D/g, "");
}

class WhatsAppScraperClient {
  constructor(apiKey, options = {}) {
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      throw new Error(
        buildApiKeyHelpMessage("Missing RapidAPI key. Provide a valid API key.")
      );
    }

    if (
      apiKey === "YOUR_TOKEN_HERE" ||
      apiKey === "YOUR_API_KEY" ||
      apiKey.toLowerCase().includes("token_here")
    ) {
      throw new Error(
        buildApiKeyHelpMessage("Invalid RapidAPI key placeholder. Replace with a real API key.")
      );
    }

    this.apiKey = apiKey.trim();
    this.host = options.host || RAPIDAPI_HOST;
    this.baseUrl = options.baseUrl || `https://${this.host}`;
    this.timeoutMs = Number(options.timeoutMs || 15000);
  }

  async getProfile(number) {
    const normalized = sanitizeNumber(number);
    if (!normalized) {
      throw new Error("A valid phone number is required.");
    }

    return this.request("/profile", {
      method: "GET",
      query: { number: normalized },
    });
  }

  async postProfile(number) {
    const normalized = sanitizeNumber(number);
    if (!normalized) {
      throw new Error("A valid phone number is required.");
    }

    return this.request("/profile", {
      method: "POST",
      body: { number: normalized },
    });
  }

  async getProfiles(numbers) {
    let payload = numbers;

    if (Array.isArray(numbers)) {
      payload = numbers.map(sanitizeNumber).filter(Boolean);
    }

    if (typeof numbers === "string") {
      payload = numbers
        .split(",")
        .map((item) => sanitizeNumber(item.trim()))
        .filter(Boolean)
        .join(",");
    }

    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
      throw new Error("A non-empty list of phone numbers is required.");
    }

    return this.request("/profiles", {
      method: "POST",
      body: { numbers: payload },
    });
  }

  async getStatus() {
    return this.request("/status", { method: "GET" });
  }

  async request(path, { method = "GET", query, body } = {}) {
    const url = new URL(path, `${this.baseUrl}/`);

    if (query && typeof query === "object") {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.host,
          "content-type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();
      let parsed;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = { raw: text };
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            buildApiKeyHelpMessage(
              "Invalid or unauthorized RapidAPI key. Verify your subscription and API key."
            )
          );
        }

        const message =
          parsed?.message ||
          parsed?.error ||
          `Request failed with status ${response.status}`;

        throw new Error(message);
      }

      return parsed;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeoutMs}ms.`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function createClient(apiKey, options) {
  return new WhatsAppScraperClient(apiKey, options);
}

module.exports = {
  WhatsAppScraperClient,
  createClient,
  RAPIDAPI_DOCS_URL,
};
