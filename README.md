# Dance Dance Evolution

<!-- [![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](http://www.dancedanceevolution.com) -->
[![Live Demo](http://i.imgur.com/84jKsei.png)](http://www.dancedanceevolution.com)
[![Uses JS](http://i.imgur.com/iCHwult.png)](http://www.dancedanceevolution.com)
[![Built with Love](http://i.imgur.com/cB5v58b.png)](http://www.dancedanceevolution.com)

## Description
Dance Dance Evolution is a version of StepMania that lives entirely in the browser. DDE looks to pay our respects to one of our childhood favorite games while also looking to turn the page onto a new era of music-themed games.

## Features
- Upload music and SM files
- Gamepad support
- Two player mode
- Custom keybinding
- Arrow speed modifiers

## Coming Soon
- Automatic course generation based on any song
- Dynamic animations to song data

## How To Play
- Use arrow keys for navigation, Enter to select, Escape to exit
- When playing, press the correct arrow keys to the tune to rack up points!

## Tech Stack
This is a React/TypeScript + Vite client and an Express/TypeScript server backed
by MongoDB (audio via Tone.js / Web Audio). Static game assets (audio, images,
videos, StepMania charts) live under `browser/{audio,img,video,sm}` and are
served by the Express server.

## Running Locally
Prerequisites: **Node 20** and a running **MongoDB**.

```bash
npm install
cp .env.example .env          # set MONGODB_URI / PORT if needed
npm run dev                   # client on :5173 (proxies /api,/audio,... to :3000), server on :3000
npm run seed                  # load the bundled songs into Mongo (one-time)
```

Open http://localhost:5173.

## Production (Docker)
`docker-compose.prod.yml` runs the whole stack on one host:
**Caddy** (public entrypoint, ports 80/443, automatic HTTPS) → **app** (loopback
`127.0.0.1:3000`) → **MongoDB** (internal only).

```bash
docker compose -f docker-compose.prod.yml up -d --build
# once the app is up, seed the song DB:
docker compose -f docker-compose.prod.yml exec -T app node server/dist/seed.js
```

The proxied domain is set in `deploy/Caddyfile` (default `dde.seanj.xyz`); change
the hostname there to use your own.

## Deploying on Oracle Cloud (OCI Always Free)

**Before you start (these live *outside* the VM):**
1. **DNS** — create an `A` record for your domain → the instance's public IP.
   Caddy can't get a TLS cert until this resolves publicly.
2. **OCI ingress** — in the VCN **Security List** (and any **NSG** on the VNIC),
   add ingress rules allowing TCP **80** and **443** from `0.0.0.0/0`. Leave
   **Source Port Range = All**; only set the *Destination* port (see gotchas).

**On the instance** (Oracle Linux shown; `opc` user). For a hands-off setup you
can instead paste `deploy/oci-cloud-init.yaml` into the instance's *Cloud-init
script* field at creation, which runs all of this automatically.

```bash
# Docker engine + compose plugin + git (--allowerasing clears OL's podman/runc conflict)
sudo dnf install -y git dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y --allowerasing docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker

# Open 80 + 443 in the OS firewall (OCI images block them by default)
sudo firewall-cmd --permanent --add-port=80/tcp --add-port=443/tcp --add-port=443/udp
sudo firewall-cmd --reload

# Clone + run
sudo git clone --branch feature/update-dde-app https://github.com/Kmacpher/dance-dance-evolution.git /opt/dde
cd /opt/dde
sudo docker compose -f docker-compose.prod.yml up -d --build

# Seed once the app answers
until curl -fsS http://localhost:3000/ >/dev/null 2>&1; do sleep 3; done
sudo docker compose -f docker-compose.prod.yml exec -T app node server/dist/seed.js
```

**Deploying updates later:**
```bash
cd /opt/dde && sudo git pull && sudo docker compose -f docker-compose.prod.yml up -d --build
```

### Deployment Gotchas
Hard-won lessons from the first OCI deploy:

- **`exports is not defined in ES module scope`** — the server compiles to
  CommonJS but the root `package.json` is `"type": "module"`. The `build:server`
  script writes `server/dist/package.json` = `{"type":"commonjs"}` to fix it.
  **Don't remove that** or production `node server/dist/main.js` crashes. (Dev is
  unaffected because `tsx` handles it.)
- **OCI ingress source port** — Security List/NSG rules must use **Source Port
  Range = All** with the **Destination** port set to 80/443. Setting the *source*
  port to 80/443 silently blocks all real traffic (clients connect from random
  ephemeral ports) → ACME fails with `Timeout during connect (likely firewall
  problem)`.
- **Two firewalls** — opening the OS firewall (`firewall-cmd`) is **not** enough;
  the OCI **Security List/NSG** is a separate layer above the VM and must also
  allow 80/443. Both must be open.
- **Cloudflare proxy breaks ACME** — if your DNS record is proxied (orange
  cloud), Let's Encrypt's HTTP challenge hits Cloudflare, not Caddy (you'll see a
  `522`). Set the record to **DNS only (grey cloud)** so Caddy can issue the
  cert, or keep the proxy and use Cloudflare SSL **Full (strict)** + an origin
  cert / DNS-01 challenge.
- **Health-check the app, not `/`** — Caddy owns port 80 and only answers for the
  configured domain, so `curl http://localhost/` returns 404 on the box. Check
  the app directly on `http://localhost:3000/`.
- **cloud-init must be pure ASCII** — a stray non-ASCII character (e.g. an
  em-dash) in the pasted Cloud-init script makes the OCI console reject instance
  creation with `CannotParseRequest`.
- **Staging cert fallback** — after repeated ACME failures Caddy falls back to
  Let's Encrypt **staging** (untrusted certs) to avoid rate limits. Once
  connectivity is fixed, `docker compose -f docker-compose.prod.yml restart caddy`
  to retry production cleanly.

## Developers
[![Sean Johnston](https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAbRAAAAJGIwOTc3ZTcwLTA2ZDAtNGYwNy04NTdjLTk3ZTYwYzEzYzAwYQ.jpg)](https://www.linkedin.com/in/sbjohnston)
[![Jay Lee](https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAVuAAAAJGFiNGM5NTZiLWZlYjQtNDJjYi04ODQyLTQyZTlkYWM5NDhlOA.jpg)](https://www.linkedin.com/in/jl975)
[![Kim-Hung Leung](https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAUdAAAAJDAzMjM5YmRkLTNmNDItNDJlMi05MTZiLTRhN2RhNDQ2OTRkNA.jpg)](https://www.linkedin.com/in/kimhungleung)
[![Karen MacPherson](http://i.imgur.com/GP3nJue.jpg)](https://www.linkedin.com/pub/karen-macpherson/48/641/307)
[![Jimin Sung](http://i.imgur.com/CLfld70.jpg)](https://www.linkedin.com/in/jiminsung)

## Screenshots
![Start Splash Page](http://imgur.com/gVtd3pS.png)
![Main Menu](http://imgur.com/5dhHCcU.png)
![Choose Song Difficulty](http://imgur.com/N6tPsFU.png)
![2 Player Mode Play](http://i.imgur.com/wz3zao3.png)