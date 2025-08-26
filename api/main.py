from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import seed, services, tests, text
from api.utils.lifespan import lifespan

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seed.router)
app.include_router(services.router)
app.include_router(tests.router)
app.include_router(text.router)
