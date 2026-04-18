const API_BASE = '/api';

// --- Health ---
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

// --- Stats ---
export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Stats fetch failed');
  return res.json();
}

// --- Payments ---
export async function fetchPayments() {
  const res = await fetch(`${API_BASE}/payments`);
  if (!res.ok) throw new Error('Payments fetch failed');
  return res.json();
}

export async function createPayment(payment) {
  const res = await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Create payment failed');
  }
  return res.json();
}

export async function togglePayment(id) {
  const res = await fetch(`${API_BASE}/payments/${id}/toggle`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Toggle payment failed');
  return res.json();
}

export async function deletePayment(id) {
  const res = await fetch(`${API_BASE}/payments/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete payment failed');
  return res.json();
}

// --- Crypto Prices ---
export async function fetchLivePrices() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
  );
  if (!res.ok) throw new Error('Prices fetch failed');
  return res.json();
}

export async function fetchHistoricalPrices(coinId, days = 7) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
  );
  if (!res.ok) throw new Error('Historical fetch failed');
  const data = await res.json();
  return data.prices.map(p => p[1]);
}

// --- AI Prediction ---
export async function fetchPrediction(cryptoPayload) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cryptoPayload),
  });
  if (!res.ok) throw new Error('Prediction failed');
  return res.json();
}
