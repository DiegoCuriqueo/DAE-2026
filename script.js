// State management
let currentChart = null;
const cryptos = ['bitcoin', 'ethereum', 'solana'];
const historicalData = {};

console.log('Script initialized');

// Linear Regression helper
function calculateTrend(prices) {
    const n = prices.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += prices[i];
        sumXY += i * prices[i];
        sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
}

// Fetch live prices
async function fetchLivePrices() {
    console.log('Fetching live prices...');
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptos.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        console.log('Live prices data:', data);
        
        updatePriceCard('btc', data.bitcoin);
        updatePriceCard('eth', data.ethereum);
        updatePriceCard('sol', data.solana);
    } catch (error) {
        console.error('Error fetching live prices:', error);
    }
}

function updatePriceCard(id, data) {
    const priceEl = document.getElementById(`price-${id}`);
    const trendEl = document.getElementById(`trend-${id}`);
    if (!priceEl || !trendEl) return;
    
    priceEl.innerText = `$${data.usd.toLocaleString()}`;
    const change = data.usd_24h_change;
    trendEl.innerText = `${change > 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%`;
    trendEl.className = `trend ${change > 0 ? 'up' : 'down'}`;
}

// Fetch historical data for charts
async function fetchHistoricalData(id) {
    console.log(`Fetching historical data for ${id}...`);
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`);
        const data = await response.json();
        historicalData[id] = data.prices.map(p => p[1]);
        return data.prices;
    } catch (error) {
        console.error(`Error fetching historical data for ${id}:`, error);
        return null;
    }
}

// Initialize Chart
async function initChart(id) {
    console.log(`Initializing chart for ${id}...`);
    const data = await fetchHistoricalData(id);
    if (!data) {
        console.warn(`No data for ${id}`);
        return;
    }

    const canvas = document.getElementById('mainChart');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    const ctx = canvas.getContext('2d');
    const labels = data.map((_, i) => `Día ${i + 1}`);
    const prices = data.map(p => p[1]);

    if (currentChart) {
        console.log('Destroying previous chart');
        currentChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Precio de ${id.toUpperCase()} (USD)`,
                data: prices,
                borderColor: '#7c3aed',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                backgroundColor: gradient,
                pointBackgroundColor: '#7c3aed',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
    console.log('Chart initialized successfully');
}

// Prediction Logic
async function predictInvestment() {
    console.log('Predicting investment via FastAPI...');
    const btn = document.getElementById('predictBtn');
    const resultEl = document.getElementById('predictionResult');
    
    if (!btn || !resultEl) return;

    btn.disabled = true;
    btn.innerText = 'Consultando IA en Python...';
    resultEl.classList.remove('visible');

    try {
        // Ensure we have data for all cryptos
        const cryptoPayload = [];
        for (const id of cryptos) {
            if (!historicalData[id]) {
                console.log(`Missing data for ${id}, fetching now...`);
                await fetchHistoricalData(id);
            }
            cryptoPayload.push({
                id: id,
                prices: historicalData[id]
            });
        }

        // Send data to FastAPI
        const response = await fetch('/predict_best', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cryptos: cryptoPayload })
        });

        if (!response.ok) throw new Error('Error en la respuesta del servidor');

        const data = await response.json();
        const best = data.best;

        resultEl.innerHTML = `🚀 Recomendación: Invertir en <strong style="color: var(--success)">${best.name}</strong>. <br> <span style="font-size: 0.9rem; color: var(--text-secondary)">Nuestro modelo avanzado en Python (Scikit-Learn) detecta una proyección de crecimiento superior (${(best.growth * 100).toFixed(4)}% relativo).</span>`;
        resultEl.classList.add('visible');
    } catch (err) {
        console.error('Prediction error:', err);
        resultEl.innerText = 'Error al conectar con el servidor de Python. Asegúrese de que main.py esté corriendo.';
        resultEl.classList.add('visible');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Realizar Predicción';
    }
}


// Event Listeners
const selector = document.getElementById('crypto-selector');
if (selector) {
    selector.addEventListener('change', (e) => {
        initChart(e.target.value);
    });
}

const predictBtn = document.getElementById('predictBtn');
if (predictBtn) {
    predictBtn.addEventListener('click', predictInvestment);
}

// Initial Load
window.addEventListener('load', () => {
    console.log('Page loaded, starting initialization');
    fetchLivePrices();
    initChart('bitcoin');
    // Refresh prices every 60 seconds (increased to avoid rate limit)
    setInterval(fetchLivePrices, 60000);
});
