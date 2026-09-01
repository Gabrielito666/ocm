#!/bin/bash
set -e

REPO_URL="https://github.com/Gabrielito666/ocm"

# Función de logging
log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }
error() { echo "[ERROR] $1" >&2; exit 1; }

# ============================================
# PASO 0: VALIDACIONES PREVIAS
# ============================================
log "Verificando herramientas necesarias..."

# Verificar gh instalado
if ! command -v gh &> /dev/null; then
    error "gh (GitHub CLI) no está instalado"
fi

# Verificar gh autenticado
if ! gh auth status &> /dev/null; then
    error "gh no está autenticado. Ejecuta: gh auth login"
fi

log "✓ gh instalado y autenticado"

# ============================================
# PASO 1: VALIDACIONES DE GIT
# ============================================
log "Verificando estado del repositorio..."

# Verificar branch actual
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    error "Debes estar en la branch 'main' (estás en '$CURRENT_BRANCH')"
fi

# Verificar working tree limpio
if [ -n "$(git status --porcelain)" ]; then
    error "Working tree no está limpio. Haz commit o stash de los cambios"
fi

# Verificar que commit actual tiene tag
if ! git describe --tags --exact-match &> /dev/null; then
    error "El commit actual no tiene un tag. Crea un tag con: git tag v<version>"
fi

log "✓ Git validado"

# ============================================
# PASO 2: EXTRACCIÓN Y VALIDACIÓN DE VERSIONES
# ============================================
log "Extrayendo versiones..."

# Extraer versión de package.json
PKG_VERSION=$(node -p "require('./package.json').version")
log "  package.json: $PKG_VERSION"

# Extraer versión de debian/changelog
CHANGELOG_VERSION=$(head -n 1 debian/changelog | grep -oP '\(\K[^)]+')
log "  debian/changelog: $CHANGELOG_VERSION"

# Extraer versión del tag
TAG_VERSION=$(git describe --tags --exact-match | sed 's/^v//')
log "  git tag: $TAG_VERSION"

# Validar que coinciden
if [ "$PKG_VERSION" != "$CHANGELOG_VERSION" ] || [ "$PKG_VERSION" != "$TAG_VERSION" ]; then
    error "Las versiones no coinciden:
  package.json: $PKG_VERSION
  debian/changelog: $CHANGELOG_VERSION
  git tag: $TAG_VERSION"
fi

VERSION=$PKG_VERSION
log "✓ Versiones validadas: v$VERSION"

# ============================================
# PASO 3: BUILD Y TEST
# ============================================
log "Construyendo paquete Debian..."
make build-debian

log "Ejecutando tests..."
make test

log "Regenerando paquete Debian (tests hacen clean)..."
make build-debian

log "✓ Build y tests exitosos"

# ============================================
# PASO 4: RELEASE EN GITHUB
# ============================================
log "Creando release en GitHub..."

# Verificar que el .deb existe
DEB_FILE="./dist/ocm_${VERSION}_all.deb"
if [ ! -f "$DEB_FILE" ]; then
    error "No se encontró el archivo: $DEB_FILE"
fi

# Crear release
gh release create "v$VERSION" "$DEB_FILE" \
    --repo "Gabrielito666/ocm" \
    --title "v$VERSION" \
    --notes-from-tag

log "✓ Release v$VERSION creada"

# ============================================
# PASO 5: ACTUALIZAR install.sh
# ============================================
log "Actualizando install.sh..."

# Reemplazar versión
sed -i "s/OCM_VERSION=\".*\"/OCM_VERSION=\"$VERSION\"/" install.sh

# Reemplazar URL
sed -i "s|OCM_DEB_URL=\".*\"|OCM_DEB_URL=\"$REPO_URL/releases/download/v$VERSION/ocm_${VERSION}_all.deb\"|" install.sh

log "✓ install.sh actualizado"

# ============================================
# PASO 6: COMMIT Y PUSH
# ============================================
log "Haciendo commit de install.sh..."

git add install.sh
git commit -m "chore: update install.sh to v$VERSION"
git push

log "✓ Commit y push completados"

# ============================================
# RESUMEN FINAL
# ============================================
log "=========================================="
log "✓ Publicación completada exitosamente"
log "=========================================="
log "Versión publicada: v$VERSION"
log "Release: $REPO_URL/releases/tag/v$VERSION"
log "install.sh actualizado y pusheado"
