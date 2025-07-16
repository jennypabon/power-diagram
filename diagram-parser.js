class DiagramParser {
    constructor() {
        this.participants = new Set();
        this.participantColors = new Map();
        this.participantAliases = new Map(); // alias -> full name
        this.participantNames = new Map(); // alias -> display name
        this.participantLifelineStyles = new Map(); // alias -> lifeline style
        this.messages = [];
    }

    parse(text) {
        this.participants.clear();
        this.participantColors.clear();
        this.participantAliases.clear();
        this.participantNames.clear();
        this.participantLifelineStyles.clear();
        this.messages = [];
        
        const lines = text.split('\n');
        let currentMessage = null;
        let inLiteralBlock = false;
        let literalBlockKey = null;
        let literalBlockContent = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Handle literal block end
            if (inLiteralBlock && trimmedLine === '```') {
                // Check if next line is the closing bracket
                if (i + 1 < lines.length && lines[i + 1].trim() === ']') {
                    if (currentMessage && literalBlockKey) {
                        currentMessage.details[literalBlockKey] = literalBlockContent.join('\n');
                    }
                    inLiteralBlock = false;
                    literalBlockKey = null;
                    literalBlockContent = [];
                    i++; // Skip the ] line
                }
                continue;
            }
            
            // If we're in a literal block, collect the content
            if (inLiteralBlock) {
                literalBlockContent.push(line);
                continue;
            }
            
            // Skip empty lines when not in literal block
            if (trimmedLine === '') {
                continue;
            }
            
            // Parse participant definitions with various formats:
            // participant ParticipantName #color
            // participant "Full Name" as Alias #color
            // participant "Full Name" as Alias
            // participant FullName as Alias
            // participant "Full Name"
            // participant "Full Name" as Alias #color solid
            // participant "Full Name" as Alias #color dashed
            
            const participantMatch = trimmedLine.match(/^participant\s+(.+?)(?:\s+#([a-fA-F0-9]{6}))?(?:\s+(solid|dashed))?$/);
            if (participantMatch) {
                const [, participantPart, color, lifelineStyle] = participantMatch;
                
                let alias, displayName;
                
                // Check for "as" keyword (alias)
                const asMatch = participantPart.match(/^(.+?)\s+as\s+(\w+)$/);
                if (asMatch) {
                    let [, fullName, aliasName] = asMatch;
                    // Remove quotes if present
                    displayName = fullName.replace(/^"(.*)"$/, '$1');
                    alias = aliasName;
                } else {
                    // No alias, use the name as both display and alias
                    displayName = participantPart.replace(/^"(.*)"$/, '$1');
                    alias = participantPart.replace(/^"(.*)"$/, '$1').replace(/\s+/g, '');
                }
                
                this.participants.add(alias);
                this.participantNames.set(alias, displayName);
                
                if (color) {
                    this.participantColors.set(alias, `#${color}`);
                }
                
                if (lifelineStyle) {
                    this.participantLifelineStyles.set(alias, lifelineStyle);
                }
                
                continue;
            }
            
            // Parse message line (A->>B: message, A-->>B: message, or A-->>>B: message)
            const messageMatch = trimmedLine.match(/^(\w+)(--?>>>?)(\w+):\s*(.+)$/);
            if (messageMatch) {
                const [, from, arrow, to, text] = messageMatch;
                
                // Add participants (they might not have been explicitly declared)
                this.participants.add(from);
                this.participants.add(to);
                
                // If not explicitly declared, use the alias as display name
                if (!this.participantNames.has(from)) {
                    this.participantNames.set(from, from);
                }
                if (!this.participantNames.has(to)) {
                    this.participantNames.set(to, to);
                }
                
                // Determine arrow type
                let arrowType;
                if (arrow === '->>' || arrow === '->>') {
                    arrowType = 'solid';
                } else if (arrow === '-->>') {
                    arrowType = 'dashed';
                } else if (arrow === '-->>>') {
                    arrowType = 'dotted';
                }
                
                // Create message object
                currentMessage = {
                    from,
                    to,
                    text,
                    type: arrowType,
                    details: {}
                };
                
                this.messages.push(currentMessage);
                continue;
            }
            
            // Parse detail lines (must follow a message)
            if (currentMessage && trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                const detailMatch = trimmedLine.match(/^\[(\w+):\s*(.+)\]$/);
                if (detailMatch) {
                    const [, key, value] = detailMatch;
                    currentMessage.details[key] = value;
                }
                continue;
            }
            
            // Parse literal block start (must follow a message)
            if (currentMessage && trimmedLine.startsWith('[') && trimmedLine.endsWith(':')) {
                const literalMatch = trimmedLine.match(/^\[(\w+):\s*$/);
                if (literalMatch) {
                    literalBlockKey = literalMatch[1];
                    // Check if next line is ```
                    if (i + 1 < lines.length && lines[i + 1].trim() === '```') {
                        inLiteralBlock = true;
                        i++; // Skip the ``` line
                        literalBlockContent = [];
                    }
                }
                continue;
            }
        }
        
        return {
            participants: Array.from(this.participants),
            participantColors: this.participantColors,
            participantNames: this.participantNames,
            participantLifelineStyles: this.participantLifelineStyles,
            messages: this.messages
        };
    }
}

// Export for use in other files
window.DiagramParser = DiagramParser;