// Simple in-memory metrics (for production, use Prometheus or similar)
export const metrics = {
  requests: {
    total: 0,
    byMethod: {
      GET: 0,
      POST: 0,
      PUT: 0,
      DELETE: 0,
    },
  },
  responses: {
    total: 0,
    byStatus: {
      '2xx': 0,
      '4xx': 0,
      '5xx': 0,
    },
  },
  posts: {
    created: 0,
    updated: 0,
    deleted: 0,
  },
  errors: {
    total: 0,
  },
  responseTimes: [] as number[],
};

export const getAverageResponseTime = (): number => {
  if (metrics.responseTimes.length === 0) return 0;
  const sum = metrics.responseTimes.reduce((a, b) => a + b, 0);
  return Math.round(sum / metrics.responseTimes.length);
};

export const recordResponseTime = (duration: number) => {
  metrics.responseTimes.push(duration);
  // Keep only last 100 response times to avoid memory growth
  if (metrics.responseTimes.length > 100) {
    metrics.responseTimes.shift();
  }
};

export const incrementMetric = (path: string, value: number = 1) => {
  const parts = path.split('.');
  let current: any = metrics;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  const lastPart = parts[parts.length - 1];
  if (typeof current[lastPart] === 'number') {
    current[lastPart] += value;
  } else {
    current[lastPart] = value;
  }
};
