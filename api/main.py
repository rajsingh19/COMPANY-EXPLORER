import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scrapper import get_companies

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_cache = None

def load_companies():
    global _cache
    if _cache is None:
        _cache = get_companies()
    return _cache

@app.get("/api/companies")
async def companies_api():
    return load_companies()
