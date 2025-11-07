# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routes import auth_routes, user_routes, trip_routes, media_routes
import os

def create_app() -> FastAPI:
    app = FastAPI(title="Interactive Travel Journal - Backend")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # tighten in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup():
        mongo_url = os.getenv("MONGODB_URL")
        await init_db(mongo_url)

    # include routers
    app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
    app.include_router(user_routes.router, prefix="/api/users", tags=["users"])
    app.include_router(trip_routes.router, prefix="/api/trips", tags=["trips"])
    app.include_router(media_routes.router, prefix="/api/media", tags=["media"])

    @app.get("/api/health")
    async def health():
        return {"status": "ok"}

    return app

app = create_app()
