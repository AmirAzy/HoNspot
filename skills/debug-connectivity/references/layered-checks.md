# Layer-by-layer checks

Commands in the order worth running. Every "see" column is what the world should look like when the
layer is healthy.

## 1. Name resolution

| Platform | Command | Healthy output |
| --- | --- | --- |
| Linux/macOS | `getent hosts api.internal` · `dig +short api.internal` | One or more addresses you expect |
| macOS | `dscacheutil -q host -a name api.internal` | Address list, bypassing some caching |
| Windows | `Resolve-DnsName api.internal` · `nslookup api.internal` | Expected records |
| Any | `cat /etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts`) | No stale override beating DNS |

Signals:

- Two different answers from two machines → split-horizon DNS, a VPN, or a hosts file.
- A public address where you expect a private one (or the reverse) → the name is not what you think.
- Fast failure in milliseconds → resolution, not routing. A hang usually means the resolver is
  timing out, which is also resolution.

## 2. Route

| Platform | Command | Healthy output |
| --- | --- | --- |
| Linux | `ip route get 10.0.0.5` | `via <gateway> dev eth0 src <your addr>` |
| Linux | `ip addr` | Interface up, address in the expected subnet |
| macOS | `route -n get 10.0.0.5` | `gateway:` on the expected interface |
| Windows | `Find-NetRoute -RemoteIPAddress 10.0.0.5` | Interface, next hop, source address |
| Any | `traceroute` / `tracert` | Hops, ending at the target network |
| Any | `ping` | Only if ICMP is permitted; absence proves nothing |

Signals:

- The source address chosen is a different network than expected → a VPN, a second interface, or a
  Docker bridge captured the route. This is the most common "worked on my laptop" cause.
- Traffic dies at the same hop every time → a firewall or a NAT boundary.

## 3. Port

| Platform | Command | Healthy output |
| --- | --- | --- |
| Server, Linux | `ss -ltnp` | The process listening on `0.0.0.0:<port>` or `[::]:<port>` |
| Server, macOS | `lsof -nP -iTCP:<port> -sTCP:LISTEN` | The process, on the right interface |
| Server, Windows | `Get-NetTCPConnection -LocalPort <port> -State Listen` | `LocalAddress 0.0.0.0` or your LAN address |
| Client, any | `nc -vz host port` (netcat) | `succeeded!` |
| Client, Windows | `Test-NetConnection -ComputerName host -Port <port>` | `TcpTestSucceeded : True` |
| Client, no tools | `curl -v telnet://host:port` | `Connected to host` |

Signals:

- **Listen address is wrong.** `127.0.0.1:5432` cannot be reached from another host, ever. `::1` is
  the IPv6 equivalent. Change the bind address, not the firewall.
- **`Connection refused`** means the packet arrived and the kernel said "nothing here". Firewall is
  *not* the issue; the listener is.
- **Timeout** means nothing answered: firewall, wrong address, wrong network, or a NAT that silently
  drops. Continue to layer 3 evidence from the client side.

## 4. Protocol

The socket opens, and then the conversation fails.

| Symptom | First check | Notes |
| --- | --- | --- |
| TLS handshake error | `openssl s_client -connect host:443 -servername host` | Hostname mismatch, expired cert, missing intermediate chain |
| `curl` hangs after connect | `curl -v --max-time 10` | Request line sent; response never arrives — check the app log *and* the proxy |
| Works with `curl`, not from the app | Proxy environment variables | `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`, and any library-specific proxy config |
| Intermittent resets | MTU / large frames | Common behind VPNs and tunnels; test with a small payload and a large one |
| One host works, another does not, same config | SNI, virtual hosts, client certificates | The server decides by name, not by address |

## Containers and virtual machines

| Situation | What is usually wrong |
| --- | --- |
| App in a container cannot reach the host | Host services bound to `127.0.0.1`; on Docker use `host.docker.internal` (macOS/Windows) or the bridge gateway on Linux |
| Another host cannot reach a container | The port was never published: `-p 8080:8080` binds on the host, container-side only is invisible |
| Compose services cannot see each other by name | Different networks; service name resolves only inside the same user-defined network |
| Everything works until the VPN connects | The VPN replaced the default route; split-tunnel or exclude the private subnet |
| Kubernetes pod cannot reach a service | NetworkPolicy, or a selector that matches no ready endpoints |

## The two-minute version

```bash
# From the FAILING side. Replace host and port.
getent hosts HOST || dig +short HOST      # name
ip route get ADDRESS                      # route
nc -vz HOST PORT                          # port
curl -v --max-time 5 http://HOST:PORT/    # protocol
```

Every step prints something useful even when it fails. That is the point: four commands, one layer
each, no guessing.
