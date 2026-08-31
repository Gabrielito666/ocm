# OCM
## Lapiz-cli
Es la librería de clases que voy a usar para crear el cli.

## config

Una config es una entidad en este cli. cada config tiene un name que es el que da nombre a una carpeta en ~/.local/share/ocm

## current-config
Es la configuración que actualmente estamos usando.

## data
los nombres de las configs viven en los nombres de los directorios de ~/.local/share/ocm/
la current config vive en el symlink al que actualmente apunta ~/.config/opencode

## Implementación

### Variables de entorno
- OCM_CONFIGS_DIR: directorio donde se almacenan las configs (default: ~/.local/share/ocm)
- OPENCODE_CONFIG_DIR: directorio de configuración de opencode (default: ~/.config/opencode)

### Wrapper bash
El bin es un wrapper bash que:
1. Verifica que node esté instalado (falla si no)
2. Respeta las variables de entorno si ya están definidas (crítico para tests)
3. Ejecuta el bundle con `exec node`

```bash
#!/bin/bash
set -e

if ! command -v node &> /dev/null; then
    echo "Error: node is required" >&2
    exit 1
fi

export OCM_CONFIGS_DIR="${OCM_CONFIGS_DIR:-$HOME/.local/share/ocm}"
export OPENCODE_CONFIG_DIR="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"

exec node /opt/ocm/bundle.js "$@"
```

### Bundle
- Se genera con esbuild como bundle autocontenido
- Se instala en /opt/ocm/bundle.js
- No depende de node_modules en producción

### Estrategia de testing
- **E2E**: ejecutan el bin real con child-process (lo más realista posible)
- **Cleanup**: se ejecuta en after/finally para garantizar limpieza incluso si el test falla
- **Contenedor**: un solo contenedor Docker ejecuta todos los tests
- **Aislamiento**: el wrapper respeta variables de entorno, permitiendo tests aislados si es necesario

## Test

### install

ocm install <repo|ruta> [opcional --name o -n]
Por defecto se añade el nombre de el repo o carpeta. si dentro de el repo o carpeta hay un archivo ocm.json con un campo name el por defecto pasa a ser ese name, si se pasa un argumento --name o -n el name forsozamente es el que pide el usuario del cli.
Si el name resuelto ya existe el comando falla

1. ocm install https://github.com/ (TODO: un repo ligero y conocido para testear)
    - debe instalar el repo en ~/.local/share/ocm/nombre-del-repo
2. ocm install https://github.com/ (El mismo pero a un commit o tag especiífico)
    - debe instalar el repo con su commit específico en ~/.local/share/ocm/nombre-del-repo
3. ocm install ./fixtures/proof-config
    - debe copiar y pegar la carpéta a ~/.local/share/ocm/proof-config
4. ocm install ./fixtures/proof-config -n "mi-configuracion"
    - debe copiar hacia una carpeta ~/.local/share/ocm/mi-configuracion
5. ocm install https://github.com/ (el repo) -n "mi-configuracion"
    - debe clonar el repo a ~/.local/share/ocm/mi-configuracion
6. ocm install ./fixtures/proof-config -n "mi-configuracion" cuando esta carpeta ya existe
    - Debe no modificar nada y responder con un error
7. ocm install https://github.com (el repo) cuando ya existe una carpeta con ese nombre
    - Debe no modificar nada y responder con un error
8. ocm install ./fixtures/proof-name-config (que dentro tiene un archivo ocm.json con un nombre "with-name")
    - Debe instalar en ~/.local/share/ocm/with-name
9. ocm install ./fixtures/proof-name-config (el mismo anterior) -n "mi-configuracion"
    - Debe instalar en ~/.local/share/ocm/mi-configuracion
10. ocm install https://github.com/ (repo con ocm.json que tiene name "with-name")
    - Debe instalar en ~/.local/share/ocm/with-name (precedencia: ocm.json > nombre del repo)
11. ocm install https://github.com/ (repo con ocm.json que tiene name "with-name") -n "mi-configuracion"
    - Debe instalar en ~/.local/share/ocm/mi-configuracion (precedencia: -n > ocm.json)
12. ocm install https://github.com/ (a commit/tag específico) -n "mi-configuracion"
    - Debe instalar el repo con su commit específico en ~/.local/share/ocm/mi-configuracion
13. ocm install https://github.com/ (a commit/tag específico) cuando ya existe una carpeta con ese nombre
    - Debe no modificar nada y responder con un error

## update

ocm update <name> <repo|ruta>

si el name no existe entre las configs instaladas el comando falla
aunque el repo|ruta tenga un ocm.json con otro name la carpeta conserva su name
no hay forma de cambiar name en este comando
de todo salir bien el comando reemplaza el contenido de la carpeta.

1. ocm update <name> ./fixtures/new-content
    - reemplaza contenido de la carpeta
2. ocm update <name> https://github.com/...
    - reemplaza contenido clonando el repo
3. ocm update <name> https://github.com/...@v1.2.3
    - reemplaza con commit/tag específico
4. ocm update <name-inexistente> ./fixtures/...
    - error
5. ocm update <name> ./fixtures/... donde el fixture tiene ocm.json con otro name
    - la carpeta conserva su name original
6. ocm update <name> ./ruta-que-no-existe
    - error, no modifica nada
