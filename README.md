# Powered Diagram

Una herramienta para crear diagramas de secuencia interactivos con botones clickeables que muestran información detallada.

## Características

- **Sintaxis similar a Mermaid**: Fácil de escribir y entender
- **Botones interactivos**: Clickea en los botones rojos para ver más información
- **Múltiples tipos de contenido**: URLs, ejemplos de requests, consultas SQL, HTML preview
- **Diseño responsive**: Funciona en desktop y móvil
- **Embebible**: Puede ser incluido en README.md o compartido como HTML

## Sintaxis

### Definir participantes con colores y alias
```
participant "Nombre Completo" as Alias #3498db
participant "Payment API" as API #e74c3c
participant ParticipanteSimple #2ecc71
participant "Database" as DB #f39c12 dashed
```

**Estilos de línea de vida disponibles:**
- `solid` (por defecto): Línea continua
- `dashed`: Línea discontinua/punteada

### Mensajes básicos
```
Alias->>API: Mensaje de ejemplo
API-->>Alias: Respuesta (línea discontinua)
API-->>>Alias: Respuesta (línea punteada)
```

### Añadir información detallada

Los detalles se añaden usando corchetes después de cada mensaje. Hay dos sintaxis disponibles:

#### Sintaxis simple (una línea):
```
[clave: valor]
```

#### Sintaxis de bloque literal (múltiples líneas):
```
[clave:
```
contenido con formato
preservado (saltos de línea, tabulaciones, etc.)
```
]
```

**Estructura**: 
- **clave**: Determina el tipo de renderizado y el título de la sección
- **valor/contenido**: El contenido a mostrar

#### Tipos de renderizado disponibles:

##### 1. **title** - Título personalizado del popup
```
[title: Mi título personalizado]
```
*Renderizado*: Se usa como título del modal (no aparece en el contenido)

##### 2. **button** - Texto del botón
```
[button: Mostrar detalles]
```
*Renderizado*: Define el texto que aparece en el botón (no aparece en el contenido del popup)

##### 3. **buttonColor** - Color del botón
```
[buttonColor: #27ae60]
```
*Renderizado*: Define el color del botón (formato hexadecimal)

##### 4. **url** - URLs y endpoints
```
[url: https://api.example.com/v3/users/123]
```
*Renderizado*: Fondo azul claro con código monospace

##### 5. **request** - Peticiones HTTP (JSON)
**Sintaxis simple:**
```
[request: {"user_id": 123, "action": "create"}]
```

**Sintaxis de bloque (recomendada para JSON):**
```
[request:
```
{
    "user_id": 123,
    "action": "create",
    "data": {
        "name": "John Doe"
    }
}
```
]
```

*Renderizado*: Bloque de código con formato JSON (pretty-print)

##### 6. **response** - Respuestas HTTP (JSON)
```
[response: {"status": "success", "data": {...}}]
```
*Renderizado*: Bloque de código con formato JSON (pretty-print)

##### 7. **sql** - Consultas SQL
**Sintaxis simple:**
```
[sql: SELECT * FROM users WHERE id = ?]
```

**Sintaxis de bloque (recomendada para SQL complejas):**
```
[sql:
```
SELECT u.id, u.name, p.title
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE u.status = 'active'
    AND u.created_at > ?
ORDER BY u.name
```
]
```

*Renderizado*: Bloque de código con formato SQL

##### 8. **html** - Vista previa HTML
```
[html: <div style="color: red;">Contenido HTML</div>]
```
*Renderizado*: Iframe con renderizado del HTML

##### 9. **Cualquier otra clave** - Texto simple
```
[description: Esta es una descripción simple]
[notes: Notas adicionales sobre el proceso]
[warning: ⚠️ Importante: Verificar permisos]
```
*Renderizado*: Texto simple en párrafo

#### Ejemplo completo con bloques literales:
```
participant "Cliente Web" as Client #2ecc71
participant "User API" as API #3498db

Client->>API: Crear nuevo usuario
[title: Creación de Usuario]
[button: Ver detalles]
[buttonColor: #27ae60]
[url: https://api.example.com/v1/users]
[request:
```
{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "profile": {
        "age": 30,
        "department": "Engineering"
    }
}
```
]
[response:
```
{
    "id": 123,
    "status": "created",
    "created_at": "2024-01-15T10:30:00Z"
}
```
]
[description: Crea un nuevo usuario en el sistema]
[notes: Requiere autenticación Bearer token]
```

## Ejemplo completo

```
participant Vertical #2ecc71
participant API #3498db
participant Database #e67e22 dashed

Vertical->>API: Tokenize instructions (POST /v3/payors/{payorId}/payment_method_instructions/bank_accounts)
[title: API Request Details]
[button: Show Request Details]
[buttonColor: #27ae60]
[url: https://api.example.com/v3/payors/123/payment_method_instructions/bank_accounts]
[request: {"account_number": "123456789", "routing_number": "021000021"}]

API->>Database: Store tokenized data
[title: Database Operation]
[button: Show Database Operation]
[buttonColor: #2980b9]
[sql: INSERT INTO tokenized_accounts (payor_id, token, created_at) VALUES (?, ?, NOW())]

Database-->>API: Success response
API-->>Vertical: Token response
```

## Uso

1. Abre `index.html` en tu navegador
2. Escribe tu diagrama en el área de texto
3. Haz click en "Generate Diagram"
4. Clickea en los botones rojos para ver información detallada

## Estructura del proyecto

- `index.html` - Página principal
- `styles.css` - Estilos y diseño
- `diagram-parser.js` - Parser para la sintaxis del diagrama
- `diagram-renderer.js` - Renderizador SVG
- `app.js` - Aplicación principal

## Personalización

Puedes modificar los estilos en `styles.css` para cambiar colores, tamaños y apariencia general del diagrama.

## Compartir

Para compartir un diagrama:
1. Genera el diagrama
2. Usa el botón "Download diagram (HTML)" para descargar
3. Comparte el archivo HTML con tu equipo
4. O embebe el HTML en README.md usando `<iframe>` o copiando el código SVG generado

---

**Power Diagram by Jenny Pabón {JPG}**