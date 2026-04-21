from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse

from app.api.routes.chart import router as chart_router
from app.api.routes.health import router as health_router
from app.core.config import get_settings
from app.core.rate_limit import IpRateLimitMiddleware, SimpleWindowLimiter

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Public astrology API: positions, houses, ascendant and aspects.",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.add_middleware(
    IpRateLimitMiddleware,
    limiter=SimpleWindowLimiter(max_requests=settings.ip_rate_limit_per_minute, window_seconds=60),
)


@app.get("/", include_in_schema=False)
def root_redirect(doc: str | None = None):
        if doc:
                requested_doc = doc.lower()
                if requested_doc == "redoc":
                        return RedirectResponse(url="/redoc")
                if requested_doc == "openapi":
                        return RedirectResponse(url="/docs")

        html = f"""
        <!doctype html>
        <html lang=\"en\">
            <head>
                <meta charset=\"utf-8\" />
                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
                <title>{settings.app_name}</title>
                <style>
                    body {{
                        margin: 0;
                        background: #0b1324;
                        color: #e9f0ff;
                        font-family: Inter, Arial, sans-serif;
                        display: grid;
                        place-items: center;
                        min-height: 100vh;
                        padding: 24px;
                    }}
                    main {{
                        width: min(760px, 100%);
                        border: 1px solid #27426b;
                        border-radius: 14px;
                        background: #111e37;
                        padding: 24px;
                    }}
                    h1 {{ margin-top: 0; }}
                    a {{ color: #66d9ff; }}
                    ul {{ line-height: 1.8; }}
                    code {{ background: #0c1830; padding: 2px 6px; border-radius: 6px; }}
                </style>
            </head>
            <body>
                <main>
                    <h1>{settings.app_name}</h1>
                    <p>Esta e a API publica do Astro Kovesh.</p>
                    <p>Escolha um destino:</p>
                    <ul>
                        <li>Frontend: <a href=\"{settings.frontend_url}\" target=\"_blank\" rel=\"noreferrer\">{settings.frontend_url}</a></li>
                        <li>OpenAPI (Swagger): <a href=\"/?doc=openapi\">/?doc=openapi</a></li>
                        <li>ReDoc: <a href=\"/?doc=redoc\">/?doc=redoc</a></li>
                    </ul>
                    <p>Exemplo: <code>GET /?doc=openapi</code> ou <code>GET /?doc=redoc</code>.</p>
                </main>
            </body>
        </html>
        """
        return HTMLResponse(content=html)


@app.get("/redoc", include_in_schema=False)
def custom_redoc() -> HTMLResponse:
        html = f"""
        <!doctype html>
        <html>
            <head>
                <title>{settings.app_name} - ReDoc</title>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {{ margin: 0; background: #0b1324; color: #e9f0ff; font-family: Inter, Arial, sans-serif; }}
                    .fallback {{
                        margin: 12px;
                        padding: 10px 12px;
                        border: 1px solid #35557f;
                        border-radius: 10px;
                        background: #111e37;
                        font-size: 14px;
                    }}
                    .fallback a {{ color: #66d9ff; }}
                </style>
            </head>
            <body>
                <div class="fallback">
                    Caso esta documentacao nao carregue no seu ambiente, use <a href="/docs">/docs</a>.
                </div>
                <redoc spec-url="/openapi.json"></redoc>
                <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
            </body>
        </html>
        """
        return HTMLResponse(content=html)

app.include_router(health_router)
app.include_router(chart_router)
