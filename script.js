/**
 * ============================================
 *  QUANTUM HUB v3.0 - FRONTEND ENGINE
 *  Sistema completo: Crypto ML + Finanzas + UX
 * ============================================
 */

// --- CONFIGURATION & STATE ---
const API_BASE = "/api";
const cryptos = ['bitcoin', 'ethereum', 'solana'];
const historicalData = {};
let currentChart = null;
let donutChart = null;
let deleteTargetId = null;
let deleteTargetClient = null;
const activityLog = [];

// ============================
//  TOAST NOTIFICATION SYSTEM
// ============================
function showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300);">&times;</button>
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

// ============================
//  CLOCK
// ============================
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
    const el = document.getElementById('header-clock');
    if (el) el.textContent = `${dateStr} · ${timeStr}`;
}

// ============================
//  SERVER HEALTH CHECK
// ============================
async function checkServerHealth() {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
            const data = await res.json();
            dot.classList.remove('offline');
            text.textContent = `API v${data.version} · OK`;
        } else {
            throw new Error('Not OK');
        }
    } catch {
        dot.classList.add('offline');
        text.textContent = 'OFFLINE';
    }
}

// ============================
//  STATS DASHBOARD
// ============================
async function loadStats() {
    try {
        const res = await fetch(`${API_BASE}/stats`);
        const s = await res.json();

        animateValue('stat-total-count', s.total_payments);
        animateValue('stat-paid-count', s.paid_count);
        animateValue('stat-pending-count', s.pending_count);

        const rate = s.total_payments > 0 ? ((s.paid_count / s.total_payments) * 100).toFixed(1) : '0.0';
        document.getElementById('stat-rate').textContent = `${rate}%`;
        document.getElementById('stat-rate').classList.remove('skeleton');

        document.getElementById('stat-total-amount').textContent = `$${s.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} total`;
        document.getElementById('stat-paid-amount').textContent = `$${s.paid_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} recaudado`;
        document.getElementById('stat-pending-amount').textContent = `$${s.pending_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} por cobrar`;

        updateDonutChart(s.paid_count, s.pending_count);
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

function animateValue(elementId, target) {
    const el = document.getElementById(elementId);
    el.classList.remove('skeleton');
    const start = parseInt(el.textContent) || 0;
    const duration = 600;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ============================
//  CRYPTO PRICES
// ============================
async function fetchLivePrices() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptos.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();

        if (data.bitcoin) updatePriceCard('btc', data.bitcoin);
        if (data.ethereum) updatePriceCard('eth', data.ethereum);
        if (data.solana) updatePriceCard('sol', data.solana);
    } catch (error) {
        console.error('Error fetching live prices:', error);
        // Show placeholder data on API failure
        document.querySelectorAll('.crypto-price').forEach(el => el.classList.remove('skeleton'));
    }
}

function updatePriceCard(id, data) {
    const priceEl = document.getElementById(`price-${id}`);
    const trendEl = document.getElementById(`trend-${id}`);
    if (!priceEl || !data) return;

    priceEl.classList.remove('skeleton');
    priceEl.textContent = `$${data.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const change = data.usd_24h_change || 0;
    const isUp = change >= 0;
    trendEl.className = `crypto-trend ${isUp ? 'up' : 'down'}`;
    trendEl.innerHTML = `
        <span>${isUp ? '↑' : '↓'}</span> ${isUp ? '+' : ''}${change.toFixed(2)}%
        <span class="crypto-trend-label">Hoy</span>
    `;
}

// ============================
//  CHART: CRYPTO TREND
// ============================
async function fetchHistoricalData(id) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`);
        const data = await response.json();
        historicalData[id] = data.prices.map(p => p[1]);
        return data.prices;
    } catch (err) {
        console.error(`Error en histórico de ${id}:`, err);
        return null;
    }
}

