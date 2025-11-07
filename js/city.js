class City {
    constructor(width = 50, height = 50) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.year = 2024;
        this.money = 100000;
        this.population = 0;
        this.taxRevenue = 0;
        this.expenses = 0;
        this.buildings = new Map();
        this.currentTool = null;
        this.viewMode = 'normal';
        this.isRunning = false;
        this.speed = 5;
        
        this.initializeGrid();
        this.setupEventListeners();
    }
    
    initializeGrid() {
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = {
                    type: 'empty',
                    x: x,
                    y: y,
                    powered: false,
                    traffic: 0,
                    crime: 0,
                    value: 100,
                    building: null,
                    connections: {
                        road: false,
                        power: false,
                        train: false,
                        subway: false
                    }
                };
            }
        }
    }
    
    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isCurrentlyActive = e.target.classList.contains('active');
                
                // Remove active class from all tool buttons
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                
                if (isCurrentlyActive) {
                    // If clicking the same tool, deselect it
                    this.currentTool = null;
                    this.updateToolStatus();
                    console.log('Tool deselected');
                } else {
                    // If clicking a different tool, select it
                    e.target.classList.add('active');
                    this.currentTool = e.target.id;
                    this.updateToolStatus();
                    console.log('Tool selected:', this.currentTool);
                }
            });
        });
        
        // View mode selection
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isCurrentlyActive = e.target.classList.contains('active');
                
                // Remove active class from all view buttons
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                
                if (isCurrentlyActive) {
                    // If clicking the same view, return to normal view
                    this.viewMode = 'normal';
                    this.updateViewStatus();
                    console.log('View mode reset to normal');
                } else {
                    // If clicking a different view, select it
                    e.target.classList.add('active');
                    this.viewMode = e.target.id.replace('view-', '');
                    this.updateViewStatus();
                    console.log('View mode selected:', this.viewMode);
                }
                
                this.updateDisplay();
            });
        });
        
        // Grid interaction
        document.getElementById('city-grid').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                this.handleCellClick(x, y);
            }
        });
        
        // Controls
        const simulateBtn = document.getElementById('simulate-year');
        const pausePlayBtn = document.getElementById('pause-play');
        const speedSlider = document.getElementById('speed-slider');
        
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => {
                console.log('Simulate year button clicked');
                this.simulateYear();
            });
        } else {
            console.error('Simulate year button not found');
        }
        
        if (pausePlayBtn) {
            pausePlayBtn.addEventListener('click', () => {
                console.log('Pause/Play button clicked');
                this.toggleSimulation();
            });
        } else {
            console.error('Pause/Play button not found');
        }
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.speed = parseInt(e.target.value);
                console.log('Speed changed to:', this.speed);
            });
        } else {
            console.error('Speed slider not found');
        }
    }
    
    handleCellClick(x, y) {
        const cell = this.grid[y][x];
        
        if (this.currentTool) {
            this.buildOnCell(x, y, this.currentTool);
        }
        
        this.selectCell(x, y);
        this.updateCellInfo(cell);
    }
    
    buildOnCell(x, y, tool) {
        const cell = this.grid[y][x];
        const costs = {
            'zone-residential': 500,
            'zone-commercial': 800,
            'zone-industrial': 1200,
            'build-road': 100,
            'build-power-line': 50,
            'build-power-plant': 5000,
            'build-police': 3000,
            'build-train-track': 200,
            'build-station': 2000,
            'build-subway': 1000
        };
        
        const cost = costs[tool] || 0;
        if (this.money < cost) {
            alert('Not enough money!');
            return;
        }
        
        this.money -= cost;
        
        switch (tool) {
            case 'zone-residential':
                cell.type = 'residential';
                break;
            case 'zone-commercial':
                cell.type = 'commercial';
                break;
            case 'zone-industrial':
                cell.type = 'industrial';
                break;
            case 'build-road':
                cell.type = 'road';
                cell.connections.road = true;
                break;
            case 'build-power-line':
                cell.type = 'power-line';
                cell.connections.power = true;
                break;
            case 'build-power-plant':
                cell.type = 'power-plant';
                cell.connections.power = true;
                break;
            case 'build-police':
                cell.type = 'police';
                break;
            case 'build-train-track':
                cell.type = 'train-track';
                cell.connections.train = true;
                break;
            case 'build-station':
                cell.type = 'station';
                cell.connections.train = true;
                cell.connections.road = true;
                break;
            case 'build-subway':
                cell.type = 'subway';
                cell.connections.subway = true;
                break;
        }
        
        this.updateDisplay();
        this.updateStats();
    }
    
    selectCell(x, y) {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (cellElement) {
            cellElement.classList.add('selected');
        }
    }
    
    updateCellInfo(cell) {
        const details = document.getElementById('cell-details');
        details.innerHTML = `
            <div>Type: ${cell.type}</div>
            <div>Position: (${cell.x}, ${cell.y})</div>
            <div>Powered: ${cell.powered ? 'Yes' : 'No'}</div>
            <div>Traffic: ${cell.traffic}</div>
            <div>Crime: ${cell.crime.toFixed(1)}</div>
            <div>Value: $${cell.value}</div>
            ${cell.building ? `<div>Building: ${cell.building.type} (Level ${cell.building.level})</div>` : ''}
        `;
    }
    
    getNeighbors(x, y, radius = 1) {
        const neighbors = [];
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    neighbors.push(this.grid[ny][nx]);
                }
            }
        }
        return neighbors;
    }
    
    // Default implementations (will be overridden by systems)
    calculatePower() {
        console.log('Default power calculation');
        // Simple default: power plants power nearby cells
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (cell.type === 'power-plant') {
                    const neighbors = this.getNeighbors(x, y, 5);
                    neighbors.forEach(neighbor => {
                        neighbor.powered = true;
                    });
                    cell.powered = true;
                }
            }
        }
    }
    
    calculateTraffic() {
        console.log('Default traffic calculation');
        // Simple default: add some random traffic to roads
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (cell.type === 'road') {
                    cell.traffic = Math.random() * 20;
                }
            }
        }
    }
    
    calculateCrime() {
        console.log('Default crime calculation');
        // Simple default: base crime rates
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                const baseCrime = {
                    'residential': 2,
                    'commercial': 4,
                    'industrial': 3,
                    'empty': 1
                };
                cell.crime = baseCrime[cell.type] || 1;
                
                // Police stations reduce crime
                if (cell.type === 'police') {
                    const neighbors = this.getNeighbors(cell.x, cell.y, 5);
                    neighbors.forEach(neighbor => {
                        neighbor.crime *= 0.5;
                    });
                }
            }
        }
    }
    
    calculateLandValues() {
        console.log('Default land value calculation');
        // Simple default: base values with some variation
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                let baseValue = 100;
                
                if (cell.powered) baseValue += 50;
                if (cell.type === 'commercial') baseValue += 100;
                if (cell.type === 'residential') baseValue += 50;
                
                cell.value = baseValue + Math.random() * 50;
            }
        }
    }
    
    updateBuildings() {
        console.log('Default building update');
        this.population = 0;
        
        // Simple building growth
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                
                if (['residential', 'commercial', 'industrial'].includes(cell.type)) {
                    if (!cell.building && cell.powered && Math.random() < 0.1) {
                        cell.building = {
                            type: cell.type,
                            level: 1,
                            age: 0
                        };
                    }
                    
                    if (cell.building && cell.type === 'residential') {
                        this.population += cell.building.level * 10;
                    }
                }
            }
        }
    }
    
    calculateFinances() {
        console.log('Default finance calculation');
        // Simple tax calculation
        this.taxRevenue = this.population * 50;
        this.expenses = this.population * 20;
        
        const netIncome = this.taxRevenue - this.expenses;
        this.money += netIncome;
    }
    
    simulateYear() {
        console.log('Simulating year:', this.year + 1);
        this.year++;
        
        try {
            this.calculatePower();
            this.calculateTraffic();
            this.calculateCrime();
            this.calculateLandValues();
            this.updateBuildings();
            this.calculateFinances();
            this.updateStats();
            this.updateDisplay();
            
            // Performance check - subtle issues: magic number, unhelpful variable name
            if (this.money < 20000 && this.economySystem) {
                let result = this.economySystem.analyze_performance();
                console.log('Performance analyzed:', result);
            }
            
            console.log('Year simulation completed successfully');
        } catch (error) {
            console.error('Error during year simulation:', error);
        }
    }
    
    toggleSimulation() {
        this.isRunning = !this.isRunning;
        console.log('Simulation toggled:', this.isRunning ? 'Running' : 'Paused');
        
        const button = document.getElementById('pause-play');
        if (button) {
            button.textContent = this.isRunning ? 'Pause' : 'Play';
        }
        
        if (this.isRunning) {
            this.startSimulation();
        }
    }
    
    startSimulation() {
        if (!this.isRunning) return;
        
        const delay = Math.max(100, 1000 / this.speed); // Minimum 100ms delay
        
        setTimeout(() => {
            if (this.isRunning) { // Check again in case it was paused
                this.simulateYear();
                this.startSimulation();
            }
        }, delay);
    }
    
    updateStats() {
        const populationEl = document.getElementById('population');
        if (populationEl) populationEl.textContent = `Population: ${this.population.toLocaleString()}`;
        const moneyEl = document.getElementById('money');
        if (moneyEl) moneyEl.textContent = `Money: $${this.money.toLocaleString()}`;
        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = `Year: ${this.year}${this.isRunning ? ' (Running)' : ''}`;
        const taxRevenueEl = document.getElementById('tax-revenue');
        if (taxRevenueEl) taxRevenueEl.textContent = `Tax Revenue: $${this.taxRevenue.toLocaleString()}`;
        const expensesEl = document.getElementById('expenses');
        if (expensesEl) expensesEl.textContent = `Expenses: $${this.expenses.toLocaleString()}`;
        console.log(`Stats updated - Year: ${this.year}, Population: ${this.population}, Money: $${this.money}`);
    }
    
    updateToolStatus() {
        const toolStatusEl = document.getElementById('current-tool');
        if (toolStatusEl) {
            if (this.currentTool) {
                const toolName = this.getToolDisplayName(this.currentTool);
                toolStatusEl.textContent = `Tool: ${toolName}`;
                toolStatusEl.style.color = '#2ecc71';
            } else {
                toolStatusEl.textContent = 'Tool: None (Click to inspect)';
                toolStatusEl.style.color = '#95a5a6';
            }
        }
    }
    
    updateViewStatus() {
        const viewStatusEl = document.getElementById('current-view');
        if (viewStatusEl) {
            const viewName = this.viewMode.charAt(0).toUpperCase() + this.viewMode.slice(1);
            viewStatusEl.textContent = `View: ${viewName}`;
            if (this.viewMode === 'normal') {
                viewStatusEl.style.color = '#95a5a6';
            } else {
                viewStatusEl.style.color = '#3498db';
            }
        }
    }
    
    getToolDisplayName(toolId) {
        const toolNames = {
            'zone-residential': 'Residential Zone',
            'zone-commercial': 'Commercial Zone',
            'zone-industrial': 'Industrial Zone',
            'build-road': 'Road',
            'build-power-line': 'Power Line',
            'build-power-plant': 'Power Plant',
            'build-police': 'Police Station',
            'build-train-track': 'Train Track',
            'build-station': 'Station',
            'build-subway': 'Subway'
        };
        return toolNames[toolId] || toolId;
    }
    
    updateDisplay() {
        const grid = document.getElementById('city-grid');
        if (!grid) {
            console.warn('City grid element not found');
            return;
        }
        grid.innerHTML = '';
        
        // Add class to grid based on tool selection
        if (this.currentTool) {
            grid.classList.remove('no-tool-selected');
            grid.classList.add('tool-selected');
        } else {
            grid.classList.remove('tool-selected');
            grid.classList.add('no-tool-selected');
        }
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                const cellElement = document.createElement('div');
                cellElement.className = `cell ${cell.type}`;
                cellElement.dataset.x = x;
                cellElement.dataset.y = y;
                
                // Apply view mode overlays
                this.applyViewMode(cellElement, cell);
                
                grid.appendChild(cellElement);
            }
        }
    }
    
    applyViewMode(element, cell) {
        switch (this.viewMode) {
            case 'traffic':
                if (cell.traffic > 50) element.classList.add('traffic-heavy');
                else if (cell.traffic > 20) element.classList.add('traffic-medium');
                else if (cell.traffic > 5) element.classList.add('traffic-light');
                break;
            case 'power':
                element.classList.add(cell.powered ? 'powered' : 'unpowered');
                break;
            case 'crime':
                if (cell.crime > 7) element.classList.add('crime-high');
                else if (cell.crime > 4) element.classList.add('crime-medium');
                else element.classList.add('crime-low');
                break;
            case 'value':
                if (cell.value > 500) element.classList.add('value-premium');
                else if (cell.value > 300) element.classList.add('value-high');
                else if (cell.value > 150) element.classList.add('value-medium');
                else element.classList.add('value-low');
                break;
        }
    }
}