# Failure signatures

The exact wording of a failure tells you the layer before you run anything. Read the message, not the
stack trace.

## Connection errors

| Message (verbatim-ish) | Layer | What it actually means | First check |
| --- | --- | --- | --- |
| `Connection refused` | Port | The host answered and nothing is listening on that address:port | `ss -ltnp`, bind address |
| `Connection timed out` / `ETIMEDOUT` | Route or port | No answer at all: dropped by a firewall, wrong address, wrong network | `ip route get`, then `nc -vz` from the client |
| `No route to host` / `EHOSTUNREACH` | Route | The local stack has no path, or ICMP unreachable came back | `ip route get`, VPN and interface state |
| `Network is unreachable` / `ENETUNREACH` | Route | No interface on that network, or no default route | `ip addr`, `ip route` |
| `Cannot assign requested address` | Port (client side) | Out of ephemeral ports, or binding to an address that is not yours | `ss -s`, bind config |
| `Connection reset by peer` / `ECONNRESET` | Protocol | Something accepted and then killed it: app crash, proxy, idle timeout | Server logs, proxy logs, time-to-reset |
| `Broken pipe` / `EPIPE` | Protocol | The peer closed while you were writing | Who closed first, and why |
| `Too many open files` / `EMFILE` | Local | File-descriptor limit, not the network | `ulimit -n`, `lsof \| wc -l` |
| `getaddrinfo ENOTFOUND` | Name | The resolver returned nothing | `dig`, hosts file, search domains |
| `getaddrinfo EAI_AGAIN` | Name | Temporary resolver failure: timeouts, unreachable DNS server | Resolver config, VPN DNS |
| `certificate signed by unknown authority` | Protocol (TLS) | Missing intermediate or private CA not trusted | `openssl s_client -showcerts` |
| `certificate is valid for X, not Y` | Protocol (TLS) | SNI / virtual host mismatch | Connect with the server name, not the IP |
| `SSL_ERROR_...` after connect | Protocol (TLS) | Version or cipher mismatch, or a plaintext connection to a TLS port | `openssl s_client -tls1_2` |

## Timing signatures

| Shape | Reading |
| --- | --- |
| Fails in < 10 ms | Something local said no: name resolution from cache, a refusal, a closed port |
| Fails at a round number (5 s, 30 s, 60 s, 75 s) | A timeout fired, on either side. Find out whose — the number tells you which config |
| Hangs, then works on retry | Packet loss, MTU, or a load balancer with one dead backend |
| Works once, then fails for minutes | A stateful firewall or a connection-tracking table; or rate limiting |
| Slower from one network only | Path MTU, proxy, or DNS round-trip |

## Signals that are not network problems

Worth ruling out early, because they look identical from the client:

- **Wrong port at the client** (a default that changed in a config file).
- **Wrong environment** (a `.env` pointing at staging, or a proxy variable exported in one shell).
- **IPv6 vs IPv4** — the name resolves to `::1` on one machine and `127.0.0.1` on another; `localhost`
  is the usual culprit. Bind explicitly, or test with `curl -4` / `curl -6`.
- **Two processes fighting for one port** — the old one keeps the socket, the new one logs nothing
  useful. `ss -ltnp` shows the PID; `SO_REUSEPORT` hides it.
- **Clock skew** for anything with signed requests: `date -u` on both sides.

## What to paste into an issue or a report

An unresolved connection problem reported well is solvable in minutes. Include:

1. Both endpoints: `host:port` on each side, and whether they are containers.
2. The exact error text and how long it took to appear.
3. The four commands from `references/layered-checks.md` run **from the failing side**.
4. What changed since it last worked — an upgrade, a network, a certificate, a config.
5. What you already ruled out, and how.

That list is also a good description of what an agent should produce before asking a human.