async function initChart(id) {
    const data = await fetchHistoricalData(id);
    if (!data) return;

    const ctx = document.getElementById('mainChart').getContext('2d');
    const prices = data.map(p => p[1]);
    const labels = data.map((_, i) => `Día ${i + 1}`);

    if (currentChart) currentChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Precio USD',
                data: prices,
                borderColor: '#a78bfa',
                borderWidth: 2.5,
                fill: true,
                backgroundColor: gradient,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#a78bfa',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(14, 18, 27, 0.95)',
                    borderColor: 'rgba(124, 58, 237, 0.3)',
                    borderWidth: 1,
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    cornerRadius: 10,
                    padding: 12,
                    titleFont: { weight: '700', size: 13 },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: ctx => `$${ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 10 },
                        callback: val => `$${(val / 1000).toFixed(1)}k`
                    },
                    border: { display: false }
                }
            }
        }
    });
}

// ============================
//  CHART: DONUT (Payment Stats)
// ============================
function updateDonutChart(paid, pending) {
    const ctx = document.getElementById('donutChart');
    if (!ctx) return;

    if (donutChart) donutChart.destroy();

    const total = paid + pending;
    if (total === 0) {
        // Show empty state
        return;
    }

    donutChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Pagados', 'Pendientes'],
            datasets: [{
                data: [paid, pending],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
                borderColor: ['rgba(16, 185, 129, 0.2)', 'rgba(245, 158, 11, 0.2)'],
                borderWidth: 2,
                hoverOffset: 8,
                spacing: 4,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { size: 11, weight: '600' },
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(14, 18, 27, 0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    cornerRadius: 10,
                    padding: 12
                }
            }
        }
    });
}

// ============================
//  ACTIVITY FEED
// ============================
function addActivity(type, message) {
    activityLog.unshift({ type, message, time: new Date() });
    if (activityLog.length > 15) activityLog.pop();
    renderActivityFeed();
}

function renderActivityFeed() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;

    if (activityLog.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>Sin actividad reciente</p>
            </div>`;
        return;
    }

    feed.innerHTML = activityLog.map((a, i) => `
        <div class="activity-item" style="animation-delay: ${i * 0.05}s">
            <div class="activity-icon ${a.type}">${a.type === 'created' ? '💳' : a.type === 'paid' ? '✅' : a.type === 'deleted' ? '🗑️' : '🔄'}</div>
            <div class="activity-text">${a.message}</div>
            <span class="activity-time">${formatTimeAgo(a.time)}</span>
        </div>
    `).join('');
}

function formatTimeAgo(date) {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 5) return 'ahora';
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

// ============================
//  PAYMENTS MANAGEMENT
// ============================
async function loadPayments() {
    try {
        const response = await fetch(`${API_BASE}/payments`);
        const payments = await response.json();
        renderPaymentsTable(payments);
        loadStats(); // Refresh stats too
    } catch (err) {
        console.error("Error cargando pagos:", err);
        showToast('error', 'Error', 'No se pudieron cargar los pagos');
    }
}

