# api/index.py
from fastapi import FastAPI
from scrapper import get_companies

app = FastAPI()

_cache = None

def load_companies():
    global _cache
    if _cache is None:
        _cache = get_companies()
    return _cache

@app.get("/api/companies")
async def companies_api():
    return load_companies()