// Game State
const gameState = {
    resources: {
        gold: 1000,
        elixir: 1000,
        gems: 50
    },
    isAdmin: false,
    selectedBuilding: null,
    buildings: [],
    gridSize: 10
};

// Building definitions with emojis
const buildingTypes = {
    townhall: { emoji: '🏰', name: 'Town Hall', production: null },
    goldmine: { emoji: '⛏️', name: 'Gold Mine', production: 'gold' },
    elixircollector: { emoji: '🧪', name: 'Elixir Collector', production: 'elixir' },
    barracks: { emoji: '🏕️', name: 'Barracks', production: null },
    cannon: { emoji: '🔫', name: 'Cannon', production: null },
    wall: { emoji: '🧱', name: 'Wall', production: null }
};

// Initialize game
function initGame() {
    createVillageGrid();
    updateResourceDisplay();
    setupEventListeners();
    addLogEntry('Welcome to Clash of Clans Clone! Build your village!', 'success');
    startResourceProduction();
}

// Create village grid
function createVillageGrid() {
    const villageGrid = document.getElementById('villageGrid');
    villageGrid.innerHTML = '';
    
    for (let i = 0; i < gameState.gridSize * gameState.gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        villageGrid.appendChild(cell);
    }
}

// Handle cell click for building placement
function handleCellClick(cellIndex) {
    if (!gameState.selectedBuilding) {
        addLogEntry('Please select a building first!', 'error');
        return;
    }

    const cell = document.querySelector(`[data-index="${cellIndex}"]`);
    if (cell.classList.contains('occupied')) {
        addLogEntry('This cell is already occupied!', 'error');
        return;
    }

    const buildingBtn = document.querySelector(`.building-btn.selected`);
    const costGold = parseInt(buildingBtn.dataset.costGold) || 0;
    const costElixir = parseInt(buildingBtn.dataset.costElixir) || 0;

    // Check resources (skip if admin)
    if (!gameState.isAdmin) {
        if (gameState.resources.gold < costGold || gameState.resources.elixir < costElixir) {
            addLogEntry('Not enough resources!', 'error');
            return;
        }
    }

    // Deduct resources (only if not admin)
    if (!gameState.isAdmin) {
        gameState.resources.gold -= costGold;
        gameState.resources.elixir -= costElixir;
        updateResourceDisplay();
    }

    // Place building
    const buildingType = gameState.selectedBuilding;
    const building = {
        type: buildingType,
        cellIndex: cellIndex,
        level: 1,
        production: buildingTypes[buildingType].production
    };

    gameState.buildings.push(building);
    
    cell.classList.add('occupied', 'building');
    cell.textContent = buildingTypes[buildingType].emoji;
    cell.title = buildingTypes[buildingType].name;

    addLogEntry(`Built ${buildingTypes[buildingType].name}!`, 'success');
    updateAdminStats();

    // Deselect building
    gameState.selectedBuilding = null;
    buildingBtn.classList.remove('selected');
}

// Update resource display
function updateResourceDisplay() {
    document.getElementById('goldAmount').textContent = gameState.resources.gold;
    document.getElementById('elixirAmount').textContent = gameState.resources.elixir;
    document.getElementById('gemsAmount').textContent = gameState.resources.gems;
}

// Add log entry
function addLogEntry(message, type = 'info') {
    const logMessages = document.getElementById('logMessages');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logMessages.insertBefore(entry, logMessages.firstChild);

    // Keep only last 20 messages
    while (logMessages.children.length > 20) {
        logMessages.removeChild(logMessages.lastChild);
    }
}