function renderPaymentsTable(payments) {
    const tableBody = document.getElementById('payment-table-body');
    const countEl = document.getElementById('table-count');
    const totalEl = document.getElementById('table-total');

    if (!payments || payments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <p>No hay pagos registrados. ¡Crea el primero!</p>
                    </div>
                </td>
            </tr>`;
        countEl.textContent = '0 registros';
        totalEl.textContent = 'Total: $0.00';
        return;
    }

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    countEl.textContent = `${payments.length} registro${payments.length !== 1 ? 's' : ''}`;
    totalEl.textContent = `Total: $${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    tableBody.innerHTML = payments.map(p => {
        const date = new Date(p.created_at);
        const dateStr = date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' });
        const isPaid = p.status === 'pagado';

        return `
            <tr>
                <td class="td-client">${escapeHtml(p.client)}</td>
                <td class="td-amount">$${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td>
                    <span class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}" 
                          onclick="togglePaymentStatus('${p.id}')" 
                          title="Click para cambiar estado">
                        <span class="status-dot-mini"></span>
                        ${p.status.toUpperCase()}
                    </span>
                </td>
                <td class="td-date">${dateStr}</td>
                <td class="td-id">${p.id}</td>
                <td class="td-actions">
                    <button class="btn-icon" onclick="confirmDelete('${p.id}', '${escapeHtml(p.client)}')" title="Eliminar pago">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </td>
            </tr>`;
    }).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

async function savePayment() {
    const clientInput = document.getElementById('client-name');
    const amountInput = document.getElementById('payment-amount');
    const statusInput = document.getElementById('payment-status');

    // Clear previous errors
    clientInput.classList.remove('error');
    amountInput.classList.remove('error');

    let valid = true;

    if (!clientInput.value.trim()) {
        clientInput.classList.add('error');
        valid = false;
    }

    if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
        amountInput.classList.add('error');
        valid = false;
    }

    if (!valid) {
        showToast('warning', 'Campos incompletos', 'Por favor completa todos los campos correctamente');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client: clientInput.value.trim(),
                amount: parseFloat(amountInput.value),
                status: statusInput.value
            })
        });

        if (res.ok) {
            const data = await res.json();
            closeModal('modal-pago');
            clientInput.value = '';
            amountInput.value = '';
            statusInput.value = 'pendiente';

            showToast('success', 'Pago registrado', `$${data.amount.toLocaleString()} para ${data.client}`);
            addActivity('created', `Nuevo pago: <strong>${escapeHtml(data.client)}</strong> — $${data.amount.toLocaleString()}`);
            loadPayments();
        } else {
            const err = await res.json();
            showToast('error', 'Error', err.detail || 'No se pudo guardar el pago');
        }
    } catch (err) {
        console.error("Error al guardar pago:", err);
        showToast('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    }
}

async function togglePaymentStatus(id) {
    try {
        const res = await fetch(`${API_BASE}/payments/${id}/toggle`, { method: 'PATCH' });
        if (res.ok) {
            const data = await res.json();
            const statusText = data.status === 'pagado' ? 'Pagado' : 'Pendiente';
            showToast('info', 'Estado actualizado', `${data.client} → ${statusText}`);
            addActivity(data.status === 'pagado' ? 'paid' : 'toggled', `<strong>${escapeHtml(data.client)}</strong> marcado como ${statusText}`);
            loadPayments();
        }
    } catch (err) {
        console.error("Error al cambiar estado:", err);
        showToast('error', 'Error', 'No se pudo cambiar el estado');
    }
}

function confirmDelete(id, client) {
    deleteTargetId = id;
    deleteTargetClient = client;
    document.getElementById('confirm-client').textContent = client;
    openModal('modal-confirm');
}

async function executeDelete() {
    if (!deleteTargetId) return;

    try {
        const res = await fetch(`${API_BASE}/payments/${deleteTargetId}`, { method: 'DELETE' });
        if (res.ok) {
            closeModal('modal-confirm');
            showToast('success', 'Pago eliminado', `Se eliminó el pago de ${deleteTargetClient}`);
            addActivity('deleted', `Eliminado: <strong>${escapeHtml(deleteTargetClient)}</strong>`);
            loadPayments();
        } else {
            showToast('error', 'Error', 'No se pudo eliminar el pago');
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
        showToast('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    } finally {
        deleteTargetId = null;
        deleteTargetClient = null;
    }
}

// ============================
//  SEARCH & FILTER
// ============================
function setupSearch() {
    const searchInput = document.getElementById('payment-search');
    const globalSearch = document.getElementById('global-search');

    let debounceTimer;

    const doSearch = (query) => {
        const rows = document.querySelectorAll('#payment-table-body tr');
        const q = query.toLowerCase().trim();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = q === '' || text.includes(q) ? '' : 'none';
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => doSearch(e.target.value), 200);
        });
    }

    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                doSearch(e.target.value);
                // Also update payment-search to stay in sync
                if (searchInput) searchInput.value = e.target.value;
            }, 200);
        });
    }
}

