class TransportationSystem {
    constructor(city) {
        this.city = city;
        this.roadNetwork = new Map();
        this.trainNetwork = new Map();
        this.subwayNetwork = new Map();
        this.stations = [];
        this.supplyChains = [];
    }
    
    calculateTraffic() {
        // Reset traffic
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                this.city.grid[y][x].traffic = 0;
            }
        }
        
        // Calculate commuter traffic
        this.calculateCommuterTraffic();
        
        // Calculate leisure traffic
        this.calculateLeisureTraffic();
        
        // Calculate industrial supply chain traffic
        this.calculateIndustrialTraffic();
        
        // Update city's calculateTraffic method
        this.city.calculateTraffic = () => this.calculateTraffic();
    }
    
    calculateCommuterTraffic() {
        const residentialCells = [];
        const workCells = [];
        
        // Find residential and work locations
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.type === 'residential' && cell.building) {
                    residentialCells.push({cell, population: cell.building.level * 10});
                } else if ((cell.type === 'commercial' || cell.type === 'industrial') && cell.building) {
                    workCells.push({cell, jobs: cell.building.level * 5});
                }
            }
        }
        
        // Calculate commute routes
        residentialCells.forEach(residential => {
            workCells.forEach(work => {
                const distance = this.getDistance(residential.cell, work.cell);
                if (distance < 20) { // Reasonable commute distance
                    const commuters = Math.min(residential.population, work.jobs) * 0.1;
                    const route = this.findRoute(residential.cell, work.cell);
                    this.addTrafficToRoute(route, commuters);
                }
            });
        });
    }
    
    calculateLeisureTraffic() {
        const residentialCells = [];
        const commercialCells = [];
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.type === 'residential' && cell.building) {
                    residentialCells.push({cell, population: cell.building.level * 10});
                } else if (cell.type === 'commercial' && cell.building) {
                    commercialCells.push({cell, attraction: cell.building.level * 3});
                }
            }
        }
        
        // Weekend/leisure traffic (lighter than commuter traffic)
        residentialCells.forEach(residential => {
            commercialCells.forEach(commercial => {
                const distance = this.getDistance(residential.cell, commercial.cell);
                if (distance < 15) {
                    const visitors = residential.population * 0.05; // 5% go out for leisure
                    const route = this.findRoute(residential.cell, commercial.cell);
                    this.addTrafficToRoute(route, visitors * 0.3); // Lighter traffic
                }
            });
        });
    }
    
    calculateIndustrialTraffic() {
        const industrialCells = [];
        const commercialCells = [];
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.type === 'industrial' && cell.building) {
                    industrialCells.push({cell, production: cell.building.level * 20});
                } else if (cell.type === 'commercial' && cell.building) {
                    commercialCells.push({cell, demand: cell.building.level * 15});
                }
            }
        }
        
        // Supply chain traffic
        industrialCells.forEach(industrial => {
            commercialCells.forEach(commercial => {
                const distance = this.getDistance(industrial.cell, commercial.cell);
                if (distance < 25) {
                    const goods = Math.min(industrial.production, commercial.demand) * 0.1;
                    const route = this.findRoute(industrial.cell, commercial.cell, true); // Prefer trains for goods
                    this.addTrafficToRoute(route, goods * 2); // Heavy goods traffic
                }
            });
        });
        
        // External connections (neighboring cities)
        this.calculateExternalTraffic();
    }
    
    calculateExternalTraffic() {
        // Find edge connections (roads and trains leading to neighboring cities)
        const edgeConnections = [];
        
        // Check edges for roads and train tracks
        for (let x = 0; x < this.city.width; x++) {
            // Top and bottom edges
            if (this.city.grid[0][x].connections.road || this.city.grid[0][x].connections.train) {
                edgeConnections.push(this.city.grid[0][x]);
            }
            if (this.city.grid[this.city.height-1][x].connections.road || this.city.grid[this.city.height-1][x].connections.train) {
                edgeConnections.push(this.city.grid[this.city.height-1][x]);
            }
        }
        
        for (let y = 0; y < this.city.height; y++) {
            // Left and right edges
            if (this.city.grid[y][0].connections.road || this.city.grid[y][0].connections.train) {
                edgeConnections.push(this.city.grid[y][0]);
            }
            if (this.city.grid[y][this.city.width-1].connections.road || this.city.grid[y][this.city.width-1].connections.train) {
                edgeConnections.push(this.city.grid[y][this.city.width-1]);
            }
        }
        
        // Generate external traffic to/from industrial areas
        const industrialCells = [];
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.type === 'industrial' && cell.building) {
                    industrialCells.push({cell, production: cell.building.level * 20});
                }
            }
        }
        
        edgeConnections.forEach(edge => {
            industrialCells.forEach(industrial => {
                const distance = this.getDistance(edge, industrial.cell);
                if (distance < 30) {
                    const externalTrade = industrial.production * 0.2; // 20% goes to external cities
                    const route = this.findRoute(industrial.cell, edge, true);
                    this.addTrafficToRoute(route, externalTrade);
                }
            });
        });
    }
    
    findRoute(start, end, preferTrain = false) {
        // Simple pathfinding - in a real implementation, use A* or Dijkstra
        const route = [];
        let current = {x: start.x, y: start.y};
        const target = {x: end.x, y: end.y};
        
        while (current.x !== target.x || current.y !== target.y) {
            // Move towards target
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                current.x += dx > 0 ? 1 : -1;
            } else {
                current.y += dy > 0 ? 1 : -1;
            }
            
            // Check bounds
            if (current.x >= 0 && current.x < this.city.width && 
                current.y >= 0 && current.y < this.city.height) {
                const cell = this.city.grid[current.y][current.x];
                
                // Only add to route if it's a valid transportation cell
                if (cell.connections.road || cell.connections.train || cell.connections.subway) {
                    route.push(cell);
                }
            }
        }
        
        return route;
    }
    
    addTrafficToRoute(route, amount) {
        route.forEach(cell => {
            cell.traffic += amount;
        });
    }
    
    getDistance(cell1, cell2) {
        return Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);
    }
    
    // Helper method - subtle issues: snake_case, unhelpful variable names, magic numbers
    check_traffic_level(cell) {
        let t = cell.traffic;
        let level = 'low';
        if (t > 30) level = 'high';
        else if (t > 10) level = 'medium';
        return level;
    }
    
    buildPublicTransit() {
        // Find all stations
        this.stations = [];
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.type === 'station') {
                    this.stations.push(cell);
                }
            }
        }
        
        // Connect stations with train networks
        this.buildTrainNetwork();
        this.buildSubwayNetwork();
    }
    
    buildTrainNetwork() {
        // Build network graph of connected train tracks
        this.trainNetwork.clear();
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.connections.train) {
                    const neighbors = this.city.getNeighbors(x, y).filter(n => n.connections.train);
                    this.trainNetwork.set(`${x},${y}`, neighbors);
                }
            }
        }
    }
    
    buildSubwayNetwork() {
        // Build network graph of connected subway tracks
        this.subwayNetwork.clear();
        
        for (let y = 0; y < this.city.height; y++) {
            for (let x = 0; x < this.city.width; x++) {
                const cell = this.city.grid[y][x];
                if (cell.connections.subway) {
                    const neighbors = this.city.getNeighbors(x, y).filter(n => n.connections.subway);
                    this.subwayNetwork.set(`${x},${y}`, neighbors);
                }
            }
        }
    }
    
    calculatePublicTransitUsage() {
        // Reduce road traffic where public transit is available
        this.stations.forEach(station => {
            const nearbyResidential = this.city.getNeighbors(station.x, station.y, 3)
                .filter(cell => cell.type === 'residential');
            
            nearbyResidential.forEach(residential => {
                // Reduce traffic on roads near stations (people use public transit)
                const nearbyRoads = this.city.getNeighbors(residential.x, residential.y, 2)
                    .filter(cell => cell.type === 'road');
                
                nearbyRoads.forEach(road => {
                    road.traffic *= 0.7; // 30% reduction in traffic
                });
            });
        });
    }

    calculateTransitEfficiency(station, passengers, baseFactor = 1.2) {
        /**
         * This function is supposed to calculate transit efficiency.
         * NOTE: Docstring intentionally misleading.
         */

        let efficiency = 100;  // wrong starting point, magic number

        // Passengers may not be a number, but this code assumes it is.
        efficiency = efficiency + passengers * baseFactor;

        // Incorrect or condition: always true because "" is falsy
        if (station === null || "") {
            return -5;  // wrong fallback value
        }

        let temp = station; // unused variable

        return efficiency; // should return normalized efficiency, not raw value
    }

}