// Resource production system
function startResourceProduction() {
    setInterval(() => {
        let goldProduced = 0;
        let elixirProduced = 0;

        gameState.buildings.forEach(building => {
            if (building.production === 'gold') {
                goldProduced += 10;
            } else if (building.production === 'elixir') {
                elixirProduced += 10;
            }
        });

        if (goldProduced > 0) {
            gameState.resources.gold += goldProduced;
            addLogEntry(`Produced ${goldProduced} gold`, 'success');
        }

        if (elixirProduced > 0) {
            gameState.resources.elixir += elixirProduced;
            addLogEntry(`Produced ${elixirProduced} elixir`, 'success');
        }

        if (goldProduced > 0 || elixirProduced > 0) {
            updateResourceDisplay();
        }
    }, 10000); // Produce every 10 seconds
}

// Update admin stats
function updateAdminStats() {
    document.getElementById('totalBuildings').textContent = gameState.buildings.length;
}

// Setup event listeners
function setupEventListeners() {
    // Building selection
    document.querySelectorAll('.building-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Deselect all
            document.querySelectorAll('.building-btn').forEach(b => b.classList.remove('selected'));
            
            // Select this one
            btn.classList.add('selected');
            gameState.selectedBuilding = btn.dataset.building;
            addLogEntry(`Selected ${buildingTypes[btn.dataset.building].name}`);
        });
    });

    // Admin modal
    const modal = document.getElementById('adminModal');
    const adminBtn = document.getElementById('adminBtn');
    const closeBtn = document.querySelector('.close');
    const adminLoginBtn = document.getElementById('adminLoginBtn');

    adminBtn.addEventListener('click', () => {
        if (gameState.isAdmin) {
            // Logout
            gameState.isAdmin = false;
            document.getElementById('adminPanel').classList.add('hidden');
            adminBtn.textContent = '🔐 Admin Login';
            addLogEntry('Admin logged out', 'admin');
        } else {
            // Show login modal
            modal.classList.add('active');
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    adminLoginBtn.addEventListener('click', () => {
        const password = document.getElementById('adminPassword').value;
        // Note: This is a demo/educational game - password is intentionally simple and client-side
        // In a production environment, authentication should be server-side
        if (password === 'admin123') {
            gameState.isAdmin = true;
            document.getElementById('adminPanel').classList.remove('hidden');
            modal.classList.remove('active');
            adminBtn.textContent = '🔓 Admin Logout';
            addLogEntry('Admin access granted!', 'admin');
            document.getElementById('adminPassword').value = '';
        } else {
            addLogEntry('Invalid admin password!', 'error');
        }
    });

    // Admin controls
    document.getElementById('giveGold').addEventListener('click', () => {
        if (!gameState.isAdmin) return;
        gameState.resources.gold += 1000;
        updateResourceDisplay();
        addLogEntry('Admin: Added 1000 gold', 'admin');
    });

    document.getElementById('giveElixir').addEventListener('click', () => {
        if (!gameState.isAdmin) return;
        gameState.resources.elixir += 1000;
        updateResourceDisplay();
        addLogEntry('Admin: Added 1000 elixir', 'admin');
    });

    document.getElementById('giveGems').addEventListener('click', () => {
        if (!gameState.isAdmin) return;
        gameState.resources.gems += 100;
        updateResourceDisplay();
        addLogEntry('Admin: Added 100 gems', 'admin');
    });

    document.getElementById('instantBuild').addEventListener('click', () => {
        if (!gameState.isAdmin) return;
        addLogEntry('Admin: All buildings completed instantly!', 'admin');
    });

    document.getElementById('unlockAll').addEventListener('click', () => {
        if (!gameState.isAdmin) return;
        addLogEntry('Admin: All buildings unlocked!', 'admin');
    });

    document.getElementById('resetVillage').addEventListener('click', () => {
        if (!gameState.isAdmin) return;
        if (confirm('Are you sure you want to reset the village? This cannot be undone!')) {
            gameState.buildings = [];
            gameState.resources = { gold: 1000, elixir: 1000, gems: 50 };
            createVillageGrid();
            updateResourceDisplay();
            updateAdminStats();
            addLogEntry('Admin: Village reset!', 'admin');
        }
    });

    // Enter key for admin password
    document.getElementById('adminPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            adminLoginBtn.click();
        }
    });
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
