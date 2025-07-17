class PoweredDiagram {
    constructor() {
        this.parser = new DiagramParser();
        this.renderer = new DiagramRenderer(document.getElementById('diagram'));
        this.init();
    }

    init() {
        // Set up event listeners
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateDiagram();
        });

        // Dropdown functionality
        const exportBtn = document.getElementById('exportBtn');
        const dropdown = document.querySelector('.dropdown');
        
        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Export button handlers
        document.getElementById('shareBtn').addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.remove('show');
            this.generateShareableHTML();
        });

        document.getElementById('mermaidBtn').addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.remove('show');
            this.showMermaidExport();
        });

        document.getElementById('downloadSourceBtn').addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.remove('show');
            this.downloadSource();
        });

        // Modal close functionality
        const modal = document.getElementById('infoModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Mermaid modal close functionality
        const mermaidModal = document.getElementById('mermaidModal');
        const mermaidModalClose = document.getElementById('mermaidModalClose');
        
        mermaidModalClose.addEventListener('click', () => {
            mermaidModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === mermaidModal) {
                mermaidModal.style.display = 'none';
            }
        });

        // Mermaid copy functionality
        document.getElementById('copyMermaidBtn').addEventListener('click', () => {
            this.copyMermaidToClipboard();
        });

        // Color picker functionality
        this.setupColorPicker();
        
        // Setup collapsible color picker
        this.setupCollapsibleColorPicker();

        // Load example diagram
        this.loadExampleDiagram();
    }

    setupColorPicker() {
        const colorPicker = document.getElementById('colorPicker');
        const hexValue = document.getElementById('hexValue');
        const copyHexBtn = document.getElementById('copyHexBtn');
        const presetColors = document.querySelectorAll('.preset-color');

        // Update hex value when color picker changes
        colorPicker.addEventListener('input', (e) => {
            hexValue.value = e.target.value.toUpperCase();
        });

        // Copy hex value to clipboard
        copyHexBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(hexValue.value);
                this.showCopyFeedback(copyHexBtn);
            } catch (err) {
                // Fallback for browsers that don't support clipboard API
                this.fallbackCopyToClipboard(hexValue.value);
                this.showCopyFeedback(copyHexBtn);
            }
        });

        // Preset color functionality
        presetColors.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                colorPicker.value = color;
                hexValue.value = color.toUpperCase();
                this.showCopyFeedback(preset, 'Selected!');
            });
        });
    }

    showCopyFeedback(element, message = 'Copied!') {
        const originalText = element.textContent || element.title;
        const originalTitle = element.title;
        
        if (element.textContent !== undefined) {
            element.textContent = message;
        } else {
            element.title = message;
        }
        
        element.style.background = '#d4edda';
        element.style.color = '#155724';
        element.style.borderColor = '#c3e6cb';
        
        setTimeout(() => {
            if (element.textContent !== undefined) {
                element.textContent = originalText;
            } else {
                element.title = originalTitle;
            }
            element.style.background = '';
            element.style.color = '';
            element.style.borderColor = '';
        }, 1000);
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
    }

    setupCollapsibleColorPicker() {
        const header = document.getElementById('colorPickerHeader');
        const content = document.getElementById('colorPickerContent');
        const icon = document.getElementById('collapseIcon');
        
        // Start collapsed by default
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
        
        // Toggle functionality
        header.addEventListener('click', () => {
            content.classList.toggle('collapsed');
            icon.classList.toggle('collapsed');
        });
    }

    generateDiagram() {
        const input = document.getElementById('diagramInput').value;
        if (!input.trim()) {
            alert('Please enter a diagram definition');
            return;
        }

        try {
            const diagram = this.parser.parse(input);
            this.renderer.render(diagram);
        } catch (error) {
            alert('Error parsing diagram: ' + error.message);
            console.error('Parsing error:', error);
        }
    }

    loadExampleDiagram() {
        const exampleDiagram = `participant "Vertical Application" as V #2ecc71
participant "Payment API" as API #3498db
participant "User Database" as DB #e67e22 dashed

V->>API: Tokenize instructions (POST /v3/payors/{payorId}/payment_method_instructions/bank_accounts)
[title: API Request Details]
[button: Show Request Details]
[buttonColor: #27ae60]
[url: https://api.example.com/v3/payors/123/payment_method_instructions/bank_accounts?include_metadata=true&format=json&validate_account=true&encryption_level=high]
[request:
\`\`\`
{
    "account_number": "123456789",
    "routing_number": "021000021",
    "account_type": "checking",
    "bank_name": "Example Bank",
    "account_holder_name": "John Doe",
    "validation_method": "instant"
}
\`\`\`
]
[response:
\`\`\`
{
    "token": "tok_abc123",
    "status": "success",
    "expires_at": "2024-12-31T23:59:59Z",
    "validation_result": "passed",
    "account_verified": true
}
\`\`\`
]

API->>DB: Store tokenized data
[title: Database Operation]
[button: Show Database Operation]
[buttonColor: #2980b9]
[sql:
\`\`\`
INSERT INTO tokenized_accounts (
    payor_id, 
    token, 
    account_hash, 
    created_at, 
    validation_status, 
    encryption_key_id
) VALUES (?, ?, ?, NOW(), ?, ?)
\`\`\`
]
[description: Securely stores the tokenized account information with encrypted account details and validation status for future reference]

DB-->>API: Success response
[title: Database Response]
[button: Show Response Format]
[buttonColor: #d35400]
[response:
\`\`\`
{
    "id": 12345,
    "status": "stored",
    "timestamp": "2024-01-15T10:30:00Z",
    "encryption_applied": true,
    "backup_created": true
}
\`\`\`
]

API-->>>V: Token response
[title: Final Payment Token]
[button: Show Final Response]
[buttonColor: #8e44ad]
[response:
\`\`\`
{
    "payment_method_token": "tok_abc123",
    "status": "active",
    "metadata": {
        "account_type": "checking",
        "bank_name": "Example Bank",
        "last_validated": "2024-01-15T10:30:00Z",
        "validation_score": 95
    }
}
\`\`\`
]
[html: <div style="padding: 20px; background: #f0f8ff; border-radius: 8px;"><h3>Payment Method Created</h3><p>Token: <strong>tok_abc123</strong></p><p>Status: <span style="color: green;">Active</span></p></div>]`;

        document.getElementById('diagramInput').value = exampleDiagram;
        this.generateDiagram();
    }

    generateShareableHTML() {
        const diagramSVG = document.getElementById('diagram');
        
        if (!diagramSVG || !diagramSVG.innerHTML.trim()) {
            alert('Please generate a diagram first!');
            return;
        }

        // Clone the SVG to avoid modifying the original
        const clonedSVG = diagramSVG.cloneNode(true);
        
        // Get the current diagram input for the title
        const diagramInput = document.getElementById('diagramInput').value;
        const firstLine = diagramInput.split('\n')[0] || 'Powered Diagram';
        
        // Parse the diagram to get the data for interactivity
        const diagram = this.parser.parse(diagramInput);
        
        const shareableHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Power Diagram - ${this.escapeHtml(firstLine)}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .diagram-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            max-width: 90vw;
            overflow-x: auto;
        }
        
        .diagram-title {
            text-align: center;
            margin-bottom: 20px;
            color: #2c3e50;
            font-size: 1.5em;
            font-weight: 600;
        }
        
        .diagram-footer {
            text-align: center;
            margin-top: 20px;
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .diagram-footer a {
            color: #3498db;
            text-decoration: none;
        }
        
        .diagram-footer a:hover {
            text-decoration: underline;
        }
        
        /* SVG Styles */
        .participant {
            fill: #3498db;
            stroke: #2980b9;
            stroke-width: 2;
        }
        
        .participant-text {
            fill: white;
            font-size: 14px;
            font-weight: bold;
            text-anchor: middle;
            dominant-baseline: middle;
        }
        
        .participant-line {
            stroke: #bdc3c7;
            stroke-width: 2;
        }
        
        .participant-line.dashed {
            stroke-dasharray: 5, 5;
        }
        
        .participant-line:hover {
            stroke: #7f8c8d;
            stroke-width: 3;
        }
        
        /* Tooltip styles */
        .lifeline-tooltip {
            position: fixed;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .lifeline-tooltip.show {
            opacity: 1;
        }
        
        .message-line {
            stroke: #2c3e50;
            stroke-width: 2;
            marker-end: url(#arrowhead);
        }
        
        .message-line.dashed {
            stroke-dasharray: 5, 5;
        }
        
        .message-line.dotted {
            stroke-dasharray: 2, 3;
        }
        
        .message-text {
            fill: #2c3e50;
            font-size: 12px;
            font-weight: 500;
        }
        
        .message-button {
            fill: #e74c3c;
            stroke: #c0392b;
            stroke-width: 1;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .message-button:hover {
            fill: #c0392b;
        }
        
        .message-button-text {
            fill: white;
            font-size: 9px;
            font-weight: bold;
            text-anchor: middle;
            dominant-baseline: middle;
            cursor: pointer;
        }
        
        /* Modal styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }
        
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            line-height: 1;
        }
        
        .close:hover {
            color: #000;
        }
        
        .modal-title {
            margin-bottom: 15px;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        
        .modal-body {
            line-height: 1.6;
        }
        
        .modal-body pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 10px 0;
        }
        
        .modal-body code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        
        .modal-body .url-preview {
            background: #e8f4f8;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
            margin: 10px 0;
        }
        
        .modal-body .url-preview code {
            display: block;
            word-wrap: break-word;
            white-space: pre-wrap;
        }
        
        .modal-body .html-preview {
            border: 1px solid #ddd;
            border-radius: 5px;
            margin: 10px 0;
        }
        
        .modal-body .html-preview iframe {
            width: 100%;
            height: 300px;
            border: none;
            border-radius: 5px;
        }
        
        .modal-body h4 {
            margin-top: 20px;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        
        .modal-body p {
            word-wrap: break-word;
            max-width: 100%;
        }
        
        .modal-body pre {
            max-width: 100%;
            overflow-x: auto;
        }
        
        @media (max-width: 768px) {
            .modal-content {
                width: 95%;
                margin: 10% auto;
            }
        }
    </style>
</head>
<body>
    <div class="diagram-container">
        <h1 class="diagram-title">Powered Diagram</h1>
        ${clonedSVG.outerHTML}
        <div id="lifelineTooltip" class="lifeline-tooltip"></div>
        <div class="diagram-footer">
            Power Diagram by Jenny Pabón {JPG}
        </div>
    </div>
    
    <!-- Modal for displaying detailed information -->
    <div id="infoModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3 id="modalTitle" class="modal-title"></h3>
            <div id="modalBody" class="modal-body"></div>
        </div>
    </div>
    
    <script>
        ${this.getShareableJavaScript(diagram)}
    </script>
</body>
</html>`;

        this.downloadHTML(shareableHTML, 'power-diagram.html', diagram);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getShareableJavaScript(diagram) {
        return `
        // Diagram data
        const diagramData = ${JSON.stringify(diagram)};
        
        // Modal functionality
        const modal = document.getElementById('infoModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Utility functions
        function formatDetailKey(key) {
            return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        }
        
        function formatCode(code) {
            try {
                const parsed = JSON.parse(code);
                return JSON.stringify(parsed, null, 2);
            } catch (e) {
                return code;
            }
        }
        
        function escapeHtml(html) {
            return html.replace(/"/g, '&quot;');
        }
        
        function formatMessageDetails(details) {
            let html = '';
            
            for (const [key, value] of Object.entries(details)) {
                if (key === 'title' || key === 'button' || key === 'buttonColor') continue;
                
                html += '<h4>' + formatDetailKey(key) + '</h4>';
                
                switch (key) {
                    case 'url':
                        html += '<div class="url-preview"><code>' + value + '</code></div>';
                        break;
                    case 'request':
                    case 'response':
                    case 'sql':
                        html += '<pre><code>' + formatCode(value) + '</code></pre>';
                        break;
                    case 'html':
                        html += '<div class="html-preview"><iframe srcdoc="' + escapeHtml(value) + '"></iframe></div>';
                        break;
                    default:
                        html += '<p>' + value + '</p>';
                }
            }
            
            return html;
        }
        
        function showMessageDetails(messageIndex) {
            const message = diagramData.messages[messageIndex];
            const modalTitle = document.getElementById('modalTitle');
            const modalBody = document.getElementById('modalBody');
            
            const title = message.details.title || 'Details: ' + message.text;
            modalTitle.textContent = title;
            modalBody.innerHTML = formatMessageDetails(message.details);
            
            modal.style.display = 'block';
        }
        
        // Add click handlers to buttons
        document.addEventListener('DOMContentLoaded', () => {
            const buttonGroups = document.querySelectorAll('.message-button-group');
            buttonGroups.forEach((group, index) => {
                group.addEventListener('click', () => {
                    showMessageDetails(index);
                });
            });
        });
        
        console.log('Powered Diagram loaded successfully!');
        `;
    }

    downloadHTML(content, filename, diagram) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show feedback
        const shareBtn = document.getElementById('shareBtn');
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '✓ Downloaded!';
        shareBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            shareBtn.innerHTML = originalText;
            shareBtn.style.background = '#2ecc71';
        }, 2000);
    }

    showMermaidExport() {
        const diagramInput = document.getElementById('diagramInput').value;
        
        if (!diagramInput.trim()) {
            alert('Please create a diagram first!');
            return;
        }

        const mermaidCode = this.generateMermaidCode(diagramInput);
        const mermaidCodeTextarea = document.getElementById('mermaidCode');
        const mermaidModal = document.getElementById('mermaidModal');
        
        mermaidCodeTextarea.value = mermaidCode;
        mermaidModal.style.display = 'block';
    }

    generateMermaidCode(diagramInput) {
        const lines = diagramInput.split('\n').filter(line => line.trim() !== '');
        let mermaidCode = 'sequenceDiagram\n';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip participant color definitions and detail lines
            if (trimmedLine.startsWith('participant') || 
                trimmedLine.startsWith('[') || 
                trimmedLine === '') {
                continue;
            }
            
            // Parse message lines
            const messageMatch = trimmedLine.match(/^(\w+)(--?>>>?)(\w+):\s*(.+)$/);
            if (messageMatch) {
                const [, from, arrow, to, text] = messageMatch;
                let mermaidArrow;
                if (arrow === '->>' || arrow === '->>') {
                    mermaidArrow = '->>';
                } else if (arrow === '-->>') {
                    mermaidArrow = '-->';
                } else if (arrow === '-->>>') {
                    mermaidArrow = '-->>';  // Mermaid uses -->> for dotted arrows
                }
                mermaidCode += `    ${from}${mermaidArrow}${to}: ${text}\n`;
            }
        }
        
        return mermaidCode;
    }

    async copyMermaidToClipboard() {
        const mermaidCode = document.getElementById('mermaidCode').value;
        const copyBtn = document.getElementById('copyMermaidBtn');
        
        try {
            await navigator.clipboard.writeText(mermaidCode);
            this.showCopyFeedback(copyBtn, '✓ Copied!');
        } catch (err) {
            // Fallback for browsers that don't support clipboard API
            this.fallbackCopyToClipboard(mermaidCode);
            this.showCopyFeedback(copyBtn, '✓ Copied!');
        }
    }

    downloadSource() {
        const diagramInput = document.getElementById('diagramInput').value;
        
        if (!diagramInput.trim()) {
            alert('Please enter a diagram definition first!');
            return;
        }

        // Create filename with timestamp
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `power-diagram-source-${timestamp}.txt`;

        // Create and download the text file
        const blob = new Blob([diagramInput], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show feedback
        const downloadBtn = document.getElementById('downloadSourceBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '✓ Downloaded!';
        downloadBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.style.background = '';
        }, 2000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PoweredDiagram();
});