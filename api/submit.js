export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pabblyResponse = await fetch(
      'https://connect.pabbly.com/webhook-listener/webhook/IjU3NmQwNTZhMDYzMDA0MzQ1MjZiIg_3D_3D_pc/IjU3NjcwNTY5MDYzNjA0M2M1MjZhNTUzMDUxMzEi_pc',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      }
    );

    return res.status(200).json({ success: true, status: pabblyResponse.status });
  } catch (error) {
    console.error('Pabbly forward error:', error);
    return res.status(500).json({ error: 'Failed to forward to Pabbly' });
  }
}