7. ocm update <name> https://github.com/repo-404
    - error, no modifica nada
8. ocm update <name-actual> ./fixtures/... (la config activa es la que se actualiza)
    - el symlink sigue apuntando correctamente

## rename

ocm rename <current-name> <new-name>

falla si el current no existe o si new ya existe.

1. ocm rename <current> <new> con current existente y new no existente
    - renombra la carpeta de ~/.local/share/ocm/<current> a ~/.local/share/ocm/<new>
2. ocm rename <current-inexistente> <new>
    - error
3. ocm rename <current> <new-existente>
    - error, no modifica nada
4. ocm rename <current-actual> <new> (es la config activa, symlink apunta a ella)
    - renombra la carpeta Y el symlink sigue apuntando correctamente a la nueva ruta
5. después de rename, ocm list muestra el nuevo nombre

## remove

ocm remove <name>

borra una config

1. ocm remove <name> con config existente
    - la borra
2. ocm remove <name-inexistente>
    - error
3. ocm remove <name-actual> (symlink apunta a ella)
    - error, pide hacer use de otra config antes
4. después de remove, verificar que no aparece en ocm list

## list

ocm list

otorga un listado de las configs que hay instaladas y la actual aparece con un * y en otro color similar a git branch

1. ocm list sin configs instaladas
    - mensaje vacío o "no hay configs"
2. ocm list con una config, sin actual
    - muestra la config sin *
3. ocm list con múltiples configs, ninguna actual
    - todas sin *
4. ocm list con múltiples configs, una actual
    - esa tiene * y color distinto
5. ocm list después de ocm use <name>
    - la usada tiene *

## current

ocm current

muestra el nombre de la configuración actual.

1. ocm current cuando hay symlink
    - muestra nombre de la config
2. ocm current cuando no hay symlink (o symlink roto)
    - mensaje "no hay config activa"
3. ocm current después de ocm use <name>
    - muestra la nueva

## use

ocm use <name>

Setea el symlink actual de ~/.config/opencode a el ~/.local/share/ocm/<name>

1. ocm use <name> con name existente
    - crea symlink ~/.config/opencode → ~/.local/share/ocm/<name>
2. ocm use <name-inexistente>
    - error
3. ocm use <name> cuando ya hay un symlink previo
    - lo reemplaza
4. ocm use <name> cuando ~/.config/opencode es un directorio real (no symlink)
    - crea backup en ~/.local/share/ocm/backup-[fecha y hora]
    - luego crea el symlink

## worklink

ocm worklink <name> <output>

crea un symlink en output apuntando a ~/.local/share/ocm/<name> para que puedas trabajar en el sin entrar obligatoriamente en ~/.local/share/ocm. Luego puedes borrar el symlink tranquilamnete

1. ocm worklink <name> ./mi-link con name existente
    - crea symlink
2. ocm worklink <name-inexistente> ./mi-link
    - error
3. ocm worklink <name> ./ruta-que-ya-existe (directorio)
    - error
4. ocm worklink <name> ./ruta-que-ya-existe (symlink previo)
    - error
5. ocm worklink <name> /ruta/padre-inexistente/link
    - error
6. borrar el symlink creado no afecta la config original

## create-empty

omc create-empty <name>

crea una carpeta con una plantilla de opencode vacía.
si ya existe una config con ese name falla

1. ocm create-empty <name> con name nuevo
    - crea carpeta con plantilla
2. ocm create-empty <name> con name existente
    - error
3. verificar que la carpeta creada tiene la estructura de plantilla correcta
4. después de create-empty, la config aparece en ocm list

# estructura

+ .
+ /src
|   + /commands
|   |   + /<command-name>.js
|   + /cli (entry-point)
+ /debian
|    <rellenar con los archivos de debian>
+ /test
|   + /e2e
|   + /integration
|   + /unit
+ /bin/ocm (debian entry point)
+ /completions/ocm
+ install.sh
+ Dockerfile.test
+ Makefile
+ package.json
+ README.md
+ LISENCE

# dev-scripts

## get-default-config

monta un contenedor docker con un volume, instala opencode y luego deja ~/.config/opencode en el volume, dejando esta configuración incial en /fixtures/default-config

## test

monta un contenedor docker y ejecuta todos los test

## build-debian

construye el paquete debian y lo deja en dist.

## publish

Flujo de publicación (mini CI/CD con make):

**Pre-requisitos (desarrollador):**
1. Actualizar versión en `package.json`
2. Actualizar versión en `debian/changelog`
3. Crear tag: `git tag v${version}`

**Validaciones del script:**
- Branch actual debe ser `main`
- Working tree debe estar limpio
- Commit actual debe tener tag que coincida con versión
- Versión debe coincidir en: `package.json` == `debian/changelog` == tag (sin 'v')

**Flujo:**
1. `make build-debian` (incluye bundle + genera .deb)
2. `make test` (contenedor Docker)
3. `gh release create v${version} ./dist/*.deb --notes-from-tag` (mensaje desde changelog)
4. Actualizar `install.sh` con nueva versión/URL
5. Commit y push de `install.sh`

**Si falla:**
- Test: desarrollador decide (sin rollback automático)
- gh release: desarrollador decide (sin rollback automático)
- Commit de install.sh es posterior al release (tag ya existe)
