type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    // Structured JSON for production (compatible with Datadog, CloudWatch, etc.)
    return JSON.stringify(entry);
  }
  // Human-readable for development
  const { level, message, timestamp, service, ...rest } = entry;
  const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : "";
  return `[${timestamp}] ${level.toUpperCase()} [${service}] ${message}${extra}`;
}

function createEntry(level: LogLevel, service: string, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    service,
    ...meta,
  };
}

export function createLogger(service: string) {
  return {
    debug(message: string, meta?: Record<string, unknown>) {
      if (!shouldLog("debug")) return;
      console.debug(formatEntry(createEntry("debug", service, message, meta)));
    },
    info(message: string, meta?: Record<string, unknown>) {
      if (!shouldLog("info")) return;
      console.info(formatEntry(createEntry("info", service, message, meta)));
    },
    warn(message: string, meta?: Record<string, unknown>) {
      if (!shouldLog("warn")) return;
      console.warn(formatEntry(createEntry("warn", service, message, meta)));
    },
    error(message: string, meta?: Record<string, unknown>) {
      if (!shouldLog("error")) return;
      console.error(formatEntry(createEntry("error", service, message, meta)));
    },
  };
}

// Pre-configured loggers for common services
export const paymentLogger = createLogger("payment");
export const webhookLogger = createLogger("webhook");
export const authLogger = createLogger("auth");
export const apiLogger = createLogger("api");
