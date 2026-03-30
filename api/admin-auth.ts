import './_loadEnv';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured' });
  }

  const { password } = req.body ?? {};
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  return res.status(200).json({ ok: true });
}
