# syntax=docker/dockerfile:1.7
# ────────────────────────────────────────────────────────────────────────
# Astro + adaptateur Node (standalone) — Dockerfile multi-stage
# Même technique que le site de référence "richard-toitures" (déploiement
# via Coolify, derrière Cloudflare).
# ────────────────────────────────────────────────────────────────────────

# ── Stage 1 : build ─────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci
COPY . .
# Variable de BUILD : clé publique Turnstile, gravée dans le HTML statique.
# Coolify la passe en --build-arg quand elle est cochée « Build Variable ».
ARG PUBLIC_TURNSTILE_SITE_KEY=""
ENV PUBLIC_TURNSTILE_SITE_KEY=$PUBLIC_TURNSTILE_SITE_KEY
RUN npm run build

# ── Stage 2 : runtime ───────────────────────────────────────────────────
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Sans HOST=0.0.0.0 le serveur n'écouterait que sur localhost à l'intérieur
# du conteneur, et le reverse proxy ne pourrait pas l'atteindre.
ENV HOST=0.0.0.0
ENV PORT=4321
COPY package.json package-lock.json ./
# Pas de « npm cache clean » ici : /root/.npm est un cache BuildKit monté
# (partagé avec le stage builder qui tourne en parallèle) — le vider provoque
# un ENOTEMPTY, et il ne fait de toute façon pas partie de l'image finale.
RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN chown -R node:node /app
USER node
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
