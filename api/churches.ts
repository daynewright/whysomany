import './_loadEnv.js';
import { kv } from '@vercel/kv';

/** Runtime is correct; @vercel/kv + @upstash/redis typings can disagree under TS 5.9+ in some installs. */
const kvStore = kv as unknown as {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<string | null>;
};

const KV_KEY = 'churches:list:v1';
const hasKvWriteConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

type Church = {
  name: string;
  denomination: string;
  address: string;
};

function isChurchArray(value: unknown): value is Church[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const church = item as Record<string, unknown>;
    return (
      typeof church.name === 'string' &&
      typeof church.denomination === 'string' &&
      typeof church.address === 'string'
    );
  });
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    if (!hasKvWriteConfig) {
      return res.status(200).json({ churches: [] });
    }
    try {
      const churches = await kvStore.get<Church[]>(KV_KEY);
      return res.status(200).json({ churches: churches ?? [] });
    } catch {
      return res.status(200).json({ churches: [] });
    }
  }

  if (req.method === 'POST') {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured' });
    }

    const { password, churches } = req.body ?? {};
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    if (!isChurchArray(churches)) {
      return res.status(400).json({ error: 'Invalid churches payload' });
    }

    if (!hasKvWriteConfig) {
      return res.status(500).json({
        error: 'KV is not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN.',
      });
    }

    try {
      await kvStore.set(KV_KEY, churches);
      return res.status(200).json({ ok: true, count: churches.length });
    } catch {
      return res.status(500).json({ error: 'Unable to save churches to KV' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
