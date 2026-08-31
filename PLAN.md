# OCM
## Lapiz-cli
Es la librería de clases que voy a usar para crear el cli.

## config

Una config es una entidad en este cli. cada config tiene un name que es el que da nombre a una carpeta en ~/.local/share/ocm

## local-config (podemos cambiar nombre)
Una local config es una configuracíon ya instalada ligada a una ruta en el sistema de archivos. sirve para ligar una configuración a un proyecto específico.

## current-config
Es la configuración que actualmente estamos usando.

## data
los nombres de las configs viven en los nombres de los directorios de ~/.local/share/ocm/ y las local-configs viven en una base de datos sqlite en esa carpeta (quizas un scv o json puede ser mejor).
la current config vive en el symlink al que actualmente apunta ~/.config/opencode

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

TODO. pedirle a la ia que mejore esta idea y añada todas las combinaciones posibles

## update

ocm update <name> <repo|ruta>

si el name no existe entre las configs instaladas el comando falla
aunque el repo|ruta tenga un ocm.json con otro name la carpeta conserva su name
no hay forma de cambiar name en este comando
de todo salir bien el comando reemplaza el contenido de la carpeta.

[LISTA DE TESTS]

## remove

ocm remove <name>

borra una config

[LISTA DE TESTS]

## list

ocm list

otorga un listado de las configs que hay instaladas y la actual aparece con un * y en otro color similar a git branch
[LISTA DE TESTS]

## current

ocm current

muestra el nombre de la configuración actual.
[LISTA DE TESTS]

## use

ocm use <name>

Setea el symlink actual de ~/.config/opencode a el ~/.local/share/ocm/<name>
[LISTA DE TESTS]

## worklink

ocm worklink <name> <output>

crea un symlink en output apuntando a ~/.local/share/ocm/<name> para que puedas trabajar en el sin entrar obligatoriamente en ~/.local/share/ocm. Luego puedes borrar el symlink tranquilamnete
[LISTA DE TESTS]

## create-empty

omc create-empty <name>

crea una carpeta con una plantilla de opencode vacía.
si ya existe una config con ese name falla
[LISTA DE TESTS]

## local-config (podemos buscar otro nombre)

ocm local-config <name> <ruta (opcional)>

guarda en ~/.local/share/ocm/local-configs.sqlite una fila con el nombre y la ruta
Si no se pasa la ruta se usa "." (process.cwd())
Si se pasa una ruta se usa esa.
[LISTA DE TESTS]

## open

ocm open

busca en ~/.local/share/ocm/local-configs.sqlite si esta ruta está guardada
si hay una configuración local guardada usa una variable de entorno para apuntar a dicha configuración y abre opencode
si no hay simplemente ejecuta opencode (que usara la configuración que actualmente esta el symlink)
Es solo para poder abrir opencode con configuraciónes locales guardadas sin wrapear el comando de opencode.


# para pensar

quiero considerar la eliminación de las local-configs y ver si es realmente importante o solo hacemos ocm use x && opencode y ya. quizas es lo mas sano.
De lo contrario hay que pensar en los comandos: "change-local-config" "remove-local-config" "list-local-configs".

Tambien hay que pensar en la posibilidad de un comando de desconfiguracicón tipo:

ocm set-as-a-normal-config <name>

que copie ~/.local/share/ocm/<name> a ~/.config/opencode y no use un symlink (ocm current debería decir que no hay una config seteada)

podría servir si se va a desinstalar ocm y se quiere dejar alguna configuración antes de hacerlo.

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

intenta publicar la release con gh y actualiza el install.sh
