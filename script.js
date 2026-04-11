// --- VERIFICACIÓN DE SEGURIDAD (Protección de Ruta) ---
if (sessionStorage.getItem('edupay_sesion_activa') !== 'true') {
    // Si no hay sesión activa, expulsar al usuario al login
    window.location.href = 'login.html';
}

let appData = JSON.parse(localStorage.getItem('edupay_uct_exec')) || { pagos: [], modelVersion: 4.0, accuracy: 91.2, recordsSinceRetrain: 0 };
const formatMoney = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => { initChart(); actualizarUI(); });

document.getElementById('dataForm').addEventListener('submit', function(e) {
    e.preventDefault();
    appData.pagos.unshift({
        id: 'MAT-' + new Date().getFullYear() + '-' + Math.random().toString(10).substr(2, 4),
        nombre: document.getElementById('nombre').value,
        mes: document.getElementById('mes').value,
        monto: parseFloat(document.getElementById('monto').value),
        estado: document.getElementById('estado').value,
        riesgo: null, xai_reason: null
    });
    appData.recordsSinceRetrain++;
    guardarEstado(); this.reset(); document.getElementById('nombre').focus();
});

function ejecutarAnalisis() {
    if(appData.pagos.length === 0) return alert("No hay registros en el sistema para analizar.");
    
    const btn = document.querySelector('.btn-primary');
    btn.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Procesando...';
    
    setTimeout(() => {
        appData.pagos.forEach(p => {
            if(p.estado === 'Pagado') { p.riesgo = 0; p.xai_reason = "Arancel regularizado."; } 
            else {
                let r = 35, motivo = "Comportamiento estándar.";
                if(p.monto > 280000) { r += 25; motivo = "Monto de arancel sobre el promedio."; }
                else if(p.mes === "Julio") { r += 30; motivo = "Proximidad a cierre de semestre."; }
                p.riesgo = Math.min(95, r + Math.floor(Math.random() * 15));
                p.xai_reason = motivo;
            }
        });
        btn.innerHTML = '<i class="ph ph-cpu"></i> Ejecutar Análisis Predictivo';
        guardarEstado();
    }, 800);
}

function cambiarEstado(id) {
    const p = appData.pagos.find(x => x.id === id);
    if(p) { p.estado = p.estado === 'Pendiente' ? 'Pagado' : 'Pendiente'; p.riesgo = null; p.xai_reason = null; guardarEstado(); }
}

function iniciarOptimizacion() {
    const modal = document.getElementById('processingModal');
    const logBox = document.getElementById('modalLog');
    modal.style.display = 'flex'; logBox.innerHTML = '';

    const logs = [
        "Iniciando auditoría de nuevos registros...",
        "Calculando desviación del modelo actual...",
        "Entrenando algoritmo predictivo (Ciclo 1/3)...",
        "Ajustando ponderaciones de riesgo...",
        "Validación cruzada exitosa. Precisión mejorada.",
        "Actualizando sistema central..."
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < logs.length) {
            logBox.innerHTML += `<div class="log-item"><i class="ph-fill ph-check-circle"></i> <span>${logs[i]}</span></div>`;
            logBox.scrollTop = logBox.scrollHeight; i++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                modal.style.display = 'none';
                appData.modelVersion = (parseFloat(appData.modelVersion) + 0.1).toFixed(1);
                appData.accuracy = Math.min(99.5, parseFloat(appData.accuracy) + 0.4).toFixed(1);
                appData.recordsSinceRetrain = 0; guardarEstado();
            }, 1500);
        }
    }, 800);
}

function guardarEstado() { localStorage.setItem('edupay_uct_exec', JSON.stringify(appData)); actualizarUI(); }

function actualizarUI() {
    document.getElementById('dataCount').innerText = appData.pagos.length;
    document.getElementById('btnRetrain').style.display = appData.recordsSinceRetrain >= 3 ? 'flex' : 'none';

    if(chartInstance) {
        chartInstance.data.datasets[0].data = [
            appData.pagos.filter(p => p.estado === 'Pagado').reduce((a,b)=>a+b.monto,0),
            appData.pagos.filter(p => p.estado === 'Pendiente').reduce((a,b)=>a+b.monto,0)
        ];
        chartInstance.update();
    }

    const tbody = document.getElementById('tableBody'); tbody.innerHTML = '';
    
    if(appData.pagos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">No hay registros ingresados. Utilice el formulario superior.</td></tr>`; return;
    }

    appData.pagos.forEach(p => {
        let riesgoHTML = `<span style="color:var(--text-muted); font-size:0.8rem;">Pendiente de análisis</span>`;
        if(p.riesgo !== null) {
            let color = '#10b981'; // Verde suave
            if(p.riesgo > 60) color = '#ef4444'; // Rojo suave
            else if(p.riesgo > 25) color = '#f59e0b'; // Naranja suave

            riesgoHTML = `
                <div class="risk-container">
                    <div class="risk-header">
                        <span style="font-weight:600; color:${color}">${p.riesgo}% Riesgo</span>
                        <span class="risk-reason">${p.xai_reason}</span>
                    </div>
                    <div class="risk-bar-bg"><div class="risk-bar-fill" style="width: ${p.riesgo}%; background: ${color};"></div></div>
                </div>`;
        }

        tbody.innerHTML += `
            <tr>
                <td class="td-student"><strong>${p.nombre}</strong><span class="id-tag">ID: ${p.id}</span></td>
                <td><strong>${formatMoney.format(p.monto)}</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">${p.mes}</span></td>
                <td><span class="status-pill ${p.estado.toLowerCase()}">${p.estado}</span></td>
                <td>${riesgoHTML}</td>
                <td><button class="btn-action" onclick="cambiarEstado('${p.id}')" title="Actualizar Pago"><i class="ph ph-arrows-left-right"></i> Alternar</button></td>
            </tr>`;
    });
}

function initChart() {
    const ctx = document.getElementById('financeChart').getContext('2d');
    Chart.defaults.font.family = 'Inter';
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pagado', 'Pendiente'],
            datasets: [{ data: [0, 0], backgroundColor: ['#d4af37', '#00386b'], borderWidth: 0, hoverOffset: 5, cutout: '75%' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// --- LÓGICA DE BÚSQUEDA Y CONSULTAS ---
document.getElementById('searchInput').addEventListener('input', function(e) {
    // Convertimos lo que el usuario escribe a minúsculas para facilitar la búsqueda
    const terminoBusqueda = e.target.value.toLowerCase();
    
    // Obtenemos todas las filas de la tabla
    const filas = document.querySelectorAll('#tableBody tr');
    
    filas.forEach(fila => {
        // Extraemos todo el texto de la fila (Nombre, ID, Estado, etc.)
        const textoFila = fila.innerText.toLowerCase();
        
        // Si el texto de la fila contiene lo que buscamos, la mostramos. Si no, la ocultamos.
        if (textoFila.includes(terminoBusqueda)) {
            fila.style.display = ''; 
        } else {
            fila.style.display = 'none'; 
        }
    });
});

// --- FUNCIÓN PARA CERRAR SESIÓN ---
function cerrarSesion() {
    // 1. Borramos el "token" de seguridad simulado
    sessionStorage.removeItem('edupay_sesion_activa');
    
    // 2. Redirigimos al usuario a la pantalla de login
    window.location.href = 'login.html';
}