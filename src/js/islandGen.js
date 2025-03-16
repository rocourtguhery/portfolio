    let winW = window.innerWidth;
    let winH = window.innerHeight;
    let cellSize = 64;
    const allBeaches = [];
    const allLand = [];

    const prefixes = [
        "Aru", "Kelo", "Nimu", "Bena", "Moza", "Fika", "Soro", "Vana", "Luma", "Duni", 
        "Telo", "Yari", "Kumi", "Jara", "Zeni", "Rulo", "Fano", "Meka", "Rona", "Sifa", 
        "Koma", "Loza", "Gran", "Garo", "Heka", "Wena", "Zama", "Kiva", "Nari", "Tula", "Pana", 
        "Lavo", "Galo", "Lomi", "Loma", "Dye", "Nuru", "Tami", "Poro", "Fira", "Rima", "Jumi", "Kori",
        "Anse", "Ti", "Grande", "Kou", "Belle", "Ka", "Boukan", "Fond", "Morne", "La", "Rivière",
        "Thala", "Skjal", "Arewi", "Bou", "Boul", "Fant", "Tahu", "Calyp", "Noku", "Mani", "Itha", "Maka", "Orich", 
        "Ala", "Zemy", "Taino", "Ika", "Kochi", "Trou", "Ome", "Kupe", "Koupe", "Quetza", "Doha", "Lysan", 
        "Tiaré", "Hawa", "Pele", "Pli", "Ana", "Zan", "Akro", "Lofo", "Kao", "Pala", "Maré", "men", 
        "Tsio", "Vahi", "Mino", "Mòn", "Soma", "Sibi", "Hesper", "Ata", "Vina", "Ouka", "Cam", "Nolë", 
        "Akou", "Sola", "Naï", "Tela", "Moe", "Tou", "Uku", "Pik", "Paleo", "Palo", "Pale", "Toupi", "Toupa", "Kahi", "Aki", 
        "Koro", "Mou", "Lumi", "San", "Obo", "Pela", "Hibis", "Aïto", "Trois", "Tama", "Opa", 
        "Ran", "Tek", "Ama", "Koa", "Kalo", "Ome", "Faka", "Rano", "Motu", "Sari", 
        "Hau", "Koro", "Lar", "Pai", "Iso", "Kayi", "Vaka", "Rah", "Roho", "Ana", "Faia", 
        "Taï", "Tapu", "Saphir", "Aki", "Tapu", "Oro", "Teho", "Tiki", "Hau", "Ika", 
        "Oa", "Ture", "Toa", "Fahi","Na", "Lo", "Ka", "Gui", "Man", "Pi", "Zen", "Zan", "Fa", "Wa", "Tè", "Dlo", "Chou", "Bon",
        "Lac", "Mont", "Baie", "Cap", "Petit", "Fort", "Bassin", "Terre"
    ]; //, "Île", "Îlet" 
    
    const suffixes = [
        "za", "ti", "mo", "nu", "voulan", "kole", "sa", "ri", "ma", "pi",
        "ve", "ro", "ka","kan", "tu", "na", "ki", "la", "ni", "ri", 
        "jo", "to", "za", "da", "mi", "se", "vi", "ru", "so", "po", "fa", "lu", "za",
        "di","-louk", "rel", "ve", "oua", "tcha", "bwa", "pik", "pil", "kare", "dou", "kou",
        "na", "a", "ora", "va", "ya", "ra", "toa", "moa", "kea", "aka", "lo",
        "roa", "mana", "kora", "grif", "maka", "mara", "tina", "vana", "pia", "kopa", "waka", "roko",
        "hiko", "moto", "riki", "tahi", "noa", "kara", "bon", "nea", "lea", "pura", "taua", "ranga", "waka", "nara",
        "lou", "fè", "zil", "sa", "ban", "ran", "yan", "ris", "vais", "lin", "rin", "tan", "fou", "man"
    ];
    
    const connectors = [
        "ra", "mo", "lo","kan", "ti", "ne", "mi", "pa", "si", "ru", 
        "ro", "li", "ni", "vo", "zo", "a", "sa", "fi", "la", "to", "ma",
        "na", "ka", "ta", "tou", "nou", "bon", "mou", "va", "noa", "lu",
        "hi", "po", "te","kou", "ko", "bwa", "wa", "ya", "hu",
    ];
    const syllables = [
        "Li", "Ni", "Vo", "Zo", "A", "Sa", "Fi", "La", "To", "Ma", "Ro", "Si",
        "Ya", "Bwa", "Ko", "Te","Po", "Hi", "Noa", "Lu", "Va", "Mou", "Bon", "Ta", "Ru", "Pa", "Mi", "Ne", "Kan", "Mo", "Ra",
        "Na", "Lo", "Ka", "Gui", "Zan", "Fa", "Wa", "Tè", "Dlo", "Chou", "Bon", 
        "Lò", "Vè", "Ti", "Rou", "Di", "Mè", "Tou", "Nou", "Man", "Pou", "Bou", "Kou", "Lam"
    ];

    const haitianNames = [
        "Cibao", "Citadelle", "Dessalines", "Vertières", "Labadie", "Gonaïves", 
        "Jacmel", "Cap-Haïtien", "Cayes", "Gros-Morne", "Ouanaminthe", "Hinche", 
        "Port-Salut", "Pétionville"
    ];

    function generateIslands(gridSize, islandCount) {
        const grid = Array.from({ length: gridSize.x }, () => Array(gridSize.y).fill(null));
        const islands = [];
        for (let i = 0; i < islandCount; i++) {
            const size = Math.floor(Math.random() * 6) + 1; // Taille aléatoire entre 1 et 7
            const island = new Island(getRandomName(), size);
            let centerX, centerY;
            do {
                centerX = Math.floor(Math.random() * gridSize.x);
                centerY = Math.floor(Math.random() * gridSize.y);
            } while (islands.some(island =>
                island.landPos.some(pos => Math.abs(pos.x - centerX) <= 4 && Math.abs(pos.y - centerY) <= 4)
            ));
            const islandID = `${centerX}-${centerY}`;
            island.islandID = islandID;
            island.generateContiguousLand(centerX, centerY, gridSize, islandID);
            island.generateBeaches(gridSize, islandID);
            const cell = [...island.landPos, ...island.beaches];
            if (cell.length > 0) {
                cell.forEach(({ x, y ,type}) => {
                    island.distributeResources(x, y, type, resourceRarity, islandID);
                });
                islands.push(island);
                island.landPos.forEach(({ x, y }) => (grid[x][y] = 'land'));
                island.beaches.forEach(({ x, y }) => (grid[x][y] = 'beach'));
            }
        }
        return { grid, islands };
    }
    
    function generateTornKingdomMap(tkdIslands){
        const gridSize = {x: 50, y:50};
        const islands = [];
        const grid = Array.from({ length: gridSize.x }, () => Array(gridSize.y).fill(null));
        
        tkdIslands.forEach( tkdIsland => {
            let fX, fY, islandID;
            
            const island = new Island(getRandomName(), tkdIsland.length);
            
            tkdIsland.forEach((land, index) => {
                if (index === 0) {
                    fX = tkdIsland[0].x;
                    fY = tkdIsland[0].y;
                }
                islandID = `${fX}-${fY}`;
                island.islandID = islandID;
                island.addLand(land.x, land.y, getRandomType("land"), islandID);
            })
            island.generateBeaches({ x:50, y:50 }, islandID);
            const cell = [...island.landPos, ...island.beaches];
            if (cell.length > 0) {
                cell.forEach(({ x, y ,type}) => {
                    island.distributeResources(x, y, type, resourceRarity, islandID);
                });
                islands.push(island);
                island.landPos.forEach(({ x, y }) => (grid[x][y] = 'land'));
                island.beaches.forEach(({ x, y }) => (grid[x][y] = 'beach'));
            }

        });

        return { grid, islands };
    }
