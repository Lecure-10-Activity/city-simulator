class PowerSystem {
    constructor(city) {
        this.city = city;
        this.powerPlants = [];
        this.powerGrid = new Map();
        this.totalGeneration = 0;
        this.totalDemand = 0;
    }
    
    calculatePower() {
        // Reset power status
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                this.city.grid[y][x].powered = false;
            }
        }
        
        // Find all power plants
        this.findPowerPlants();
        
        // Build power grid network
        this.buildPowerGrid();
        
        // Calculate power generation and demand
        this.calculateGenerationAndDemand();
        
        // Distribute power through the grid
        this.distributePower();
        
        // Update city's calculatePower method
        this.city.calculatePower = () => this.calculatePower();
    }
    
    findPowerPlants() {
        this.powerPlants = [];
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.type === 'power-plant') {
                    this.powerPlants.push({
                        cell: cell,
                        capacity: 1000, // Base capacity
                        generation: 1000
                    });
                }
            }
        }
    }
    
    buildPowerGrid() {
        // Build network graph of connected power lines and plants
        this.powerGrid.clear();
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.connections.power || cell.type === 'power-plant') {
                    const neighbors = this.city.getNeighbors(x, y)
                        .filter(n => n.connections.power || n.type === 'power-plant');
                    this.powerGrid.set(`${x},${y}`, neighbors);
                }
            }
        }
    }
    
    calculateGenerationAndDemand() {
        this.totalGeneration = 0;
        this.totalDemand = 0;
        
        // Calculate total generation from power plants
        this.powerPlants.forEach(plant => {
            this.totalGeneration += plant.generation;
        });
        
        // Calculate total demand from buildings
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.building) {
                    this.totalDemand += this.getBuildingPowerDemand(cell);
                }
            }
        }
    }
    
    getBuildingPowerDemand(cell) {
        const baseDemand = {
            'residential': 10,
            'commercial': 25,
            'industrial': 50,
            'police': 30
        };
        
        const demand = baseDemand[cell.type] || 0;
        const level = cell.building ? cell.building.level : 1;
        return demand * level;
    }
    
    distributePower() {
        if (this.powerPlants.length === 0) return;
        
        // Use flood fill algorithm to distribute power from each plant
        this.powerPlants.forEach(plant => {
            this.floodFillPower(plant.cell, plant.generation);
        });
    }
    
    floodFillPower(startCell, availablePower) {
        const visited = new Set();
        const queue = [{cell: startCell, power: availablePower}];
        
        while (queue.length > 0 && availablePower > 0) {
            const {cell, power} = queue.shift();
            const key = `${cell.x},${cell.y}`;
            
            if (visited.has(key) || power <= 0) continue;
            visited.add(key);
            
            // Power this cell
            cell.powered = true;
            
            // Consume power if it's a building
            let powerUsed = 0;
            if (cell.building) {
                powerUsed = this.getBuildingPowerDemand(cell);
                availablePower -= powerUsed;
            }
            
            // Spread power to connected neighbors
            const neighbors = this.powerGrid.get(key) || [];
            neighbors.forEach(neighbor => {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(neighborKey) && availablePower > 0) {
                    // Power loss over distance
                    const distance = this.getDistance(cell, neighbor);
                    const transmissionLoss = Math.max(0.95, 1 - (distance * 0.01));
                    const transmittedPower = Math.max(0, availablePower * transmissionLoss);
                    
                    queue.push({cell: neighbor, power: transmittedPower});
                }
            });
        }
    }
    
    getDistance(cell1, cell2) {
        return Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);
    }
    
    getPowerEfficiency() {
        if (this.totalDemand === 0) return 1;
        return Math.min(1, this.totalGeneration / this.totalDemand);
    }
    
    getPowerStatus() {
        let poweredBuildings = 0;
        let totalBuildings = 0;
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.building) {
                    totalBuildings++;
                    if (cell.powered) {
                        poweredBuildings++;
                    }
                }
            }
        }
        
        return {
            poweredBuildings,
            totalBuildings,
            coverage: totalBuildings > 0 ? poweredBuildings / totalBuildings : 0,
            generation: this.totalGeneration,
            demand: this.totalDemand,
            efficiency: this.getPowerEfficiency()
        };
    }
    
    calculatePowerCosts() {
        // Operating costs for power plants
        let powerCosts = 0;
        this.powerPlants.forEach(plant => {
            powerCosts += 100; // Base operating cost per plant per year
        });
        
        // Maintenance costs for power lines
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.type === 'power-line') {
                    powerCosts += 5; // Maintenance cost per power line per year
                }
            }
        }
        
        return powerCosts;
    }
    
    // Advanced power features
    calculateRenewableEnergy() {
        // Future feature: solar panels, wind turbines
        // Could be affected by weather, time of day, etc.
        return 0;
    }
    
    calculatePowerStorage() {
        // Future feature: battery storage systems
        // Could store excess power and release during peak demand
        return 0;
    }
    
    calculateSmartGrid() {
        // Future feature: smart grid efficiency improvements
        // Could reduce transmission losses and optimize distribution
        return 1.0; // No improvement yet
    }
}