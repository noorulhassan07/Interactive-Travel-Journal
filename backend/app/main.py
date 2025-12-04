from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routes import auth_routes, user_routes, trip_routes, media_routes, admin_router
import os

app = FastAPI(
    title="Interactive Travel Journal API",
    description="Backend for Interactive Travel Journal Application",
    version="1.0.0"
)

# Include Routers
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_routes.router, prefix="/api/users", tags=["Users"])
app.include_router(trip_routes.router, prefix="/api/trips", tags=["Trips"])
app.include_router(media_routes.router, prefix="/api/media", tags=["Media"])

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:80", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    mongo_url = os.getenv("MONGODB_URL")
    await init_db(mongo_url)
    print("🚀 Travel Journal Backend Started Successfully!")

@app.get("/")
async def root():
    return {"message": "Interactive Travel Journal API running", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}
