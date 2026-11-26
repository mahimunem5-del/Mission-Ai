# Phase 10 — Controlled Load & Stress Test Report (`PHASE10_LOAD_TEST_REPORT.md`)

**Branch**: `cleanup-backend-restructure`  
**Environment**: Local Windows Express staging server + live Upstash Redis + live Mahi Engine / OpenRouter

---

## 1. Controlled Concurrency Results

| Endpoint / Workload | Concurrency | Success / Total | P50 | P95 | P99 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/models` | `10` | `10 / 10` (`100%`) | `30ms` | `33ms` | `33ms` |
| `GET /api/models` | `25` | `25 / 25` (`100%`) | `22ms` | `23ms` | `23ms` |
| `GET /api/models` | `50` | `50 / 50` (`100%`) | `30ms` | `32ms` | `32ms` |
| `GET /api/models` | `100` | `100 / 100` (`100%`) | `53ms` | `57ms` | `58ms` |
| `GET /api/models` (burst stress) | `500` | `371 / 500` (`74.2%`, `129` client socket drops) | `156ms` | `214ms` | `219ms` |
| `GET /api/tools` | `10` | `10 / 10` (`100%`) | `4ms` | `4ms` | `4ms` |
| `GET /api/tools` | `25` | `25 / 25` (`100%`) | `6ms` | `6ms` | `6ms` |
| `GET /api/tools` | `50` | `50 / 50` (`100%`) | `10ms` | `12ms` | `12ms` |

*(Measured `/api/tools` at 50 concurrent improved from baseline `p50: 16ms` / `p99: 19ms` to `p50: 10ms` / `p99: 12ms`.)*

---

## 2. Concurrent Streaming & Resource Cleanup

- **10 Simultaneous `/api/chat/ui-stream` Requests** (8 full completions + 2 concurrent `AbortController` cancellations at `300ms`):
  - `10 / 10` handled cleanly (`streamOk: 10`), `activeAfter: 0` (`getActiveStreamCount()` returned to `0`).
- **Process Memory**:
  - Baseline: `rss: 156 MB`, `heapUsed: 49 MB`
  - Post-load (700+ requests + 10 concurrent streams): `rss: 209 MB`, `heapUsed: 54 MB` (`+5 MB` heap delta).

## 3. Limitations & Capacity Honesty

- Single-node Windows Express staging (`backlog: 511`) saturated at `500` simultaneous connections from a single Node `fetch` client (`371/500` succeeded, `129` client socket resets). Production high-concurrency scaling (>100–500 concurrent users) requires reverse-proxy buffering (Nginx/Cloudflare) and horizontal worker scaling.
