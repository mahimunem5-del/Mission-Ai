import { resolveProvider } from '../../services/mahiEngineResolver.js';
import { mahiEngineAdapter } from './mahiEngineAdapter.js';
import { openrouterAdapter } from './openrouterAdapter.js';

/**
 * Resolves and returns the appropriate AI Provider Adapter for a given model/engine identifier.
 */
export function getProviderAdapter(modelOrEngine) {
  const provider = resolveProvider(modelOrEngine);
  return provider === 'mahi-engine' ? mahiEngineAdapter : openrouterAdapter;
}

export { mahiEngineAdapter, openrouterAdapter };
export default {
  getProviderAdapter,
  mahiEngineAdapter,
  openrouterAdapter
};
