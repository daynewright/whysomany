import { config } from 'dotenv';
import { resolve } from 'path';

/**
 * `vercel dev` often does not inject `.env.local` into Node serverless handlers.
 * Load local files only when ADMIN_PASSWORD is unset so production env is unchanged.
 */
if (!process.env.ADMIN_PASSWORD) {
  config({ path: resolve(process.cwd(), '.env.local') });
  config({ path: resolve(process.cwd(), '.env') });
}
