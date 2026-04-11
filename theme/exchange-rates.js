(() => {
  const FX_TABLE_SELECTOR = ".fx-table[data-fx-base][data-fx-quotes]";
  const CACHE_TTL_MS = 60 * 60 * 1000;
  const CACHE_PREFIX = "fx-table:";

  function getFormatter(currency) {
    const digits = currency === "JPY" ? 0 : 2;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function formatDirectRate(currency, value) {
    return `approx. ${getFormatter(currency).format(value)} ${currency}`;
  }

  function formatInverseRate(currency, value) {
    return `approx. ${getFormatter("CNY").format(value)} CNY`;
  }

  function formatDate(dateString) {
    const parsed = new Date(`${dateString}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsed);
  }

  function normalizePayload(payload) {
    if (payload && !Array.isArray(payload) && payload.rates && payload.date) {
      return payload;
    }

    if (!Array.isArray(payload) || payload.length === 0) {
      return null;
    }

    const rates = {};
    let latestDate = null;

    for (const entry of payload) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const quote = entry.quote || entry.symbol || entry.currency;
      const rate = entry.price ?? entry.rate ?? entry.value;
      const date = entry.date ?? entry.updatedAt ?? entry.timestamp;

      if (typeof quote !== "string" || typeof rate !== "number" || rate <= 0) {
        continue;
      }

      rates[quote] = rate;
      if (typeof date === "string" && (!latestDate || date > latestDate)) {
        latestDate = date;
      }
    }

    if (!latestDate || Object.keys(rates).length === 0) {
      return null;
    }

    return {
      date: latestDate,
      rates,
    };
  }

  function getCacheKey(table, url) {
    return `${CACHE_PREFIX}${table.dataset.fxBase}:${table.dataset.fxQuotes}:${url}`;
  }

  function readCache(cacheKey) {
    try {
      const raw = window.localStorage.getItem(cacheKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }

      if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
        window.localStorage.removeItem(cacheKey);
        return null;
      }

      return parsed.payload ?? null;
    } catch (_error) {
      return null;
    }
  }

  function writeCache(cacheKey, payload) {
    try {
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({
          savedAt: Date.now(),
          payload,
        }),
      );
    } catch (_error) {
      // Ignore storage failures and keep the static fallback.
    }
  }

  function applyRates(table, payload) {
    if (!payload || !payload.rates || !payload.date) {
      return;
    }

    for (const row of table.querySelectorAll("tbody tr[data-currency]")) {
      const currency = row.dataset.currency;
      const directRate = payload.rates[currency];

      if (typeof directRate !== "number" || directRate <= 0) {
        continue;
      }

      const cells = row.querySelectorAll("td");
      if (cells.length < 5) {
        continue;
      }

      const inverseRate = 1 / directRate;
      cells[0].textContent = formatDate(payload.date);
      cells[3].textContent = formatInverseRate(currency, inverseRate);
      cells[4].textContent = formatDirectRate(currency, directRate);
    }
  }

  async function fetchRates(table) {
    const url =
      table.dataset.fxSource ||
      `https://api.frankfurter.dev/v2/rates?base=${encodeURIComponent(
        table.dataset.fxBase,
      )}&quotes=${encodeURIComponent(table.dataset.fxQuotes)}`;

    const cacheKey = getCacheKey(table, url);
    const cached = readCache(cacheKey);
    if (cached) {
      applyRates(table, cached);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    try {
      const response = await window.fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return;
      }

      const rawPayload = await response.json();
      const payload = normalizePayload(rawPayload);
      if (!payload) {
        return;
      }

      writeCache(cacheKey, payload);
      applyRates(table, payload);
    } catch (_error) {
      // Keep the static fallback values if the request fails.
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function init() {
    const tables = document.querySelectorAll(FX_TABLE_SELECTOR);
    for (const table of tables) {
      fetchRates(table);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
