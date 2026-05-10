# Kanban Sync

**Autor:** Jorge Giovannelli

Plugin para Obsidian que sincroniza automáticamente el estado de las tarjetas Kanban con el frontmatter de las notas vinculadas.

## Descripción

Cuando mueves una tarjeta entre columnas en un tablero Kanban, este plugin actualiza automáticamente el campo de estado en el frontmatter de la nota vinculada.

## Instalación

### Opción 1: BRAT (Recomendado)

1. Instala el plugin [BRAT](https://github.com/TfTHacker/obsidian42-brat) desde la comunidad de plugins
2. En BRAT, usa "Add a beta plugin"
3. Agrega la URL del repositorio o la ruta local al plugin
4. Activa "Kanban Sync" en la lista de plugins de comunidad

### Opción 2: Instalación manual

1. Copia la carpeta `kanban-sync` a `.obsidian/plugins/`
2. Activa "Developer Mode" en Configuración → Comunidad de plugins
3. Habilita "Kanban Sync" en la lista de plugins instalados

## Configuración

### Archivos Kanban

Lista de archivos Kanban a monitorear, separados por coma:

```
Presupuestos Kanban, Clientes Kanban
```

### Campo de estado

Nombre del campo en el frontmatter a actualizar:

```
estado
```

### Delay de sincronización

Milisegundos de espera antes de sincronizar después de un cambio:

```
100
```

Valores menores = más rápido, pero puede causar sincronización excesiva.

## Uso

1. Crea un tablero Kanban usando el plugin [Obsidian Kanban](https://github.com/tgrosinger/obsidian-kanban)
2. Vincula las tarjetas a notas existentes usando `[[nombre-nota]]`
3. Mueve las tarjetas entre columnas
4. El plugin actualiza automáticamente el campo `estado` en el frontmatter de cada nota

## Formato del Kanban

El plugin detecta columnas por el formato:

```
## NOMBRE_COLUMNA

- [ ] [[Nota Vinculada]]
```

El nombre de la columna se usa como valor del estado en mayúsculas.

## Ejemplo

**Archivo Kanban:**
```markdown
## PENDIENTE

- [ ] [[Presupuesto Cliente ABC]]

## APROBADO

- [ ] [[Presupuesto Cliente XYZ]]
```

**Nota vinculada (Presupuesto Cliente ABC.md):**
```yaml
---
estado: PENDIENTE
---
```

Cuando mueves la tarjeta a "APROBADO", el frontmatter se actualiza automáticamente a `estado: APROBADO`.

## Requisitos

- Obsidian v0.15.0+
- Plugin Kanban instalado (recomendado: [Obsidian Kanban](https://github.com/tgrosinger/obsidian-kanban))

## Licencia

MIT
