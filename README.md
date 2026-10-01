# A Node-RED node for getting data from energy-charts.info

A <a href="https://nodered.org">Node-RED</a> node to provide a wrapper around the <a href="https://energy-charts.info">energy-charts.info</a> <a href="https://api.energy-charts.info/">api</a>

## Nodes

- [x] prices – day-ahead spot market prices (`/price`)
- [x] power – public net electricity production (`/public_power`)
- [x] import_export – cross-border trading (`/cbet`) or physical flows (`/cbpf`)
- [x] ren_share – renewable share forecast (`/ren_share_forecast`) or daily averages (`/ren_share_daily_avg`)

## Usage

Every node sends a request when it receives a message and puts the API response into `msg.payload`.
The parameters configured in the node can be overridden per message:

| Node          | msg properties                     |
|---------------|------------------------------------|
| prices        | `bzn`, `start`, `end`              |
| power         | `country`, `start`, `end`          |
| import_export | `country`, `flow` (`cbet`/`cbpf`), `start`, `end` |
| ren_share     | `country`, `mode` (`forecast`/`daily_avg`), `year` |

`start` and `end` accept a date (`2026-01-01`), an ISO 8601 timestamp (`2026-01-01T17:00Z`) or a UNIX timestamp.
Without `start` the API returns the current day.

Errors are passed to `catch` nodes, `msg.request` contains the endpoint, the request parameters and the HTTP status.

## Rate limits

The public API allows about 2 requests per minute per endpoint. When the limit is exceeded the node status
shows the `Retry-After` time.

## Data license

The data is provided by [Energy-Charts.info](https://energy-charts.info) under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
