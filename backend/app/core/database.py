"""Supabase Client connection, state repository, and in-memory mock fallback."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.core.logging import logger

try:
    from supabase import Client, create_client
    _SUPABASE_AVAILABLE = True
except ImportError:
    _SUPABASE_AVAILABLE = False


class InMemoryTableQuery:
    """Mock query builder providing Supabase-compatible chained methods."""

    def __init__(self, data_store: List[Dict[str, Any]], table_name: str):
        self._data_store = data_store
        self._table_name = table_name
        self._filtered_data = list(data_store)
        self._is_insert = False
        self._is_update = False
        self._is_delete = False
        self._payload: Any = None

    def select(self, *columns: str) -> "InMemoryTableQuery":
        # Keep references for filtering
        return self

    def eq(self, column: str, value: Any) -> "InMemoryTableQuery":
        val_str = str(value)
        self._filtered_data = [
            row for row in self._filtered_data
            if str(row.get(column)) == val_str
        ]
        return self

    def order(self, column: str, desc: bool = False) -> "InMemoryTableQuery":
        try:
            self._filtered_data.sort(
                key=lambda x: str(x.get(column, "")),
                reverse=desc
            )
        except Exception:
            pass
        return self

    def limit(self, count: int) -> "InMemoryTableQuery":
        self._filtered_data = self._filtered_data[:count]
        return self

    def offset(self, count: int) -> "InMemoryTableQuery":
        self._filtered_data = self._filtered_data[count:]
        return self

    def insert(self, payload: Any) -> "InMemoryTableQuery":
        self._is_insert = True
        self._payload = payload
        return self

    def update(self, payload: Any) -> "InMemoryTableQuery":
        self._is_update = True
        self._payload = payload
        return self

    def delete(self) -> "InMemoryTableQuery":
        self._is_delete = True
        return self

    def execute(self) -> Any:
        now_iso = datetime.now(timezone.utc).isoformat()

        if self._is_insert:
            inserted_items = []
            items = self._payload if isinstance(self._payload, list) else [self._payload]
            for item in items:
                record = dict(item)
                if "id" not in record:
                    record["id"] = str(uuid.uuid4())
                if "created_at" not in record:
                    record["created_at"] = now_iso
                if "updated_at" not in record:
                    record["updated_at"] = now_iso
                self._data_store.append(record)
                inserted_items.append(record)
            return type("SupabaseResponse", (), {"data": inserted_items, "count": len(inserted_items)})()

        if self._is_update:
            updated_items = []
            for row in self._filtered_data:
                for k, v in self._payload.items():
                    row[k] = v
                row["updated_at"] = now_iso
                updated_items.append(row)
            return type("SupabaseResponse", (), {"data": updated_items, "count": len(updated_items)})()

        if self._is_delete:
            deleted_ids = {str(r.get("id")) for r in self._filtered_data}
            self._data_store[:] = [
                r for r in self._data_store if str(r.get("id")) not in deleted_ids
            ]
            return type("SupabaseResponse", (), {"data": self._filtered_data, "count": len(self._filtered_data)})()

        # Default select execution
        return type("SupabaseResponse", (), {"data": self._filtered_data, "count": len(self._filtered_data)})()


class InMemorySupabaseClient:
    """In-memory fallback client when Supabase credentials or network are offline."""

    def __init__(self) -> None:
        self.tables: Dict[str, List[Dict[str, Any]]] = {
            "profiles": [
                {
                    "id": "00000000-0000-0000-0000-000000000001",
                    "email": "analyst@aegisos.local",
                    "full_name": "AEGISOS Security Analyst",
                    "role": "analyst",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            ],
            "devices": [
                {
                    "id": "d0000001-0000-0000-0000-000000000001",
                    "user_id": "00000000-0000-0000-0000-000000000001",
                    "device_name": "Pixel 8 Pro (Secured)",
                    "device_type": "android",
                    "os_version": "Android 14",
                    "app_version": "1.0.0",
                    "is_active": True,
                    "last_active_at": datetime.now(timezone.utc).isoformat(),
                    "security_posture": {"rooted": False, "usb_debugging": False, "encryption": "hardware"},
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            ],
            "investigations": [],
            "threat_indicators": [],
            "security_events": [],
            "agent_executions": [],
            "application_audits": [],
            "network_events": [],
            "notification_preferences": [
                {
                    "id": "np000001-0000-0000-0000-000000000001",
                    "user_id": "00000000-0000-0000-0000-000000000001",
                    "email_alerts": True,
                    "push_alerts": True,
                    "sms_alerts": False,
                    "min_severity_alert": "medium",
                }
            ],
            "user_settings": [
                {
                    "id": "us000001-0000-0000-0000-000000000001",
                    "user_id": "00000000-0000-0000-0000-000000000001",
                    "theme": "dark",
                    "ai_analysis_depth": "standard",
                    "auto_quarantine": False,
                    "telemetry_enabled": True,
                    "custom_config": {},
                }
            ],
        }

    def table(self, table_name: str) -> InMemoryTableQuery:
        if table_name not in self.tables:
            self.tables[table_name] = []
        return InMemoryTableQuery(self.tables[table_name], table_name)


# Global fallback singleton
_mock_client = InMemorySupabaseClient()
_real_client: Optional[Any] = None


def get_supabase_client() -> Any:
    """
    Return active Supabase client.
    Connects to live Supabase project if URL and KEY are set,
    otherwise falls back smoothly to in-memory persistence.
    """
    global _real_client
    if settings.SUPABASE_URL and settings.SUPABASE_KEY and _SUPABASE_AVAILABLE:
        if _real_client is None:
            try:
                _real_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                logger.info("supabase_connected", url=settings.SUPABASE_URL)
            except Exception as e:
                logger.warning("supabase_connection_fallback", error=str(e))
                return _mock_client
        return _real_client
    return _mock_client
