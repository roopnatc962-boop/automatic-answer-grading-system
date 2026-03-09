from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import grading, uploads, submissions


def create_app() -> FastAPI:
    app = FastAPI(title="Automatic Answer Valuation and Grading System")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(grading.router, prefix="/api")
    app.include_router(uploads.router, prefix="/api")
    app.include_router(submissions.router, prefix="/api")

    return app


app = create_app()


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}

