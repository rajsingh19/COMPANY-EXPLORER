# 🏢 Company Explorer

A full-stack web scraping app that extracts company data from **AmbitionBox** and displays it in a modern React dashboard with charts, filters, search, and comparison tools.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│   React (Vite)  ──── fetch /api/companies ────►            │
│   localhost:5173                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP GET (proxied by Vite)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│                   localhost:8000                            │
│                                                             │
│   GET /api/companies                                        │
│        │                                                    │
│        ▼                                                    │
│   load_companies()  ──── first call only ────►             │
│        │                                                    │
│        ▼                                                    │
│   scrapper.py  ──── HTTP GET (pages 1–29) ────►            │
└──────────────────────────┬──────────────────────────────────┘
                           │ requests + BeautifulSoup
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              AmbitionBox.com                                │
│         /list-of-companies?page=N                          │
└─────────────────────────────────────────────────────────────┘
```

**Data flow in plain words:**

1. React app starts and immediately calls `GET /api/companies`
2. Vite dev server proxies that request to FastAPI on port 8000
3. FastAPI calls `load_companies()` which checks an in-memory cache
4. If cache is empty, it calls `get_companies()` from `scrapper.py`
5. The scraper loops through pages 1–29 of AmbitionBox, parses each page, and returns a list of company dicts
6. FastAPI stores the result in `_cache` and returns it as JSON
7. React receives the JSON array and renders the dashboard

---

## 📁 Project Structure

```
web Scrapping/
├── scrapper.py          # Web scraper (requests + BeautifulSoup)
├── main.py              # FastAPI server + REST API
├── requirements.txt     # Python dependencies
├── frontend/            # React app (Vite)
│   ├── vite.config.js   # Vite config with /api proxy
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root component + layout
│   │   ├── App.module.css       # App layout styles
│   │   ├── index.css            # Global dark theme CSS variables
│   │   ├── useCompanies.js      # Custom hook: fetch + parse helpers
│   │   └── components/
│   │       ├── Navbar.jsx           # Top navigation bar
│   │       ├── Search.jsx           # Live company search
│   │       ├── Filters.jsx          # Rating/review filters + Top 10
│   │       ├── Compare.jsx          # Multi-company comparison + charts
│   │       └── CompanyTable.jsx     # Sortable data table
```

---

## 🕷️ How the Scraper Works (`scrapper.py`)

The scraper uses `requests` to fetch raw HTML and `BeautifulSoup` to parse it.

```
get_companies()
│
├── Loop pages 1 → 29
│   ├── GET https://www.ambitionbox.com/list-of-companies?page=N
│   ├── Parse HTML with BeautifulSoup
│   ├── Find all  div.companyCardWrapper  (one per company)
│   │
│   └── For each card extract:
│       ├── name     →  <h2> tag
│       ├── rating   →  .companyCardWrapper__companyRatingWrapper .rating_text div
│       ├── reviews  →  a.companyCardWrapper__ActionWrapper  where title == "Reviews"
│       ├── about    →  span.companyCardWrapper__interLinking
│       └── stats    →  all  a.companyCardWrapper__ActionWrapper  (Reviews, Salaries, etc.)
│
└── Returns list of dicts:
    [{ name, rating, reviews, about, stats: [...] }, ...]
```

Each page scrape is followed by a `time.sleep(1)` to avoid rate limiting.

---

## ⚡ How FastAPI Works (`main.py`)

FastAPI serves a single REST endpoint:

| Method | Path             | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/api/companies` | Returns all scraped companies as JSON |

**Caching:** The scraper is slow (29 pages × 1s delay ≈ 30s). To avoid re-scraping on every request, the result is stored in a module-level `_cache` variable. It is populated once on the first request and reused for all subsequent calls until the server restarts.

```python
_cache = None

def load_companies():
    global _cache
    if _cache is None:
        _cache = get_companies()   # runs only once
    return _cache
```

**CORS** is enabled with `allow_origins=["*"]` so the React dev server on port 5173 can call the API on port 8000 without browser errors.

---

## ⚛️ How the React Frontend Works

### Data fetching (`useCompanies.js`)
A custom hook calls `GET /api/companies` once on mount using `useEffect`. It returns `{ companies, loading, error }` to any component that needs it.

### Component breakdown

| Component        | What it does |
|------------------|--------------|
| `Navbar`         | Fixed top bar with app name |
| `Search`         | Filters companies by name as you type, shows full details |
| `Filters`        | Filter by min rating, min reviews, or show Top 10 by rating |
| `Compare`        | Pick up to 3 companies, see side-by-side cards + Bar/Radar charts |
| `CompanyTable`   | Full sortable table, best-rated row highlighted in green |

### Charts (Recharts)
The Compare component renders two chart types switchable by tab:
- **Bar Chart** — side-by-side bars for Rating (left Y-axis) and Reviews (right Y-axis)
- **Radar Chart** — polygon overlay comparing Rating and Reviews across selected companies

### Vite proxy
`vite.config.js` proxies all `/api/*` requests to `http://localhost:8000` so you never need to hardcode the backend URL or deal with CORS in development.

---

## 🚀 Setup & Running

### 1. Backend (FastAPI)

```bash
cd "web Scrapping"
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

FastAPI will be available at `http://localhost:8000`

### 2. Frontend (React)

```bash
cd "web Scrapping/frontend"
npm install
npm run dev
```

React will be available at `http://localhost:5173`

> ⚠️ Start the FastAPI backend **before** opening the React app. The first page load triggers scraping which takes ~30 seconds.

---

## 📦 Dependencies

### Python
| Package        | Purpose                        |
|----------------|--------------------------------|
| fastapi        | REST API framework             |
| uvicorn        | ASGI server to run FastAPI     |
| requests       | HTTP requests to AmbitionBox   |
| beautifulsoup4 | HTML parsing                   |
| lxml           | Fast HTML parser for BS4       |

### JavaScript
| Package  | Purpose                          |
|----------|----------------------------------|
| react    | UI framework                     |
| vite     | Dev server + bundler             |
| recharts | Bar and Radar chart components   |
| axios    | (installed, available for use)   |

---

## ✨ Features

- 🔍 **Live search** — instant results as you type
- 🎛️ **Filters** — by minimum rating, minimum reviews
- ⭐ **Top 10** — one-click view of highest rated companies
- ⚖️ **Compare** — pick up to 3 companies, view side-by-side
- 📊 **Charts** — Bar chart and Radar chart for visual comparison
- 🏆 **Best highlight** — top-rated company highlighted in green in table and gold crown in compare
- ↕️ **Sortable table** — click Rating or Reviews column to sort
