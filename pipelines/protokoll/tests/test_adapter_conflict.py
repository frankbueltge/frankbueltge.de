from datetime import date

import httpx
import pytest

from protokoll.adapters import conflict
from protokoll.adapters.base import Context
from protokoll.fetch import SourceUnavailable


class FakeJob:
    def result(self):
        return [{"events": 48_213}]


class FakeClient:
    def __init__(self):
        self.queries = []

    def query(self, sql, job_config=None):
        self.queries.append((sql, job_config))
        return FakeJob()


def ctx(factory):
    return Context(client=httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(500))), today=date(2026, 6, 12), env={},
        bq_client_factory=factory)


def test_conflict_counts_yesterday_partition():
    fake = FakeClient()
    m = conflict.measure(ctx(lambda: fake))
    assert m.value == 48_213
    assert m.as_of == "2026-06-11"  # Vortag = vollständiger Tag
    sql, job_config = fake.queries[0]
    assert "_PARTITIONTIME" in sql and "QuadClass IN (3, 4)" in sql
    assert str(job_config.query_parameters[0].value) == "2026-06-11"


def test_conflict_without_factory_raises():
    with pytest.raises(SourceUnavailable):
        conflict.measure(ctx(None))
