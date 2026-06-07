"""Thin wrapper around the Supabase client for batched draw inserts and import logging."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from supabase import Client, create_client

from neo_ingest.models import Draw

DEFAULT_BATCH_SIZE = 1000


class SupabaseClient:
    def __init__(self, url: str, service_role_key: str):
        self._client: Client = create_client(url, service_role_key)

    @staticmethod
    def _draw_to_dict(draw: Draw) -> dict:
        return {
            "state_id": draw.state_id,
            "lottery_id": draw.lottery_id,
            "draw_date": draw.draw_date.isoformat(),
            "full_number": draw.full_number,
            "digit_1": draw.digit_1,
            "digit_2": draw.digit_2,
            "digit_3": draw.digit_3,
            "digit_4": draw.digit_4,
            "source_url": draw.source_url,
        }

    def insert_draws(self, draws: list[Draw], batch_size: int = DEFAULT_BATCH_SIZE) -> dict:
        """Insert draws in batches, returning a summary of { inserted, failed, errors }."""
        log_id = self._create_import_log(total_records=len(draws))

        inserted = 0
        failed = 0
        errors: list[str] = []

        for batch_num, start in enumerate(range(0, len(draws), batch_size), start=1):
            batch = draws[start : start + batch_size]
            batch_data = [self._draw_to_dict(d) for d in batch]

            try:
                self._client.table("neo_draws").insert(batch_data).execute()
                inserted += len(batch)
                print(f"✅ Batch {batch_num}: {len(batch)} inserted")
            except Exception as exc:
                failed += len(batch)
                message = f"Batch {batch_num} failed ({len(batch)} records): {exc}"
                errors.append(message)
                print(f"❌ {message}")

        status = "success" if failed == 0 else ("partial" if inserted > 0 else "failed")
        self._update_import_log(log_id, status=status, inserted=inserted, failed=failed, errors=errors)

        return {"inserted": inserted, "failed": failed, "errors": errors}

    def _create_import_log(self, total_records: int) -> Optional[int]:
        try:
            result = (
                self._client.table("neo_import_logs")
                .insert(
                    {
                        "status": "running",
                        "total_records": total_records,
                        "started_at": datetime.now(timezone.utc).isoformat(),
                    }
                )
                .execute()
            )
            rows = result.data or []
            return rows[0]["id"] if rows else None
        except Exception as exc:
            print(f"⚠️  Could not create import log: {exc}")
            return None

    def _update_import_log(
        self,
        log_id: Optional[int],
        *,
        status: str,
        inserted: int,
        failed: int,
        errors: list[str],
    ) -> None:
        if log_id is None:
            return
        try:
            self._client.table("neo_import_logs").update(
                {
                    "status": status,
                    "inserted": inserted,
                    "failed": failed,
                    "errors": errors,
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", log_id).execute()
        except Exception as exc:
            print(f"⚠️  Could not update import log {log_id}: {exc}")
