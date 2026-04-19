import uvicorn
import webbrowser
import threading
import time
import os
from main import app

def open_browser():
    """Waits for the server to start and then opens the browser."""
    time.sleep(1.5)  # Give the server a moment to start
    url = "http://localhost:8000"
    print(f"\n🚀 Opening dashboard at {url}")
    webbrowser.open(url)

if __name__ == "__main__":
    # Start the browser opener in a separate thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    print("✨ Starting CryptoPredict ML Dashboard...")
    print("Press Ctrl+C to stop the server.\n")
    
    # Run the FastAPI server
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
