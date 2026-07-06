# Prebuilt-static image for self-hosting (e.g. Coolify). dist/ must exist
# BEFORE building:
#   cd inhumument-editor && npm run data && npm run build
# (data/pages_normalized is not in git, so this cannot be built in CI.)
#
# Build + push (context = inhumument-editor/):
#   docker build -f deploy/coolify/Dockerfile -t ghcr.io/yz3440/inhumument-site:latest .
#   docker push ghcr.io/yz3440/inhumument-site:latest
#
# Coolify: New Resource -> Docker Image -> ghcr.io/yz3440/inhumument-site:latest,
# exposed port 80, attach a domain. Redeploy = rebuild+push, then Redeploy in Coolify.
FROM caddy:2-alpine
COPY deploy/coolify/Caddyfile /etc/caddy/Caddyfile
COPY dist/ /srv/
