from fastapi import FastAPI

from routers import gpts, tests, nodes, users
from utils.lifespan import lifespan

app = FastAPI(lifespan=lifespan)

app.include_router(users.router)
app.include_router(nodes.router)
app.include_router(gpts.router)
app.include_router(tests.router)