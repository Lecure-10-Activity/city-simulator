class UIManager {
    constructor(city) {
        this.city = city;
        this.selectedCell = null;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Grid cell selection and info display
        document.getElementById('city-grid').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                this.selectCell(x, y);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Tool tips
        this.setupTooltips();
    }
    
    selectCell(x, y) {
        this.selectedCell = {x, y};
        const cell = this.city.grid[y][x];
        this.updateCellInfo(cell);
        this.highlightCell(x, y);
    }
    
    updateCellInfo(cell) {
        const details = document.getElementById('cell-details');
        
        // Subtle issue: business logic calculation in UI method (should be in system classes)
        let score = 0;
        if (cell.powered) score += 0.4;
        if (cell.traffic < 40) score += 0.3;
        if (cell.crime < 4) score += 0.3;
        
        let buildingInfo = '';
        if (cell.building) {
            buildingInfo = `
                <div><strong>Building:</strong> ${cell.building.type} (Level ${cell.building.level})</div>
                <div><strong>Age:</strong> ${cell.building.age} years</div>
                <div><strong>Quality Score:</strong> ${(score * 100).toFixed(0)}%</div>
            `;
        }
        
        let connectionInfo = '';
        const connections = Object.keys(cell.connections).filter(key => cell.connections[key]);
        if (connections.length > 0) {
            connectionInfo = `<div><strong>Connections:</strong> ${connections.join(', ')}</div>`;
        }
        
        details.innerHTML = `
            <div><strong>Position:</strong> (${cell.x}, ${cell.y})</div>
            <div><strong>Type:</strong> ${cell.type}</div>
            <div><strong>Powered:</strong> ${cell.powered ? '✓' : '✗'}</div>
            <div><strong>Traffic:</strong> ${Math.round(cell.traffic)}</div>
            <div><strong>Crime:</strong> ${cell.crime.toFixed(1)}</div>
            <div><strong>Land Value:</strong> $${cell.value.toLocaleString()}</div>
            ${buildingInfo}
            ${connectionInfo}
        `;
    }
    
    highlightCell(x, y) {
        // Remove previous highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Add highlight to selected cell
        const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (cellElement) {
            cellElement.classList.add('selected');
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Tool shortcuts
        const shortcuts = {
            'r': 'zone-residential',
            'c': 'zone-commercial',
            'i': 'zone-industrial',
            'o': 'build-road',
            'p': 'build-power-line',
            'g': 'build-power-plant',
            'l': 'build-police',
            't': 'build-train-track',
            's': 'build-station',
            'u': 'build-subway'
        };
        
        if (shortcuts[e.key.toLowerCase()]) {
            e.preventDefault();
            this.selectTool(shortcuts[e.key.toLowerCase()]);
        }
        
        // View shortcuts
        const viewShortcuts = {
            '1': 'traffic',
            '2': 'power',
            '3': 'crime',
            '4': 'value'
        };
        
        if (viewShortcuts[e.key]) {
            e.preventDefault();
            this.selectView(viewShortcuts[e.key]);
        }
        
        // Other shortcuts
        if (e.key === ' ') { // Spacebar
            e.preventDefault();
            this.city.toggleSimulation();
        }
        
        if (e.key === 'Enter') {
            e.preventDefault();
            this.city.simulateYear();
        }
    }
    
    selectTool(toolId) {
        const toolButton = document.getElementById(toolId);
        if (!toolButton) return;
        
        const isCurrentlyActive = toolButton.classList.contains('active');
        
        // Remove active class from all tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (isCurrentlyActive) {
            // If the tool was already active, deselect it
            this.city.currentTool = null;
            this.city.updateToolStatus();
            console.log('Tool deselected via keyboard:', toolId);
        } else {
            // If the tool wasn't active, select it
            toolButton.classList.add('active');
            this.city.currentTool = toolId;
            this.city.updateToolStatus();
            console.log('Tool selected via keyboard:', toolId);
        }
    }
    
    selectView(viewMode) {
        const viewButton = document.getElementById(`view-${viewMode}`);
        if (!viewButton) return;
        
        const isCurrentlyActive = viewButton.classList.contains('active');
        
        // Remove active class from all view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (isCurrentlyActive) {
            // If the view was already active, return to normal view
            this.city.viewMode = 'normal';
            this.city.updateViewStatus();
            console.log('View mode reset to normal via keyboard:', viewMode);
        } else {
            // If the view wasn't active, select it
            viewButton.classList.add('active');
            this.city.viewMode = viewMode;
            this.city.updateViewStatus();
            console.log('View mode selected via keyboard:', viewMode);
        }
        
        this.city.updateDisplay();
    }
    
    setupTooltips() {
        const tooltips = {
            'zone-residential': 'Zone for houses and apartments (R) - Click again to deselect',
            'zone-commercial': 'Zone for shops and offices (C) - Click again to deselect',
            'zone-industrial': 'Zone for factories and warehouses (I) - Click again to deselect',
            'build-road': 'Build roads for transportation (O) - Click again to deselect',
            'build-power-line': 'Build power lines (P) - Click again to deselect',
            'build-power-plant': 'Build power plant (G) - Click again to deselect',
            'build-police': 'Build police station (L) - Click again to deselect',
            'build-train-track': 'Build train tracks (T) - Click again to deselect',
            'build-station': 'Build train/subway station (S) - Click again to deselect',
            'build-subway': 'Build subway tunnel (U) - Click again to deselect',
            'view-traffic': 'Show traffic levels (1) - Click again for normal view',
            'view-power': 'Show power grid (2) - Click again for normal view',
            'view-crime': 'Show crime levels (3) - Click again for normal view',
            'view-value': 'Show land values (4) - Click again for normal view'
        };
        
        Object.keys(tooltips).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.title = tooltips[id];
            }
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#27ae60';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f39c12';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                break;
            default:
                notification.style.backgroundColor = '#3498db';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    updateStatsDisplay() {
        // Enhanced stats display with more detailed information
        const statsPanel = document.getElementById('city-stats');
        
        // Get system stats
        const powerStats = this.city.powerSystem ? this.city.powerSystem.getPowerStatus() : null;
        const crimeStats = this.city.crimeSystem ? this.city.crimeSystem.getCrimeStats() : null;
        const economicStats = this.city.economySystem ? this.city.economySystem.getEconomicStats() : null;
        
        let additionalStats = '';
        
        if (powerStats) {
            additionalStats += `
                <div>Power Coverage: ${(powerStats.coverage * 100).toFixed(1)}%</div>
                <div>Power Generation: ${powerStats.generation} MW</div>
                <div>Power Demand: ${powerStats.demand} MW</div>
            `;
        }
        
        if (crimeStats) {
            additionalStats += `
                <div>Average Crime: ${crimeStats.averageCrime.toFixed(1)}</div>
                <div>Crime Hotspots: ${crimeStats.crimeHotspots}</div>
            `;
        }
        
        if (economicStats) {
            additionalStats += `
                <div>Avg Land Value: $${Math.round(economicStats.averageLandValue)}</div>
                <div>Zoned Cells: ${economicStats.zonedCells}</div>
            `;
        }
        
        statsPanel.innerHTML = `
            <h3>City Statistics</h3>
            <div>Population: ${this.city.population.toLocaleString()}</div>
            <div>Money: $${this.city.money.toLocaleString()}</div>
            <div>Year: ${this.city.year}</div>
            <div>Tax Revenue: $${this.city.taxRevenue.toLocaleString()}</div>
            <div>Expenses: $${this.city.expenses.toLocaleString()}</div>
            ${additionalStats}
        `;
    }
    
    createContextMenu(x, y, cell) {
        // Future feature: right-click context menu for cells
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            background: #34495e;
            border: 1px solid #2c3e50;
            border-radius: 4px;
            padding: 5px 0;
            z-index: 1000;
        `;
        
        const actions = this.getContextActions(cell);
        actions.forEach(action => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.textContent = action.label;
            item.style.cssText = `
                padding: 8px 15px;
                cursor: pointer;
                color: white;
            `;
            item.addEventListener('click', action.callback);
            menu.appendChild(item);
        });
        
        document.body.appendChild(menu);
        
        // Remove menu when clicking elsewhere
        setTimeout(() => {
            document.addEventListener('click', () => {
                menu.remove();
            }, { once: true });
        }, 100);
    }
    
    getContextActions(cell) {
        const actions = [];
        
        if (cell.building) {
            actions.push({
                label: 'Demolish Building',
                callback: () => this.demolishBuilding(cell)
            });
        }
        
        if (cell.type !== 'empty') {
            actions.push({
                label: 'Clear Cell',
                callback: () => this.clearCell(cell)
            });
        }
        
        actions.push({
            label: 'Inspect Cell',
            callback: () => this.inspectCell(cell)
        });
        
        return actions;
    }
    
    demolishBuilding(cell) {
        if (cell.building) {
            cell.building = null;
            this.city.updateDisplay();
            this.showNotification('Building demolished', 'info');
        }
    }
    
    clearCell(cell) {
        cell.type = 'empty';
        cell.building = null;
        Object.keys(cell.connections).forEach(key => {
            cell.connections[key] = false;
        });
        this.city.updateDisplay();
        this.showNotification('Cell cleared', 'info');
    }
    
    inspectCell(cell) {
        this.selectCell(cell.x, cell.y);
        this.showNotification(`Inspecting cell at (${cell.x}, ${cell.y})`, 'info');
    }
}