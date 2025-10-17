from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import traceback
from .api import api_router
from .core.logger import logger

# Create FastAPI app
app = FastAPI(
    title="LLM Lab API",
    description="A comprehensive LLM testing and comparison API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests"""
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request started: {request.method} {request.url}",
        method=request.method,
        url=str(request.url),
        client_ip=request.client.host if request.client else "unknown"
    )
    
    # Process request
    try:
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Request completed: {request.method} {request.url} - Status: {response.status_code}",
            method=request.method,
            url=str(request.url),
            status_code=response.status_code,
            process_time=round(process_time, 4),
            client_ip=request.client.host if request.client else "unknown"
        )
        
        return response
        
    except Exception as e:
        # Log error
        process_time = time.time() - start_time
        logger.error(
            f"Request failed: {request.method} {request.url} - Error: {str(e)}",
            method=request.method,
            url=str(request.url),
            error=str(e),
            process_time=round(process_time, 4),
            client_ip=request.client.host if request.client else "unknown",
            traceback=traceback.format_exc()
        )
        
        # Return error response
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "detail": str(e)}
        )

# Include API routes
app.include_router(api_router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to LLM Lab API", 
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("LLM Lab API starting up...")
    logger.info("API Documentation available at /docs")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("LLM Lab API shutting down...")

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting LLM Lab API server...")
    logger.info("Server will be available at http://localhost:8000")
    logger.info("API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info",
        access_log=True
    )
