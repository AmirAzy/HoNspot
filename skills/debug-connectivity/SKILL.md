---
name: debug-connectivity
description: Diagnose why two processes, two machines, a container and its host, or a client and a server cannot exchange traffic. Use when a connection times out or is refused, when a service works locally but not from another host, when a request works on one network and fails on another, or when someone asks to "fix the networking" without a single measurement yet.
license: MIT
---

# Debug connectivity

A connection either resolves a name, picks a route, opens a socket and completes a protocol
handshake — or it fails at exactly one of those steps. Four steps, four very different fixes. The
whole job is to find out **which step**, with a command, before changing any code.

## When to use

- "It cannot reach the database / the API / the other device."
- "Works on my machine" and the other machine is a container, a VM, a phone, or a colleague.
- A timeout, a reset, a refusal, a TLS error, or a request that hangs and then retries forever.
- Anyone has proposed a code change (a retry loop, a discovery library, a proxy) **before** running a
  single diagnostic command.

Do not use this to explain a slow-but-working connection (see `diagnose-slow`) or a protocol-level
bug where the socket is demonstrably open (see the layered table in
[references/layered-checks.md](references/layered-checks.md) for how to tell them apart).

## Ground rules

1. **Layer first, code never.** You cannot fix a firewall by editing a client. If the packet does not
   arrive, no amount of application code matters.
2. **One change at a time, and say what you expect.** "I am adding `--verbose` to see whether the
   handshake starts" is a hypothesis. Changing four things at once is a coin flip.
3. **The failing side is the side that reports.** A timeout on the client means *nothing was heard
   back*; it does not mean the server did not receive it.
4. **Loopback is not the network.** A service bound to `127.0.0.1` is invisible to every other host
   by design. Check the bind address before checking anything else.
5. **Do not "fix" it by disabling security.** Turning off TLS verification, opening all ports, or
   running as root converts a bug into an incident. If a fix requires that, stop and report.

## Procedure

1. **Write one sentence of the symptom** with the exact error text, the two endpoints, and whether
   anything ever worked. Example: "`curl` to `10.0.0.5:5432` returns `Connection timed out` after 30 s;
   it worked yesterday from the same laptop."

2. **Establish the shape of the failure.** Refused (something answered, nothing listening), timed out
   (nothing answered), reset (something answered and then killed it), or name resolution (never got an
   address). Each points at a different layer and [references/failure-signatures.md](references/failure-signatures.md)
   maps every signature to its layer.

3. **Check the four layers in order — never skip, never reorder.**

   | Layer | Question | Cheapest evidence |
   | --- | --- | --- |
   | 1. Name | Does the name resolve to the address you think? | `dig +short`, `nslookup`, `getent hosts` |
   | 2. Route | Is there a path, and does the target agree it is reachable? | `ip route get`, `traceroute`, `ping` (if permitted) |
   | 3. Port | Is something listening, and does the kernel accept the packet? | `ss -ltnp`, `nc -vz`, `Test-NetConnection` |
   | 4. Protocol | Is the socket open but the conversation failing? | `curl -v`, `openssl s_client`, application logs |

   The full command set per operating system, plus the container-specific version of each, is in
   [references/layered-checks.md](references/layered-checks.md).

4. **Test from the failing side, not the working side.** A server that can reach itself proves
   nothing. If the client cannot reach the server, run the check *from the client*.

5. **Compare a known-good peer.** Another client on the same network, another port on the same
   service, the same client to a different host. The comparison tells you which of the three is
   unusual, and that is usually the answer.

6. **Only now form a hypothesis, and state it as a prediction.** "If the bind address is the problem,
   `ss -ltn` will show `127.0.0.1:5432` rather than `0.0.0.0:5432`." A hypothesis that cannot be wrong
   is not a diagnosis.

7. **Fix the layer that failed**, then re-run *the same command* that showed the failure. Not a
   different command, not "it feels better now".

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| Adding retries or a timeout bump | Hides the layer; turns a clean refusal into a slow timeout |
| Adding service discovery | Solves a problem you have not measured; adds a moving part you now must debug too |
| Editing the client's TLS settings | `InsecureSkipVerify` "works" and removes the guarantee that made TLS useful |
| Blaming the firewall immediately | Firewalls are one of six causes; `ss`/`nc` takes ten seconds and rules them in or out |
| Testing from inside the container to itself | Proves the process is alive, not that the network is reachable |
| "It worked yesterday" as a conclusion | It is the most useful clue you have — chase what changed (IP, certificate, config, firewall rule) |

## Definition of done

- [ ] The failing **layer** is named (name, route, port, or protocol) with the command that showed it.
- [ ] The evidence is quoted: the exact command and the relevant output line, not a summary.
- [ ] The fix is at that layer, and the original failing command now succeeds — shown, not asserted.
- [ ] Anything you could not test (another network, a production firewall, a device you do not have)
      is stated explicitly as unverified.
- [ ] If the "fix" changes security posture, it is called out as a trade-off, not as a solution.

## Report format

```
Symptom:   <one sentence, exact error, both endpoints>
Layer:     name | route | port | protocol
Evidence:  <command> → <the line that proves it>
Cause:     <one sentence>
Fix:       <what changed, at which layer>
Verified:  <command that now succeeds; on which machine>
Unverified:<what you could not observe>
```

If two layers are broken at once — common when a machine moved networks — fix them in order and say
so. Do not present the second fix as the cause of the first symptom.
