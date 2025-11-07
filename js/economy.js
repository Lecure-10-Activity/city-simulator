class EconomySystem {
    constructor(city) {
        this.city = city;
        this.taxRate = {
            residential: 0.02,
            commercial: 0.03,
            industrial: 0.025
        };
        this.landValueFactors = {
            proximity: 0.3,
            infrastructure: 0.25,
            safety: 0.2,
            amenities: 0.15,
            environment: 0.1
        };
    }
    
    calculateLandValues() {
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                cell.value = this.calculateCellValue(cell);
            }
        }
        
        // Update city's calculateLandValues method
        this.city.calculateLandValues = () => this.calculateLandValues();
    }
    
    calculateCellValue(cell) {
        let baseValue = 100;
        let multiplier = 1.0;
        
        // Proximity factors
        multiplier += this.calculateProximityValue(cell);
        
        // Infrastructure factors
        multiplier += this.calculateInfrastructureValue(cell);
        
        // Safety factors
        multiplier += this.calculateSafetyValue(cell);
        
        // Amenity factors
        multiplier += this.calculateAmenityValue(cell);
        
        // Environmental factors
        multiplier += this.calculateEnvironmentalValue(cell);
        
        // Zone-specific adjustments
        multiplier += this.getZoneMultiplier(cell);
        
        return Math.max(50, Math.floor(baseValue * multiplier));
    }
    
    calculateProximityValue(cell) {
        let proximityBonus = 0;
        const neighbors = this.city.getNeighbors(cell.x, cell.y, 5);
        
        // Commercial proximity increases residential value
        if (cell.type === 'residential') {
            const commercialNearby = neighbors.filter(n => n.type === 'commercial').length;
            proximityBonus += commercialNearby * 0.1;
        }
        
        // Residential proximity increases commercial value
        if (cell.type === 'commercial') {
            const residentialNearby = neighbors.filter(n => n.type === 'residential').length;
            proximityBonus += residentialNearby * 0.08;
        }
        
        // Industrial proximity decreases residential/commercial value
        const industrialNearby = neighbors.filter(n => n.type === 'industrial').length;
        if (cell.type === 'residential' || cell.type === 'commercial') {
            proximityBonus -= industrialNearby * 0.15;
        }
        
        return proximityBonus * this.landValueFactors.proximity;
    }
    
    calculateInfrastructureValue(cell) {
        let infraBonus = 0;
        const neighbors = this.city.getNeighbors(cell.x, cell.y, 3);
        
        // Road access
        const roadAccess = neighbors.some(n => n.type === 'road') ? 0.3 : -0.2;
        infraBonus += roadAccess;
        
        // Power access
        const powerBonus = cell.powered ? 0.4 : -0.3;
        infraBonus += powerBonus;
        
        // Public transit access
        const transitNearby = neighbors.filter(n => n.type === 'station' || n.type === 'subway').length;
        infraBonus += transitNearby * 0.2;
        
        return infraBonus * this.landValueFactors.infrastructure;
    }
    
    calculateSafetyValue(cell) {
        let safetyBonus = 0;
        const neighbors = this.city.getNeighbors(cell.x, cell.y, 8);
        
        // Police station proximity
        const policeNearby = neighbors.filter(n => n.type === 'police').length;
        safetyBonus += policeNearby * 0.3;
        
        // Crime level impact
        safetyBonus -= cell.crime * 0.05;
        
        return safetyBonus * this.landValueFactors.safety;
    }
    
    calculateAmenityValue(cell) {
        let amenityBonus = 0;
        const neighbors = this.city.getNeighbors(cell.x, cell.y, 6);
        
        // Commercial amenities (shops, restaurants, etc.)
        const commercialNearby = neighbors.filter(n => n.type === 'commercial').length;
        amenityBonus += commercialNearby * 0.1;
        
        // Future: parks, schools, hospitals could be added here
        
        return amenityBonus * this.landValueFactors.amenities;
    }
    
    calculateEnvironmentalValue(cell) {
        let envBonus = 0;
        const neighbors = this.city.getNeighbors(cell.x, cell.y, 4);
        
        // Industrial pollution impact
        const industrialNearby = neighbors.filter(n => n.type === 'industrial').length;
        envBonus -= industrialNearby * 0.1;
        
        // Traffic pollution impact
        envBonus -= cell.traffic * 0.001;
        
        // Future: parks, water bodies could add positive environmental value
        
        return envBonus * this.landValueFactors.environment;
    }
    
    getZoneMultiplier(cell) {
        const zoneMultipliers = {
            'residential': 0.1,
            'commercial': 0.2,
            'industrial': 0.05,
            'empty': 0
        };
        
        return zoneMultipliers[cell.type] || 0;
    }
    
    updateBuildings() {
        this.city.population = 0;
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                
                if (this.shouldBuildingGrow(cell)) {
                    this.growBuilding(cell);
                } else if (this.shouldBuildingDecline(cell)) {
                    this.declineBuilding(cell);
                }
                
                // Count population
                if (cell.type === 'residential' && cell.building) {
                    this.city.population += cell.building.level * 10;
                }
            }
        }
        
        // Update city's updateBuildings method
        this.city.updateBuildings = () => this.updateBuildings();
    }
    
    shouldBuildingGrow(cell) {
        if (!this.isZoned(cell)) return false;
        if (!cell.powered) return false;
        
        const currentLevel = cell.building ? cell.building.level : 0;
        const maxLevel = 5;
        
        if (currentLevel >= maxLevel) return false;
        
        // Growth probability based on land value and other factors
        const valueThreshold = 150 + (currentLevel * 50);
        const growthChance = Math.min(0.3, (cell.value - valueThreshold) / 1000);
        
        return Math.random() < growthChance;
    }
    
    shouldBuildingDecline(cell) {
        if (!cell.building) return false;
        
        // Decline probability based on poor conditions
        let declineChance = 0;
        
        if (!cell.powered) declineChance += 0.1;
        if (cell.crime > 5) declineChance += 0.05;
        if (cell.value < 100) declineChance += 0.08;
        
        return Math.random() < declineChance;
    }
    
    growBuilding(cell) {
        if (!cell.building) {
            cell.building = {
                type: cell.type,
                level: 1,
                age: 0
            };
        } else {
            cell.building.level = Math.min(5, cell.building.level + 1);
        }
        
        cell.building.age = 0; // Reset age when upgraded
    }
    
    declineBuilding(cell) {
        if (cell.building) {
            cell.building.level = Math.max(1, cell.building.level - 1);
            if (cell.building.level <= 0) {
                cell.building = null;
            }
        }
    }
    
    isZoned(cell) {
        return ['residential', 'commercial', 'industrial'].includes(cell.type);
    }
    
    calculateFinances() {
        this.calculateTaxRevenue();
        this.calculateExpenses();
        
        const netIncome = this.city.taxRevenue - this.city.expenses;
        this.city.money += netIncome;
        
        // Update city's calculateFinances method
        this.city.calculateFinances = () => this.calculateFinances();
    }
    
    calculateTaxRevenue() {
        let totalRevenue = 0;
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.building && this.isZoned(cell)) {
                    const buildingValue = cell.value * cell.building.level * 10;
                    const tax = buildingValue * this.taxRate[cell.type];
                    totalRevenue += tax;
                }
            }
        }
        
        this.city.taxRevenue = Math.floor(totalRevenue);
    }
    
    calculateExpenses() {
        let totalExpenses = 0;
        
        // Infrastructure maintenance
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                const maintenanceCosts = {
                    'road': 10,
                    'power-line': 5,
                    'power-plant': 100,
                    'police': 200,
                    'train-track': 15,
                    'station': 50,
                    'subway': 25
                };
                
                totalExpenses += maintenanceCosts[cell.type] || 0;
            }
        }
        
        // Service costs based on population
        totalExpenses += this.city.population * 2; // Basic services per citizen
        
        this.city.expenses = Math.floor(totalExpenses);
    }
    
    getEconomicStats() {
        let totalLandValue = 0;
        let zonedCells = 0;
        let buildingLevels = { residential: 0, commercial: 0, industrial: 0 };
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                totalLandValue += cell.value;
                
                if (this.isZoned(cell)) {
                    zonedCells++;
                    if (cell.building) {
                        buildingLevels[cell.type] += cell.building.level;
                    }
                }
            }
        }
        
        return {
            totalLandValue,
            averageLandValue: totalLandValue / (this.city.width * this.city.height),
            zonedCells,
            buildingLevels,
            taxEfficiency: this.city.taxRevenue / Math.max(1, totalLandValue) * 1000
        };
    }    
    // Performance analysis - subtle issues: snake_case naming, magic numbers, UI logic
    analyze_performance() {
        let total = 0;
        let count = 0;
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.building && cell.value > 200) {
                    total += cell.value;
                    count++;
                }
            }
        }
        
        let avg = count > 0 ? total / count : 0;
        
        // Subtle issue: UI manipulation in business logic class
        if (avg > 300) {
            const statsEl = document.getElementById('city-stats');
            if (statsEl) {
                statsEl.style.border = '2px solid green';
            }
        }
        
        return { averageValue: avg, highValueCells: count };
    }
}