class CrimeSystem {
    constructor(city) {
        this.city = city;
        this.policeStations = [];
        this.crimeHotspots = [];
        this.baseCrimeRates = {
            'residential': 2.0,
            'commercial': 4.0,
            'industrial': 3.0,
            'empty': 1.0
        };
    }
    
    calculateCrime() {
        // Reset crime scores
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                this.city.grid[y][x].crime = 0;
            }
        }
        
        // Find police stations
        this.findPoliceStations();
        
        // Calculate base crime for each cell
        this.calculateBaseCrime();
        
        // Apply police influence
        this.applyPoliceInfluence();
        
        // Apply environmental factors
        this.applyEnvironmentalFactors();
        
        // Identify crime hotspots
        this.identifyCrimeHotspots();
        
        // Update city's calculateCrime method
        this.city.calculateCrime = () => this.calculateCrime();
    }
    
    findPoliceStations() {
        this.policeStations = [];
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.type === 'police') {
                    this.policeStations.push({
                        cell: cell,
                        coverage: 8, // Base coverage radius
                        effectiveness: cell.powered ? 1.0 : 0.3 // Reduced effectiveness without power
                    });
                }
            }
        }
    }
    
    calculateBaseCrime() {
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                
                // Base crime rate by zone type
                let baseCrime = this.baseCrimeRates[cell.type] || 1.0;
                
                // Building density affects crime
                if (cell.building) {
                    baseCrime *= (1 + cell.building.level * 0.2);
                }
                
                // Population density affects crime
                const neighbors = this.city.getNeighbors(cell.x, cell.y, 2);
                const buildingDensity = neighbors.filter(n => n.building).length / neighbors.length;
                baseCrime *= (1 + buildingDensity * 0.5);
                
                cell.crime = baseCrime;
            }
        }
    }
    
    applyPoliceInfluence() {
        this.policeStations.forEach(station => {
            const coverage = station.coverage;
            const effectiveness = station.effectiveness;
            
            // Apply police influence in a radius around the station
            for (let dy = -coverage; dy <= coverage; dy++) {
                for (let dx = -coverage; dx <= coverage; dx++) {
                    const x = station.cell.x + dx;
                    const y = station.cell.y + dy;
                    
                    if (x >= 0 && x < this.city.width && y >= 0 && y < this.city.height) {
                        const cell = this.city.grid[y][x];
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance <= coverage) {
                            // Crime reduction based on distance and effectiveness
                            const influence = effectiveness * (1 - distance / coverage);
                            const crimeReduction = influence * 0.7; // Up to 70% crime reduction
                            cell.crime *= (1 - crimeReduction);
                        }
                    }
                }
            }
        });
    }
    
    applyEnvironmentalFactors() {
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                
                // Lack of power increases crime
                if (!cell.powered) {
                    cell.crime *= 1.5;
                }
                
                // High traffic areas have more crime opportunities
                if (cell.traffic > 30) {
                    cell.crime *= 1.3;
                } else if (cell.traffic > 10) {
                    cell.crime *= 1.1;
                }
                
                // Low land value areas have higher crime
                if (cell.value < 100) {
                    cell.crime *= 1.4;
                } else if (cell.value > 300) {
                    cell.crime *= 0.8;
                }
                
                // Industrial areas at night have higher crime
                if (cell.type === 'industrial') {
                    cell.crime *= 1.2;
                }
                
                // Commercial areas attract certain types of crime
                if (cell.type === 'commercial') {
                    cell.crime *= 1.1;
                }
                
                // Isolated areas (no neighbors) have higher crime
                const neighbors = this.city.getNeighbors(cell.x, cell.y, 1);
                const occupiedNeighbors = neighbors.filter(n => n.building || n.type !== 'empty').length;
                if (occupiedNeighbors < 2) {
                    cell.crime *= 1.3;
                }
            }
        }
    }
    
    identifyCrimeHotspots() {
        this.crimeHotspots = [];
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                
                if (cell.crime > 6) { // High crime threshold
                    this.crimeHotspots.push({
                        cell: cell,
                        severity: this.getCrimeSeverity(cell.crime)
                    });
                }
            }
        }
    }
    
    getCrimeSeverity(crimeScore) {
        if (crimeScore > 10) return 'extreme';
        if (crimeScore > 7) return 'high';
        if (crimeScore > 4) return 'medium';
        return 'low';
    }
    
    calculateCrimeSpread() {
        // Crime can spread to neighboring areas over time
        const crimeSpread = [];
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                
                if (cell.crime > 5) {
                    const neighbors = this.city.getNeighbors(cell.x, cell.y, 1);
                    neighbors.forEach(neighbor => {
                        const spreadAmount = cell.crime * 0.1; // 10% of crime spreads
                        crimeSpread.push({
                            target: neighbor,
                            amount: spreadAmount
                        });
                    });
                }
            }
        }
        
        // Apply crime spread
        crimeSpread.forEach(spread => {
            spread.target.crime += spread.amount;
        });
    }
    
    calculatePoliceEffectiveness() {
        if (this.policeStations.length === 0) return 0;
        
        let totalCoverage = 0;
        let totalCells = this.city.width * this.city.height;
        
        this.policeStations.forEach(station => {
            const coverage = station.coverage;
            const cellsCovered = Math.PI * coverage * coverage; // Approximate circular coverage
            totalCoverage += Math.min(cellsCovered, totalCells);
        });
        
        return Math.min(1, totalCoverage / totalCells);
    }
    
    getCrimeStats() {
        let totalCrime = 0;
        let highCrimeCells = 0;
        let crimeByCellType = {
            residential: 0,
            commercial: 0,
            industrial: 0,
            empty: 0
        };
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                totalCrime += cell.crime;
                
                if (cell.crime > 6) {
                    highCrimeCells++;
                }
                
                if (crimeByCellType.hasOwnProperty(cell.type)) {
                    crimeByCellType[cell.type] += cell.crime;
                }
            }
        }
        
        return {
            totalCrime,
            averageCrime: totalCrime / (this.city.width * this.city.height),
            highCrimeCells,
            crimeHotspots: this.crimeHotspots.length,
            policeEffectiveness: this.calculatePoliceEffectiveness(),
            crimeByCellType
        };
    }
    
    calculateCrimeCosts() {
        // Economic impact of crime
        let crimeCosts = 0;
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                
                // Crime reduces property values and economic activity
                if (cell.building) {
                    const crimeImpact = Math.min(cell.crime * 0.1, 0.5); // Max 50% impact
                    const economicLoss = cell.value * cell.building.level * crimeImpact;
                    crimeCosts += economicLoss;
                }
            }
        }
        
        // Police operating costs
        const policeCosts = this.policeStations.length * 200; // Annual operating cost per station
        
        return {
            crimeDamage: Math.floor(crimeCosts),
            policeCosts: policeCosts,
            totalCosts: Math.floor(crimeCosts + policeCosts)
        };
    }
    
    // Advanced crime features
    calculateCrimeTypes() {
        // Future feature: different types of crime (theft, vandalism, etc.)
        // Each type could have different prevention methods and impacts
        return {
            theft: 0,
            vandalism: 0,
            assault: 0,
            trafficking: 0
        };
    }
    
    calculateCrimeTime() {
        // Future feature: crime varies by time of day
        // Commercial areas might have more crime during business hours
        // Residential areas might have more crime at night
        return 1.0; // No time variation yet
    }
}