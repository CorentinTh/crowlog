function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function redactPath({
  path,
  current,
  redactedValue,
}: {
  path: string[];
  current: Record<string, unknown>;
  redactedValue: string;
}) {
  const [key, ...rest] = path;
  const isLast = rest.length === 0;
  const isWildcard = key === '*';


  // Handle foo.bar.*
  if (isLast && isWildcard && Array.isArray(current)) {
    current.fill(redactedValue);
    return;
  }


  if (isLast) {
    current[key] = redactedValue;
    return;
  }

  if (isWildcard && Array.isArray(current)) {
    for (const item of current) {
      if (isRecord(item)) {
        redactPath({ path: rest, current: item, redactedValue });
      }
    }
  }

  if (isRecord(current[key])) {
    redactPath({ path: rest, current: current[key], redactedValue });
  }
}

export function buildRedactor({
  paths: rawPaths = [],
  redactedValue = '[redacted]',
}: {
  paths?: string[];
  redactedValue?: string;
} = {}) {
  const paths = rawPaths.map(path => path.split('.'));

  return (obj: unknown) => {
    if (!isRecord(obj)) {
      return obj;
    }

    const current = structuredClone(obj);

    for (const path of paths) {
      redactPath({ path, current, redactedValue });
    }

    return current;
  };
}
