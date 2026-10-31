import os
import sys
from unittest.mock import Mock
import sqlalchemy.ext.asyncio as sa_asyncio

# Ensure the app package is importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Unit tests avoid real engines. Explicit PostgreSQL integration runs retain the
# production engine and use the configured local database.
if os.getenv("RUN_POSTGRES_INTEGRATION") != "1":
    os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
    sa_asyncio.create_async_engine = Mock(return_value=None)
