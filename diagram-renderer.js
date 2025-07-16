class DiagramRenderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.participantWidth = 120;
        this.participantHeight = 40;
        this.messageHeight = 60;
        this.padding = 50;
        this.buttonSize = 16;
    }

    render(diagram) {
        // Store diagram reference for access in other methods
        this.diagram = diagram;
        
        // Clear previous content
        this.svg.innerHTML = '';
        
        // Calculate total width based on dynamic participant widths
        let totalWidth = this.padding;
        diagram.participants.forEach(participant => {
            const displayName = diagram.participantNames.get(participant) || participant;
            const textWidth = this.getTextWidth(displayName, '14px bold');
            const boxWidth = Math.max(this.participantWidth, textWidth + 20);
            totalWidth += boxWidth + this.padding;
        });
        
        const totalHeight = (diagram.messages.length + 1) * this.messageHeight + (this.participantHeight * 2) + this.padding * 2;
        
        this.svg.setAttribute('width', totalWidth);
        this.svg.setAttribute('height', totalHeight);
        
        // Add arrow marker definition
        this.addArrowMarker();
        
        // Calculate participant positions with dynamic widths
        const participantPositions = {};
        let currentX = this.padding;
        
        diagram.participants.forEach((participant, index) => {
            const displayName = diagram.participantNames.get(participant) || participant;
            const textWidth = this.getTextWidth(displayName, '14px bold');
            const boxWidth = Math.max(this.participantWidth, textWidth + 20);
            
            participantPositions[participant] = {
                x: currentX,
                y: this.padding
            };
            
            currentX += boxWidth + this.padding;
        });
        
        // Render participants (top)
        this.renderParticipants(diagram.participants, participantPositions);
        
        // Render participant lifelines
        this.renderLifelines(diagram.participants, participantPositions, totalHeight);
        
        // Render messages
        this.renderMessages(diagram.messages, participantPositions);
        
        // Render participants (bottom)
        this.renderParticipantsBottom(diagram.participants, participantPositions, totalHeight);
    }

    addArrowMarker() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#2c3e50');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        this.svg.appendChild(defs);
    }

    renderParticipants(participants, positions) {
        participants.forEach(participant => {
            const pos = positions[participant];
            const customColor = this.diagram.participantColors.get(participant);
            const displayName = this.diagram.participantNames.get(participant) || participant;
            
            // Calculate text width to adjust box size if needed
            const textWidth = this.getTextWidth(displayName, '14px bold');
            const boxWidth = Math.max(this.participantWidth, textWidth + 20);
            
            // Participant box
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', pos.x);
            rect.setAttribute('y', pos.y);
            rect.setAttribute('width', boxWidth);
            rect.setAttribute('height', this.participantHeight);
            rect.setAttribute('rx', '5');
            
            // Apply custom color if specified
            if (customColor) {
                const darkerColor = this.darkenColor(customColor, 20);
                rect.style.fill = customColor;
                rect.style.stroke = darkerColor;
                rect.style.strokeWidth = '2';
                console.log(`Applied color ${customColor} to participant ${participant}`);
            } else {
                // Apply default styles if no custom color
                rect.setAttribute('class', 'participant');
            }
            
            this.svg.appendChild(rect);
            
            // Participant text (split into multiple lines if needed)
            this.renderParticipantText(displayName, pos.x + boxWidth / 2, pos.y + this.participantHeight / 2, boxWidth - 10);
        });
    }

    renderParticipantsBottom(participants, positions, totalHeight) {
        participants.forEach(participant => {
            const pos = positions[participant];
            const customColor = this.diagram.participantColors.get(participant);
            const displayName = this.diagram.participantNames.get(participant) || participant;
            
            // Calculate text width to adjust box size if needed
            const textWidth = this.getTextWidth(displayName, '14px bold');
            const boxWidth = Math.max(this.participantWidth, textWidth + 20);
            
            // Bottom participant box (positioned at the bottom)
            const bottomY = totalHeight - this.padding - this.participantHeight;
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', pos.x);
            rect.setAttribute('y', bottomY);
            rect.setAttribute('width', boxWidth);
            rect.setAttribute('height', this.participantHeight);
            rect.setAttribute('rx', '5');
            
            // Apply custom color if specified
            if (customColor) {
                const darkerColor = this.darkenColor(customColor, 20);
                rect.style.fill = customColor;
                rect.style.stroke = darkerColor;
                rect.style.strokeWidth = '2';
            } else {
                // Apply default styles if no custom color
                rect.setAttribute('class', 'participant');
            }
            
            this.svg.appendChild(rect);
            
            // Bottom participant text (split into multiple lines if needed)
            this.renderParticipantText(displayName, pos.x + boxWidth / 2, bottomY + this.participantHeight / 2, boxWidth - 10);
        });
    }

    renderLifelines(participants, positions, totalHeight) {
        participants.forEach(participant => {
            const pos = positions[participant];
            const displayName = this.diagram.participantNames.get(participant) || participant;
            const textWidth = this.getTextWidth(displayName, '14px bold');
            const boxWidth = Math.max(this.participantWidth, textWidth + 20);
            const x = pos.x + boxWidth / 2;
            
            // Create a group for the lifeline with tooltip
            const lifelineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // Invisible wider line for easier hover detection
            const hoverLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            hoverLine.setAttribute('x1', x);
            hoverLine.setAttribute('y1', pos.y + this.participantHeight);
            hoverLine.setAttribute('x2', x);
            hoverLine.setAttribute('y2', totalHeight - this.padding - this.participantHeight);
            hoverLine.setAttribute('stroke', 'transparent');
            hoverLine.setAttribute('stroke-width', '20'); // Wider area for easier hover
            hoverLine.setAttribute('cursor', 'pointer');
            
            // Add tooltip functionality with custom events
            hoverLine.addEventListener('mouseenter', (e) => {
                this.showLifelineTooltip(e, displayName);
            });
            
            hoverLine.addEventListener('mouseleave', () => {
                this.hideLifelineTooltip();
            });
            
            hoverLine.addEventListener('mousemove', (e) => {
                this.updateLifelineTooltipPosition(e);
            });
            
            // Visible lifeline
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', pos.y + this.participantHeight);
            line.setAttribute('x2', x);
            line.setAttribute('y2', totalHeight - this.padding - this.participantHeight);
            
            // Apply lifeline style if specified
            const lifelineStyle = this.diagram.participantLifelineStyles.get(participant);
            if (lifelineStyle) {
                line.setAttribute('class', `participant-line ${lifelineStyle}`);
            } else {
                line.setAttribute('class', 'participant-line');
            }
            
            // Add both lines to the group
            lifelineGroup.appendChild(hoverLine);
            lifelineGroup.appendChild(line);
            
            this.svg.appendChild(lifelineGroup);
        });
    }

    renderMessages(messages, positions) {
        messages.forEach((message, index) => {
            const fromPos = positions[message.from];
            const toPos = positions[message.to];
            const y = this.padding + this.participantHeight + (index + 1) * this.messageHeight;
            
            // Calculate participant box widths for proper line positioning
            const fromDisplayName = this.diagram.participantNames.get(message.from) || message.from;
            const toDisplayName = this.diagram.participantNames.get(message.to) || message.to;
            const fromTextWidth = this.getTextWidth(fromDisplayName, '14px bold');
            const toTextWidth = this.getTextWidth(toDisplayName, '14px bold');
            const fromBoxWidth = Math.max(this.participantWidth, fromTextWidth + 20);
            const toBoxWidth = Math.max(this.participantWidth, toTextWidth + 20);
            
            const fromX = fromPos.x + fromBoxWidth / 2;
            const toX = toPos.x + toBoxWidth / 2;
            
            // Message arrow
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromX);
            line.setAttribute('y1', y);
            line.setAttribute('x2', toX);
            line.setAttribute('y2', y);
            line.setAttribute('class', `message-line ${message.type}`);
            this.svg.appendChild(line);
            
            // Message text
            const textX = (fromX + toX) / 2;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX);
            text.setAttribute('y', y - 8);
            text.setAttribute('class', 'message-text');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = message.text;
            this.svg.appendChild(text);
            
            // Add button if there are details
            if (Object.keys(message.details).length > 0) {
                this.renderMessageButton(message, textX, y + 15);
            }
        });
    }

    renderMessageButton(message, x, y) {
        const buttonGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        buttonGroup.setAttribute('class', 'message-button-group');
        
        // Get button text from details, default to 'i' if not specified
        const buttonText = message.details.button || 'i';
        const buttonColor = message.details.buttonColor || '#e74c3c';
        
        // Calculate button size based on text length
        const textLength = buttonText.length;
        const buttonWidth = Math.max(this.buttonSize, textLength * 8 + 8);
        
        // Button background
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x - buttonWidth / 2);
        rect.setAttribute('y', y - this.buttonSize / 2);
        rect.setAttribute('width', buttonWidth);
        rect.setAttribute('height', this.buttonSize);
        rect.setAttribute('class', 'message-button');
        rect.setAttribute('rx', '3');
        
        // Apply custom button color
        const darkerButtonColor = this.darkenColor(buttonColor, 20);
        rect.style.fill = buttonColor;
        rect.style.stroke = darkerButtonColor;
        rect.style.strokeWidth = '1';
        console.log(`Applied button color ${buttonColor} to button`);
        
        buttonGroup.appendChild(rect);
        
        // Button text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('class', 'message-button-text');
        text.textContent = buttonText;
        buttonGroup.appendChild(text);
        
        // Add click event
        buttonGroup.addEventListener('click', () => {
            this.showMessageDetails(message);
        });
        
        this.svg.appendChild(buttonGroup);
    }

    showMessageDetails(message) {
        const modal = document.getElementById('infoModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        // Use custom title if provided, otherwise use default
        const title = message.details.title || `Details: ${message.text}`;
        modalTitle.textContent = title;
        modalBody.innerHTML = this.formatMessageDetails(message.details);
        
        modal.style.display = 'block';
    }

    formatMessageDetails(details) {
        let html = '';
        
        for (const [key, value] of Object.entries(details)) {
            // Skip title, button, and buttonColor as they're used for modal title, button text, and button color
            if (key === 'title' || key === 'button' || key === 'buttonColor') continue;
            
            html += `<h4>${this.formatDetailKey(key)}</h4>`;
            
            switch (key) {
                case 'url':
                    html += `<div class="url-preview"><code>${value}</code></div>`;
                    break;
                case 'request':
                case 'response':
                case 'sql':
                    html += `<pre><code>${this.formatCode(value)}</code></pre>`;
                    break;
                case 'html':
                    html += `<div class="html-preview"><iframe srcdoc="${this.escapeHtml(value)}"></iframe></div>`;
                    break;
                default:
                    html += `<p>${value}</p>`;
            }
        }
        
        return html;
    }

    formatDetailKey(key) {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    }

    formatCode(code) {
        try {
            // Try to parse and format JSON
            const parsed = JSON.parse(code);
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            // If not JSON, return as-is
            return code;
        }
    }

    escapeHtml(html) {
        return html.replace(/"/g, '&quot;');
    }

    // Helper function to darken a color by a percentage
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                     (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
                     (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Helper function to estimate text width
    getTextWidth(text, font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        return context.measureText(text).width;
    }

    // Helper function to render participant text with line breaks
    renderParticipantText(text, x, y, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = this.getTextWidth(testLine, '14px bold');
            
            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        // Render each line
        const lineHeight = 16;
        const startY = y - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, index) => {
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttribute('x', x);
            textElement.setAttribute('y', startY + index * lineHeight);
            textElement.setAttribute('class', 'participant-text');
            textElement.textContent = line;
            this.svg.appendChild(textElement);
        });
    }

    // Tooltip methods for lifelines
    showLifelineTooltip(event, participantName) {
        const tooltip = document.getElementById('lifelineTooltip');
        if (tooltip) {
            tooltip.textContent = participantName;
            tooltip.classList.add('show');
            this.updateLifelineTooltipPosition(event);
        }
    }

    hideLifelineTooltip() {
        const tooltip = document.getElementById('lifelineTooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    updateLifelineTooltipPosition(event) {
        const tooltip = document.getElementById('lifelineTooltip');
        if (tooltip && tooltip.classList.contains('show')) {
            // Use fixed positioning relative to viewport
            const x = event.clientX;
            const y = event.clientY;
            
            // Position tooltip above and to the right of cursor
            tooltip.style.left = (x + 15) + 'px';
            tooltip.style.top = (y - 30) + 'px';
        }
    }
}

// Export for use in other files
window.DiagramRenderer = DiagramRenderer;