// ============================
//  CSV EXPORT
// ============================
function exportCSV() {
    const rows = document.querySelectorAll('#payment-table-body tr');
    if (rows.length === 0 || (rows.length === 1 && rows[0].querySelector('.empty-state'))) {
        showToast('warning', 'Sin datos', 'No hay pagos para exportar');
        return;
    }

    let csv = 'Cliente,Monto,Estado,Fecha,ID\n';

    rows.forEach(row => {
        if (row.style.display === 'none') return;
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            const client = cells[0].textContent.trim().replace(/,/g, ';');
            const amount = cells[1].textContent.trim();
            const status = cells[2].textContent.trim();
            const date = cells[3].textContent.trim();
            const id = cells[4].textContent.trim();
            csv += `"${client}","${amount}","${status}","${date}","${id}"\n`;
        }
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum_hub_pagos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('success', 'Exportado', 'Archivo CSV descargado correctamente');
}

// ============================
//  AI PREDICTION
// ============================
async function predictInvestment() {
    const btn = document.getElementById('predictBtn');
    const resultEl = document.getElementById('predictionResult');

    btn.disabled = true;
    btn.innerHTML = `<span style="animation: pulse 1s infinite;">🔄 Analizando con MLOps...</span>`;

    try {
        // Ensure we have data
        const cryptoPayload = await Promise.all(cryptos.map(async id => ({
            id: id,
            prices: historicalData[id] || (await fetchHistoricalData(id)) || []
        })));

        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cryptoPayload)
        });

        if (!response.ok) throw new Error('Prediction failed');

        const data = await response.json();

        document.getElementById('prediction-asset').textContent = data.best_asset.toUpperCase();
        document.getElementById('prediction-confidence').textContent = `Confianza: ${(data.growth_rate * 100).toFixed(4)}% · Slope: ${data.confidence_slope.toFixed(2)}`;

        resultEl.classList.add('visible');
        showToast('success', 'Predicción completada', `IA recomienda: ${data.best_asset.toUpperCase()}`);
        addActivity('created', `🤖 IA predice: <strong>${data.best_asset.toUpperCase()}</strong> (${(data.growth_rate * 100).toFixed(2)}%)`);
    } catch (err) {
        console.error("Error IA:", err);
        showToast('error', 'Error en predicción', 'No se pudo ejecutar el modelo de IA');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '⚡ Ejecutar MLOps Predictor';
    }
}

// ============================
//  MODAL MANAGEMENT
// ============================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Clear form errors
        modal.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

// ============================
//  MOBILE SIDEBAR
// ============================
function setupMobileSidebar() {
    const hamburger = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const toggle = () => {
        sidebar.classList.toggle('open');
        hamburger.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    };

    const close = () => {
        sidebar.classList.remove('open');
        hamburger.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (hamburger) hamburger.addEventListener('click', toggle);
    if (overlay) overlay.addEventListener('click', close);

    // Close sidebar when clicking nav items on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) close();
        });
    });
}

// ============================
//  NAV ITEM ACTIVE STATE
// ============================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// ============================
//  KEYBOARD SHORTCUTS
// ============================
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => {
                closeModal(m.id);
            });
        }

        // Ctrl+K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('global-search')?.focus();
        }

        // Ctrl+N to open new payment modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openModal('modal-pago');
            document.getElementById('client-name')?.focus();
        }
    });
}

// ============================
//  INITIALIZATION
// ============================
document.addEventListener('DOMContentLoaded', () => {
    // Initial data loading
    fetchLivePrices();
    initChart('bitcoin');
    loadPayments();
    checkServerHealth();
    updateClock();

    // Setup intervals
    setInterval(updateClock, 1000);
    setInterval(fetchLivePrices, 120000);
    setInterval(checkServerHealth, 30000);
    setInterval(() => renderActivityFeed(), 60000); // Refresh time labels

    // Event listeners
    document.getElementById('predictBtn')?.addEventListener('click', predictInvestment);
    document.getElementById('btn-save-payment')?.addEventListener('click', savePayment);
    document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);

    // Crypto selector
    document.getElementById('crypto-selector')?.addEventListener('change', (e) => {
        initChart(e.target.value);
    });

    // Modal: open/close
    document.getElementById('btn-open-modal')?.addEventListener('click', () => {
        openModal('modal-pago');
        setTimeout(() => document.getElementById('client-name')?.focus(), 300);
    });
    document.getElementById('btn-cancel-modal')?.addEventListener('click', () => closeModal('modal-pago'));

    // Confirm delete modal
    document.getElementById('btn-cancel-delete')?.addEventListener('click', () => closeModal('modal-confirm'));
    document.getElementById('btn-confirm-delete')?.addEventListener('click', executeDelete);

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    // Enter to submit payment
    document.getElementById('payment-amount')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') savePayment();
    });
    document.getElementById('client-name')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('payment-amount')?.focus();
    });

    // Setup features
    setupSearch();
    setupMobileSidebar();
    setupNavigation();
    setupKeyboardShortcuts();

    console.log('%c⚡ Quantum Hub v3.0 initialized', 'color: #a78bfa; font-weight: bold; font-size: 14px;');
});