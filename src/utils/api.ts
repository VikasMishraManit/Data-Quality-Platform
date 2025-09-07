// Simulated API calls for mock data

export const fetchRules = async () => {
  const response = await import('../data/rules.json');
  return response.default;
};

export const fetchRuleExecutions = async () => {
  const response = await import('../data/ruleExecutions.json');
  return response.default;
};

export const fetchProfiling = async () => {
  const response = await import('../data/profiling.json');
  return response.default;
};

export const fetchAssets = async () => {
  const response = await import('../data/assets.json');
  return response.default;
};

export const fetchIncidents = async () => {
  const response = await import('../data/incidents.json');
  return response.default;
};

export const fetchLineage = async () => {
  const response = await import('../data/lineage.json');
  return response.default;
};

export const fetchAnomalies = async () => {
  const response = await import('../data/anomalies.json');
  return response.default;
};

export const fetchCosts = async () => {
  const response = await import('../data/costs.json');
  return response.default;
};

// Simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API with loading simulation
export const mockApi = async <T>(dataFetcher: () => Promise<T>): Promise<T> => {
  await delay(Math.random() * 500 + 200); // Random delay between 200-700ms
  return dataFetcher();
};