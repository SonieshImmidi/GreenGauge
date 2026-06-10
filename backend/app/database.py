from urllib.parse import parse_qs, urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


def _normalize_db_url(url: str) -> tuple[str, dict]:
    """Make a connection URL work with SQLAlchemy's async drivers.

    - Forces the asyncpg driver for Postgres URLs (handles the ``postgres://``
      and ``postgresql://`` forms that hosts like Neon/Render hand out).
    - Strips libpq-only query params (``sslmode``, ``channel_binding``) that
      asyncpg does not accept, translating ``sslmode`` into an asyncpg
      ``ssl`` connect arg so TLS is still enforced.
    """
    connect_args: dict = {}

    if url.startswith("sqlite"):
        return url, connect_args

    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]

    parts = urlsplit(url)
    query = parse_qs(parts.query)

    sslmode = query.get("sslmode", [None])[0]
    if sslmode in ("require", "prefer", "allow", "verify-ca", "verify-full"):
        connect_args["ssl"] = True

    # asyncpg negotiates SCRAM channel binding itself; drop the libpq flags.
    clean_url = urlunsplit((parts.scheme, parts.netloc, parts.path, "", parts.fragment))
    return clean_url, connect_args


_db_url, _connect_args = _normalize_db_url(settings.DATABASE_URL)

engine = create_async_engine(
    _db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create all tables on startup."""
    async with engine.begin() as conn:
        from app.models import user, carbon  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
