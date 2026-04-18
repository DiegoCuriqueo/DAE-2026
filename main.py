import uuid
import logging
import numpy as np
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field, field_validator

from sklearn.linear_model import LinearRegression

from sqlalchemy import create_engine, Column, String, Float, DateTime, func
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

# --- CONFIGURACIÓN DE LOGS (MLOps Audit) ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("Quantum-API")

# --- CONFIGURACIÓN DE BASE DE DATOS (Persistencia) ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./quantum_hub.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# --- MODELO ORM (Base de Datos) ---
class PaymentModel(Base):
    __tablename__ = "payments"
    id = Column(String, primary_key=True, index=True)
    client = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pendiente")
    created_at = Column(DateTime, default=datetime.utcnow)


# Crear tablas
Base.metadata.create_all(bind=engine)

# --- ESQUEMAS DE VALIDACIÓN (Pydantic) ---
class PaymentBase(BaseModel):
    client: str
    amount: float
    status: Optional[str] = "pendiente"

    @field_validator("client")
    @classmethod
    def client_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("El nombre del cliente no puede estar vacío")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return round(v, 2)

    @field_validator("status")
    @classmethod
    def status_valid(cls, v):
        allowed = ["pendiente", "pagado"]
        if v not in allowed:
            raise ValueError(f"Estado inválido. Opciones: {allowed}")
        return v


class PaymentResponse(PaymentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class CryptoData(BaseModel):
    id: str
    prices: List[float]


class PredictionResponse(BaseModel):
    best_asset: str
    growth_rate: float
    confidence_slope: float
    timestamp: datetime = Field(default_factory=datetime.now)


class StatsResponse(BaseModel):
    total_payments: int
    total_amount: float
    paid_count: int
    paid_amount: float
    pending_count: int
    pending_amount: float


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    database: str


# --- APP FASTAPI ---
app = FastAPI(
    title="Quantum Hub API v3.0",
    description="Backend Profesional con Persistencia, MLOps y Analytics",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependencia para obtener la DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- ENDPOINT DE HEALTH CHECK ---

@app.get("/api/health", response_model=HealthResponse, tags=["Sistema"])
def health_check(db: Session = Depends(get_db)):
    """Verifica el estado del servidor y la conexión a la base de datos."""
    try:
        db.execute(func.now() if engine.dialect.name != "sqlite" else func.date("now"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "operational",
        "timestamp": datetime.now(),
        "version": "3.0.0",
        "database": db_status
    }


# --- ENDPOINT DE ESTADÍSTICAS ---

@app.get("/api/stats", response_model=StatsResponse, tags=["Analytics"])
def get_stats(db: Session = Depends(get_db)):
    """Retorna estadísticas agregadas de todos los pagos."""
    all_payments = db.query(PaymentModel).all()

    paid = [p for p in all_payments if p.status == "pagado"]
    pending = [p for p in all_payments if p.status == "pendiente"]

    return {
        "total_payments": len(all_payments),
        "total_amount": round(sum(p.amount for p in all_payments), 2),
        "paid_count": len(paid),
        "paid_amount": round(sum(p.amount for p in paid), 2),
        "pending_count": len(pending),
        "pending_amount": round(sum(p.amount for p in pending), 2),
    }


# --- ENDPOINTS DE CONTROL DE PAGOS ---

@app.get("/api/payments", response_model=List[PaymentResponse], tags=["Finanzas"])
def list_payments(db: Session = Depends(get_db)):
    """Consulta todos los pagos almacenados en la base de datos."""
    return db.query(PaymentModel).order_by(PaymentModel.created_at.desc()).all()


@app.post("/api/payments", response_model=PaymentResponse, status_code=201, tags=["Finanzas"])
def create_payment(payment: PaymentBase, db: Session = Depends(get_db)):
    """Registra un nuevo pago de forma persistente."""
    new_payment = PaymentModel(
        id=str(uuid.uuid4())[:8],
        client=payment.client,
        amount=payment.amount,
        status=payment.status
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    logger.info(f"✅ Nuevo pago registrado: {new_payment.id} - Cliente: {new_payment.client} - ${new_payment.amount}")
    return new_payment


@app.patch("/api/payments/{payment_id}/toggle", tags=["Finanzas"])
def toggle_payment(payment_id: str, db: Session = Depends(get_db)):
    """Alterna el estado del pago (pendiente/pagado)."""
    db_payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    old_status = db_payment.status
    db_payment.status = "pagado" if db_payment.status == "pendiente" else "pendiente"
    db.commit()
    db.refresh(db_payment)
    logger.info(f"🔄 Pago {payment_id} cambiado: {old_status} → {db_payment.status}")
    return db_payment


@app.delete("/api/payments/{payment_id}", status_code=200, tags=["Finanzas"])
def delete_payment(payment_id: str, db: Session = Depends(get_db)):
    """Elimina un pago de la base de datos."""
    db_payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    client_name = db_payment.client
    db.delete(db_payment)
    db.commit()
    logger.info(f"🗑️ Pago eliminado: {payment_id} - Cliente: {client_name}")
    return {"message": f"Pago de {client_name} eliminado correctamente", "id": payment_id}


# --- ENDPOINT MLOPS (Inteligencia Artificial) ---

@app.post("/api/predict", response_model=PredictionResponse, tags=["MLOps"])
async def predict_trend(data: List[CryptoData]):
    """Analiza tendencias de mercado usando Regresión Lineal."""
    if not data:
        raise HTTPException(status_code=400, detail="Faltan datos de cripto")

    analysis = []
    for item in data:
        if len(item.prices) < 2:
            continue

        # Lógica de Regresión
        X = np.array(range(len(item.prices))).reshape(-1, 1)
        y = np.array(item.prices)

        model = LinearRegression().fit(X, y)
        slope = float(model.coef_[0])
        growth = slope / item.prices[-1] if item.prices[-1] != 0 else 0

        analysis.append({
            "asset": item.id,
            "slope": slope,
            "growth": growth
        })

    if not analysis:
        raise HTTPException(status_code=400, detail="Datos insuficientes para ML")

    best = max(analysis, key=lambda x: x["growth"])

    # Audit Log
    logger.info(f"🤖 MLOps Execution: Win -> {best['asset']} (Growth: {best['growth']:.4%})")

    return {
        "best_asset": best["asset"],
        "growth_rate": best["growth"],
        "confidence_slope": best["slope"]
    }


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"❌ Error no manejado: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"}
    )


# --- SERVIR FRONTEND REACT ---
import os

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend", "dist")

if os.path.isdir(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_spa(full_path: str):
        """Serve React SPA - catch all routes for client-side routing."""
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    # Fallback: serve legacy frontend
    app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Iniciando Servidor Quantum Hub v4.0...")
    uvicorn.run(app, host="0.0.0.0", port=8000)