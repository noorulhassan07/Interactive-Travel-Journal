# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import init_db

# Import route modules
from app.routes.auth_routes import router as auth_router
from app.routes.trip_routes import router as trip_router
from app.routes.media_routes import router as media_router
from app.routes.user_routes import router as user_router


app = FastAPI(
    title="Interactive Travel Journal API",
    description="Backend API for Interactive Travel Journal project.",
    version="1.0.0"
)

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include all route files
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(trip_router, prefix="/trips", tags=["Trips"])
app.include_router(media_router, prefix="/media", tags=["Media"])


# Startup event: initialize database
@app.on_event("startup")
async def start_db():
    await init_db()


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {"message": "🚀 Interactive Travel Journal Backend is running!"}
