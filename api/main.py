from fastapi import FastAPI

from routers import auth, seed, services, tests
from utils.lifespan import lifespan

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(seed.router)
app.include_router(services.router)
app.include_router(tests.router)