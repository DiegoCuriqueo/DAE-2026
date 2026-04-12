from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.linear_model import LinearRegression
import uvicorn
import os

app = FastAPI(title="CryptoPredict API")

# Models for data validation
class CryptoData(BaseModel):
    id: str
    prices: List[float]

class MultiPredictionRequest(BaseModel):
    cryptos: List[CryptoData]

@app.post("/predict_best")
async def predict_best(request: MultiPredictionRequest):
    """
    Receives historical prices for several cryptos and returns 
    the one with the best growth trend using Linear Regression.
    """
    if not request.cryptos:
        raise HTTPException(status_code=400, detail="No crypto data provided")

    results = []
    for crypto in request.cryptos:
        if len(crypto.prices) < 2:
            continue
            
        # Linear Regression using Scikit-Learn
        X = np.array(range(len(crypto.prices))).reshape(-1, 1)
        y = np.array(crypto.prices)
        
        model = LinearRegression()
        model.fit(X, y)
        
        slope = float(model.coef_[0])
        last_price = float(crypto.prices[-1])
        growth = slope / last_price if last_price != 0 else 0
        
        results.append({
            "id": crypto.id,
            "name": crypto.id.capitalize(),
            "slope": slope,
            "last_price": last_price,
            "growth": growth
        })
    
    if not results:
        raise HTTPException(status_code=400, detail="Not enough data to perform prediction")

    # Find the crypto with the highest growth trend
    best = max(results, key=lambda x: x["growth"])
    
    return {
        "best": best,
        "all_results": results
    }

# Serve the frontend files
# Note: This will serve index.html by default at "/"
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    print("Starting FastAPI server at http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
