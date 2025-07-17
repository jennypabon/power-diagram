# Power Diagram

A tool for creating interactive sequence diagrams with clickable buttons that display detailed information.

## Features

- **Mermaid-like syntax**: Easy to write and understand
- **Interactive buttons**: Click on red buttons to see more information
- **Multiple content types**: URLs, request examples, SQL queries, HTML preview
- **Responsive design**: Works on desktop and mobile
- **Embeddable**: Can be included in README.md or shared as HTML

## Syntax

### Define participants with colors and aliases
```
participant "Full Name" as Alias #3498db
participant "Payment API" as API #e74c3c
participant SimpleParticipant #2ecc71
participant "Database" as DB #f39c12 dashed
```

**Available lifeline styles:**
- `solid` (default): Continuous line
- `dashed`: Dashed/dotted line

### Basic messages
```
Alias->>API: Example message
API-->>Alias: Response (dashed line)
API-->>>Alias: Response (dotted line)
```

### Adding detailed information

Details are added using brackets after each message. Two syntaxes are available:

#### Simple syntax (single line):
```
[key: value]
```

#### Literal block syntax (multiple lines):
```
[key:
```
content with preserved
formatting (line breaks, tabs, etc.)
```
]
```

**Structure**: 
- **key**: Determines the rendering type and section title
- **value/content**: The content to display

#### Available rendering types:

##### 1. **title** - Custom popup title
```
[title: My custom title]
```
*Rendering*: Used as modal title (doesn't appear in content)

##### 2. **button** - Button text
```
[button: Show details]
```
*Rendering*: Defines the text that appears on the button (doesn't appear in popup content)

##### 3. **buttonColor** - Button color
```
[buttonColor: #27ae60]
```
*Rendering*: Defines the button color (hexadecimal format)

##### 4. **url** - URLs and endpoints
```
[url: https://api.example.com/v3/users/123]
```
*Rendering*: Light blue background with monospace code

##### 5. **request** - HTTP requests (JSON)
**Simple syntax:**
```
[request: {"user_id": 123, "action": "create"}]
```

**Block syntax (recommended for JSON):**
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

*Rendering*: Code block with JSON formatting (pretty-print)

##### 6. **response** - HTTP responses (JSON)
```
[response: {"status": "success", "data": {...}}]
```
*Rendering*: Code block with JSON formatting (pretty-print)

##### 7. **sql** - SQL queries
**Simple syntax:**
```
[sql: SELECT * FROM users WHERE id = ?]
```

**Block syntax (recommended for complex SQL):**
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

*Rendering*: Code block with SQL formatting

##### 8. **html** - HTML preview
```
[html: <div style="color: red;">HTML Content</div>]
```
*Rendering*: Iframe with HTML rendering

##### 9. **Any other key** - Simple text
```
[description: This is a simple description]
[notes: Additional notes about the process]
[warning: ⚠️ Important: Check permissions]
```
*Rendering*: Simple text in paragraph

#### Complete example with literal blocks:
```
participant "Web Client" as Client #2ecc71
participant "User API" as API #3498db

Client->>API: Create new user
[title: User Creation]
[button: View details]
[buttonColor: #27ae60]
[url: https://api.example.com/v1/users]
[request:
```
{
    "name": "John Doe",
    "email": "john@example.com",
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
[description: Creates a new user in the system]
[notes: Requires Bearer token authentication]
```

## Complete example

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
API-->>>Vertical: Token response
```

## Usage

1. Open `index.html` in your browser
2. Write your diagram in the text area
3. Click "Generate Diagram"
4. Click on red buttons to see detailed information

## Project structure

- `index.html` - Main page
- `styles.css` - Styles and design
- `diagram-parser.js` - Parser for diagram syntax
- `diagram-renderer.js` - SVG renderer
- `app.js` - Main application

## Customization

You can modify styles in `styles.css` to change colors, sizes, and general appearance of the diagram.

## Sharing

To share a diagram:
1. Generate the diagram
2. Use the "Download diagram (HTML)" button to download
3. Share the HTML file with your team
4. Or embed the HTML in README.md using `<iframe>` or by copying the generated SVG code

## Features

### Interactive Elements
- **Clickable buttons**: Each message can have interactive buttons with custom text and colors
- **Modal popups**: Detailed information displays in elegant modal windows
- **Hover tooltips**: Lifelines show participant names on hover for easy navigation

### Customization Options
- **Participant colors**: Custom hex colors for each participant
- **Button colors**: Individual button color customization
- **Lifeline styles**: Choose between solid and dashed lifelines
- **Aliases**: Use short aliases for long participant names

### Advanced Syntax
- **Three arrow types**: Solid (`->>`), dashed (`-->>`), and dotted (`-->>>`)
- **Multi-line blocks**: Preserve formatting for JSON, SQL, and HTML content
- **Participant positioning**: Top and bottom participant boxes for long diagrams
- **Responsive design**: Works perfectly on desktop and mobile devices

### Export Options
- **HTML download**: Generate standalone HTML files for sharing
- **Mermaid export**: Convert diagrams to standard Mermaid format
- **Copy functionality**: Easy color code copying with integrated color picker

---

**Power Diagram by Jenny Pabón {JPG}**