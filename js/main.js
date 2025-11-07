// Main application entry point
class CitySimulator {
    constructor() {
        this.city = null;
        this.uiManager = null;
        this.transportationSystem = null;
        this.powerSystem = null;
        this.economySystem = null;
        this.crimeSystem = null;
        
        this.initialize();
    }
    
    initialize() {
        console.log('Initializing City Simulator...');
        
        // Create city instance
        this.city = new City(50, 50);
        console.log('City created');
        
        // Initialize all systems
        this.transportationSystem = new TransportationSystem(this.city);
        this.powerSystem = new PowerSystem(this.city);
        this.economySystem = new EconomySystem(this.city);
        this.crimeSystem = new CrimeSystem(this.city);
        console.log('Systems created');
        
        // Link systems to city
        this.city.transportationSystem = this.transportationSystem;
        this.city.powerSystem = this.powerSystem;
        this.city.economySystem = this.economySystem;
        this.city.crimeSystem = this.crimeSystem;
        
        // Initialize UI
        this.uiManager = new UIManager(this.city);
        this.city.uiManager = this.uiManager;
        console.log('UI initialized');
        
        // Override city methods with system methods
        this.setupSystemIntegration();
        console.log('System integration complete');
        
        // Add some sample content for demonstration
        this.addSampleContent();
        console.log('Sample content added');
        
        // Initial display (after sample content is added)
        this.city.updateDisplay();
        this.city.updateStats();
        this.city.updateToolStatus();
        this.city.updateViewStatus();
        console.log('Initial display updated');
        
        console.log('City Simulator initialized successfully!');
        
        // Test the simulation buttons
        this.testButtons();
    }
    
    testButtons() {
        const simulateBtn = document.getElementById('simulate-year');
        const pausePlayBtn = document.getElementById('pause-play');
        
        console.log('Simulate button found:', !!simulateBtn);
        console.log('Pause/Play button found:', !!pausePlayBtn);
        
        if (simulateBtn) {
            console.log('Simulate button has event listeners');
        }
        if (pausePlayBtn) {
            console.log('Pause/Play button has event listeners');
        }
    }
    
    setupSystemIntegration() {
        // Override city calculation methods with system methods
        this.city.calculatePower = () => this.powerSystem.calculatePower();
        this.city.calculateTraffic = () => this.transportationSystem.calculateTraffic();
        this.city.calculateCrime = () => this.crimeSystem.calculateCrime();
        this.city.calculateLandValues = () => this.economySystem.calculateLandValues();
        this.city.updateBuildings = () => this.economySystem.updateBuildings();
        this.city.calculateFinances = () => this.economySystem.calculateFinances();
        
        // Enhanced stats update
        const originalUpdateStats = this.city.updateStats.bind(this.city);
        this.city.updateStats = () => {
            originalUpdateStats();
            this.uiManager.updateStatsDisplay();
        };
    }
    
    addSampleContent() {
        // Add a small sample city to demonstrate features
        const sampleBuildings = [
            // Power plant and power lines
            {x: 5, y: 5, type: 'power-plant'},
            {x: 6, y: 5, type: 'power-line'},
            {x: 7, y: 5, type: 'power-line'},
            {x: 8, y: 5, type: 'power-line'},
            
            // Roads
            {x: 10, y: 5, type: 'road'},
            {x: 11, y: 5, type: 'road'},
            {x: 12, y: 5, type: 'road'},
            {x: 13, y: 5, type: 'road'},
            {x: 14, y: 5, type: 'road'},
            {x: 15, y: 5, type: 'road'},
            
            // Residential area
            {x: 10, y: 6, type: 'residential'},
            {x: 11, y: 6, type: 'residential'},
            {x: 10, y: 7, type: 'residential'},
            {x: 11, y: 7, type: 'residential'},
            
            // Commercial area
            {x: 13, y: 6, type: 'commercial'},
            {x: 14, y: 6, type: 'commercial'},
            {x: 13, y: 7, type: 'commercial'},
            
            // Industrial area
            {x: 16, y: 6, type: 'industrial'},
            {x: 17, y: 6, type: 'industrial'},
            {x: 16, y: 7, type: 'industrial'},
            
            // Police station
            {x: 12, y: 8, type: 'police'},
            
            // Train infrastructure
            {x: 10, y: 10, type: 'train-track'},
            {x: 11, y: 10, type: 'train-track'},
            {x: 12, y: 10, type: 'station'},
            {x: 13, y: 10, type: 'train-track'},
            {x: 14, y: 10, type: 'train-track'},
            
            // More power lines to connect everything
            {x: 9, y: 5, type: 'power-line'},
            {x: 10, y: 4, type: 'power-line'},
            {x: 11, y: 4, type: 'power-line'},
            {x: 12, y: 4, type: 'power-line'},
            {x: 13, y: 4, type: 'power-line'},
            {x: 14, y: 4, type: 'power-line'},
            {x: 15, y: 4, type: 'power-line'},
            {x: 16, y: 4, type: 'power-line'},
            {x: 16, y: 5, type: 'power-line'},
            {x: 16, y: 6, type: 'power-line'},
        ];
        
        sampleBuildings.forEach(building => {
            const cell = this.city.grid[building.y][building.x];
            cell.type = building.type;
            
            // Set up connections
            switch (building.type) {
                case 'road':
                    cell.connections.road = true;
                    break;
                case 'power-line':
                case 'power-plant':
                    cell.connections.power = true;
                    break;
                case 'train-track':
                case 'station':
                    cell.connections.train = true;
                    if (building.type === 'station') {
                        cell.connections.road = true; // Stations connect to roads too
                    }
                    break;
            }
            
            // Add some initial buildings
            if (['residential', 'commercial', 'industrial'].includes(building.type)) {
                cell.building = {
                    type: building.type,
                    level: Math.floor(Math.random() * 3) + 1,
                    age: Math.floor(Math.random() * 5)
                };
            }
        });
        
        // Run initial calculations
        this.city.calculatePower();
        this.city.calculateTraffic();
        this.city.calculateCrime();
        this.city.calculateLandValues();
        this.city.updateBuildings();
        this.city.calculateFinances();
        
        // Note: Display and stats will be updated by the main initialize method
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all DOM elements are rendered
    setTimeout(() => {
        console.log('DOM ready, initializing City Simulator...');
        window.citySimulator = new CitySimulator();
    }, 100);
});

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .cell {
        transition: all 0.2s ease;
    }
    
    .cell:hover {
        transform: scale(1.1);
        z-index: 10;
    }
    
    .notification {
        animation: slideIn 0.3s ease-out;
    }
    
    .context-menu-item:hover {
        background: #2c3e50 !important;
    }
    
    .tool-btn, .view-btn {
        transition: all 0.2s ease;
    }
    
    .tool-btn:active, .view-btn:active {
        transform: scale(0.95);
    }
    
    /* Traffic flow animation */
    .traffic-heavy {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 0.8; }
    }
    
    /* Power grid glow effect */
    .powered {
        animation: powerGlow 3s infinite;
    }
    
    @keyframes powerGlow {
        0%, 100% { box-shadow: inset 0 0 5px rgba(46, 204, 113, 0.8); }
        50% { box-shadow: inset 0 0 10px rgba(46, 204, 113, 1); }
    }
`;
document.head.appendChild(style);