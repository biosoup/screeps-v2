//manager spawn

let tableImportance = {
    harvester: {
        name: "harvester",
        prio: 10,
        type: "work",
        noRoads: true
    },
    miniharvester: {
        name: "miniharvester",
        prio: 1,
        type: "work",
        noRoads: true
    },
    miner: {
        name: "miner",
        prio: 11,
        type: "mine",
        noRoads: false
    },
    builder: {
        name: "builder",
        prio: 17,
        type: "work",
        noRoads: true
    },
    repairer: {
        name: "repairer",
        prio: 170,
        type: "work",
        noRoads: true
    },
    wallRepairer: {
        name: "wallRepairer",
        prio: 130,
        type: "work",
        noRoads: false
    },
    mineralHarvester: {
        name: "mineralHarvester",
        prio: 200,
        type: "work",
        noRoads: false
    },
    upgrader: {
        name: "upgrader",
        prio: 80,
        type: "work",
        noRoads: false
    },
    runner: {
        name: "runner",
        prio: 15,
        type: "carry",
        noRoads: false
    },
    scientist: {
        name: "scientist",
        prio: 200,
        type: "carry",
        noRoads: false
    },
    longDistanceHarvester: {
        name: "longDistanceHarvester",
        prio: 100,
        type: "work",
        noRoads: true
    },
    longDistanceMiner: {
        name: "longDistanceMiner",
        prio: 120,
        type: "mine",
        noRoads: false
    },
    claimer: {
        name: "claimer",
        prio: 150,
        type: "claim",
        noRoads: true
    },
    bigClaimer: {
        name: "bigClaimer",
        prio: 160,
        type: "claim",
        noRoads: true
    },
    guard: {
        name: "guard",
        prio: 14,
        type: "rangeAttack",
        noRoads: true
    },
    demolisher: {
        name: "demolisher",
        prio: 230,
        type: "work",
        noRoads: true
    },
    longDistanceLorry: {
        name: "longDistanceLorry",
        prio: 140,
        type: "carry",
        noRoads: false
    },
    longDistanceBuilder: {
        name: "longDistanceBuilder",
        prio: 130,
        type: "work",
        noRoads: true
    },
    attacker: {
        name: "attacker",
        prio: 80,
        type: "attack",
        noRoads: true
    },
    archer: {
        name: "archer",
        prio: 80,
        type: "rangeAttack",
        noRoads: true
    },
    healer: {
        name: "healer",
        prio: 90,
        type: "heal",
        noRoads: true
    },
    einarr: {
        name: "einarr",
        prio: 50,
        type: "einarr",
        noRoads: true
    },
    transporter: {
        name: "transporter",
        prio: 1000,
        type: "carry",
        noRoads: false
    },
    herocreep: {
        name: "herocreep",
        prio: 2000,
        type: "carry",
        noRoads: false
    },
    scout: {
        name: "scout",
        prio: 20,
        type: "rangeAttack",
        noRoads: true
    }
};

class RoomSpawn {
    /**
     * Init the class
     * @return {tasks}
     */
    static init() {
        if (RoomSpawn._init !== true) {
            RoomSpawn._init = true;
        }
    }
    /**
     * Creates an instance.
     *
     * @constructor
     * @this {tasks}
     */
    constructor(colony, roomName = colony) {
        RoomSpawn.init();
        this.name = roomName
        this.colony = colony
    }

    get name() {
        return this._name;
    }
    set name(v) {
        this._name = v;
    }

    get spawnRoom() {
        return Game.rooms[this._name];
    }

    get colony() {
        return this._colony;
    }
    set colony(v) {
        this._colony = v;
    }

    run() {
        let globalSpawningStatus = 0;
        let cpuStart = Game.cpu.getUsed();
        let spawnRoom = Game.rooms[this.name]

        if (spawnRoom.memory.roomArray != undefined) {
            for (var s in spawnRoom.memory.roomArray.spawns) {
                var testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    globalSpawningStatus++;
                }
                //if multiple spawns are in room, and one of them is spawning, wait for next round
            }
        }

        if (globalSpawningStatus == 0) {
            //All spawns busy, inactive or player lost control of the room
            return -1;
        }

        //get lists of [where, what] need to be spawned
        let homeRoomNeeds = this.homeRoom()
        let remoteRoomNeeds = this.remoteRooms()

        //prioritize them
        //homeRoomNeeds = this.prioritize(homeRoomNeeds)
        //remoteRoomNeeds = this.prioritize(remoteRoomNeeds)
        //console.log(JSON.stringify(homeRoomNeeds), " <br>", JSON.stringify(remoteRoomNeeds))

        if (!this.hostilePresence()) {
            // peacetime, add remote rooms
            homeRoomNeeds.push(...remoteRoomNeeds)
        }

        let spawnEntry = 0;
        let name = undefined;
        let body = undefined;
        let spawnList = homeRoomNeeds

        if (spawnList != null && spawnList.length > 0) {
            let spawnListVisual = []
            for (let i; i < spawnList.length; i++) {
                spawnListVisual.push(spawnList[i][1])
            }
            Game.rooms[this.name].visual.text("Creeps wanted: " + JSON.stringify(spawnList),
                2, 44, {
                    size: '0.7',
                    align: 'left',
                    opacity: 0.5,
                    'backgroundColor': '#040404',
                    color: 'white'
                });

            for (var s in spawnRoom.memory.roomArray.spawns) {
                //iterate over spawns
                let testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
                //check if spawn can spawn
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {

                    //console.log(" ** " + spawnRoom.name + " ** " + JSON.stringify(spawnList))

                    // Spawn!
                    if (spawnList[spawnEntry][1] == "miner") {
                        // check if all sources have miners
                        var sources = spawnRoom.memory.roomArray.sources
                        // iterate over all sources
                        for (var source of sources) {
                            source = Game.getObjectById(source);
                            // if the source has no miner
                            if (!_.some(Game.creeps, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {

                                // check whether or not the source has a container
                                var containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                                    filter: s => s.structureType == STRUCTURE_CONTAINER
                                });

                                // if there is a container next to the source
                                if (containers.length > 0 && spawnRoom.energyAvailable >= 300) {
                                    // spawn a miner
                                    body = this.createBody(spawnList[spawnEntry])
                                    if (body) name = testSpawn.newCreep(spawnList[spawnEntry][1], spawnRoom.name, spawnList[spawnEntry][0], source.id, body);
                                } else {
                                    //no containers
                                    //TODO: move somewhere else, to room?
                                    //find construction sites for contianer
                                    var miningSources = spawnRoom.find(FIND_SOURCES)
                                    for (let s in miningSources) {
                                        var cBuildSite = miningSources[s].pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                                            filter: f => f.structureType == STRUCTURE_CONTAINER
                                        })
                                        if (!_.isEmpty(cBuildSite)) continue

                                        var cCdSite = miningSources[s].pos.findInRange(FIND_STRUCTURES, 1, {
                                            filter: f => f.structureType == STRUCTURE_CONTAINER
                                        })
                                        if (!_.isEmpty(cCdSite)) continue

                                        //no construction site
                                        let goal = {}
                                        goal.pos = miningSources[s].pos
                                        goal.range = 1

                                        let ret = PathFinder.search(
                                            testSpawn.pos, goal, {
                                                roomCallback: function(roomName) {
                                                    let room = Game.rooms[roomName];
                                                    if (!room) return;
                                                    let costs = new PathFinder.CostMatrix;
                                                    room.find(FIND_STRUCTURES).forEach(function(struct) {
                                                        if (struct.structureType === STRUCTURE_ROAD) {
                                                            // Favor roads over plain tiles
                                                            costs.set(struct.pos.x, struct.pos.y, 1);
                                                        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                                            (struct.structureType !== STRUCTURE_RAMPART ||
                                                                !struct.my)) {
                                                            // Can't walk through non-walkable buildings
                                                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                                                        }
                                                    });
                                                    return costs;
                                                },
                                                maxOps: 5000
                                            }
                                        );
                                        let pos = ret.path[ret.path.length - 1];
                                        console.log(JSON.stringify(pos) + " " + ret.incomplete + " " + ret.ops)
                                        if (ret.incomplete == false) {
                                            let containerThere = pos.lookFor(LOOK_STRUCTURES)
                                            if (!_.isEmpty(containerThere)) continue
                                            let csThere = pos.lookFor(LOOK_CONSTRUCTION_SITES)
                                            if (!_.isEmpty(csThere)) continue
                                            pos.createConstructionSite(STRUCTURE_CONTAINER)
                                        } else {
                                            console.log(JSON.stringify(goal))
                                            console.log(spawnRoom.name + " " + ret.incomplete + " " + ret.path.length + " " + pos.x + " " + pos.y + " " + pos.roomName)
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        body = this.createBody(spawnList[spawnEntry])
                        if (body) name = testSpawn.newCreep(spawnList[spawnEntry][1], spawnRoom.name, spawnList[spawnEntry][0], null, body);
                    }
                    testSpawn.memory.lastSpawnAttempt = spawnList[spawnEntry];
                    if (!(name < 0) && name != undefined) {
                        testSpawn.memory.lastSpawn = spawnList[spawnEntry];
                        if (LOG_SPAWN == true) {
                            console.log("<font color=#00ff22 type='highlight'>NEW! " + testSpawn.name + " is spawning creep: " + name + " in room " + spawnRoom.name + ". (CPU used: " + (Game.cpu.getUsed() - cpuStart).toFixed(2) + ") on tick " + Game.time + " Creeps left in qeue: " + spawnList.length + "</font>");
                        }
                        spawnEntry++;
                    }
                }
                if (spawnEntry >= spawnList.length) {
                    break;
                }
            }
        }
    }

    createBody(spawnItem, energyLimit = undefined) {
        //spawnItem = ["E5S18","upgrader",80,"work",false]
        //spawnItem = [targeRoom,role,prio,type,noRoad]

        let energyAvaliable = Game.rooms[this.name].energyAvailable

        let allMyCreeps = _.filter(Game.creeps, (c) => c.memory.home == this.name && (c.ticksToLive > (c.body.length * 3) - 3 || c.spawning == true));
        if (spawnItem[1] != "harvester") {
            if (energyAvaliable < Game.rooms[this.name].energyCapacityAvailable / 2 && allMyCreeps.length > 3) return false //not gonna spawn too small body, if there are already some creeps around
        }
        var body = [];


        //ROAD WORKERS
        if (spawnItem[3] == "work" && spawnItem[4] == false) {
            // equal number of work:carry:move, but max out work
            let energyCost = 200
            let sizelimit = 50
            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor(sizelimit / 3)); //max size is 50 parts
            for (let i = 0; i < numberOfWorkParts; i++) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
            }
        }

        //OFFROAD WORKERS
        if (spawnItem[3] == "work" && spawnItem[4] == true) {
            // twice number of move to carry:work
            let energyCost = 250
            let sizelimit = 50
            if (spawnItem[1] == "longDistanceBuilder") sizelimit = 30
            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor(sizelimit / 4)); //max size is 50 parts
            for (let i = 0; i < numberOfWorkParts; i++) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                body.push(MOVE);
            }
        }

        //ROAD CARRY
        if (spawnItem[3] == "carry" && spawnItem[4] == false) {
            /**
             * TODO:
             * better lorry spawning, now spawning way too few - downscale based on RCL
             * limit size until lvl rcl 7
             */
            // create a body with twice as many CARRY as MOVE parts
            let energyCost = 150
            let rcl = Game.rooms[this.name].controller.level
            let sizelimit = 50
            if (rcl < 7) sizelimit = 30
            if (rcl == 7) sizelimit = 13*3

            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor(sizelimit / 3)); //max size is 50 parts
            for (let i = 0; i < numberOfWorkParts; i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
        }

        //OFFROAD CARRY
        if (spawnItem[3] == "carry" && spawnItem[4] == true) {
            // create a body with twice as many CARRY as MOVE parts
            let energyCost = 100
            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor(50 / 2)); //max size is 50 parts
            for (let i = 0; i < numberOfWorkParts; i++) {
                body.push(CARRY);
                body.push(MOVE);
            }
        }

        // MINER
        if (spawnItem[3] == "mine" && spawnItem[4] == false) {
            // create a body with 7 work, 2 CARRY and move parts
            let energyCost = 150
            let numberOfWorkParts = Math.floor((energyAvaliable - 100) / energyCost);
            if (numberOfWorkParts > 7) numberOfWorkParts = 7 //max size is 50 parts
            for (let i = 0; i < numberOfWorkParts; i++) {
                body.push(WORK);
                body.push(MOVE);
            }
            body.push(CARRY);
            body.push(MOVE);
        }

        // CLAIMER
        if (spawnItem[3] == "claim" && spawnItem[4] == true) {
            // create a body with 7 work, 2 CARRY and twice amount of move parts
            let energyCost = 650
            if (energyLimit) energyAvaliable = energyLimit //do not spawn bigger claimer than needed
            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor(50 / 2)); //max size is 50 parts
            for (let i = 0; i < numberOfWorkParts; i++) {
                body.push(CLAIM);
                body.push(MOVE);
            }
        }

        //FIXME: GUARD EINARR
        if (spawnItem[3] == "einarr" && spawnItem[4] == true) {
            // create a body with twice as many attack parts to heal parts, and adequate move parts
            let energyCost = 620
            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor((50 - 2) / 6)); //max size is 50 parts
            body.push(TOUGH); //50
            body.push(MOVE); //10
            for (let i = 0; i < (numberOfWorkParts); i++) {
                let parts = numberOfWorkParts * 6 - 2
                for (let i = 0; i < (parts / 2); i++) {
                    body.push(MOVE); //50
                    parts--
                }
                for (let i = 0; i < Math.ceil(parts / 3 * 2); i++) {
                    body.push(ATTACK); //80
                    parts--
                }
                for (let i = 0; i < Math.floor(parts / 3 * 1); i++) {
                    body.push(HEAL); //250
                    parts--
                }
            }
            console.log("guard: " + numberOfWorkParts + " " + energyAvaliable)
        }

        // ATTACK
        if (spawnItem[3] == "attack" && spawnItem[4] == true) {
            // create a body with twice as many attack parts to heal parts, and adequate move parts
            let energyCost = 130
            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor(50 / 2)); //max size is 50 parts
            for (let i = 0; i < numberOfWorkParts / 2; i++) {
                body.push(MOVE); //50
            }
            for (let i = 0; i < numberOfWorkParts / 2; i++) {
                body.push(ATTACK); //80
            }
        }

        // ARCHER
        if (spawnItem[3] == "rangeAttack" && spawnItem[4] == true) {
            // create a body with twice as many attack parts to heal parts, and adequate move parts
            let energyCost = 200
            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor(50 / 2)); //max size is 50 parts
            for (let i = 0; i < numberOfWorkParts / 2; i++) {
                body.push(MOVE); //50
            }
            for (let i = 0; i < numberOfWorkParts / 2; i++) {
                body.push(RANGED_ATTACK); //150
            }
        }

        // HEALER
        if (spawnItem[3] == "heal" && spawnItem[4] == true) {
            // create a body with twice as many attack parts to heal parts, and adequate move parts
            let energyCost = 300
            let numberOfWorkParts = Math.floor(energyAvaliable / energyCost);
            numberOfWorkParts = Math.min(numberOfWorkParts, Math.floor(50 / 2)); //max size is 50 parts            
            for (let i = 0; i < numberOfWorkParts / 2; i++) {
                body.push(MOVE); //50
            }
            for (let i = 0; i < numberOfWorkParts / 2; i++) {
                body.push(HEAL); //250
            }
        }

        return body
    }

    homeRoom() {
        //FIXME: check existing creep levels!!!!
        let homeRoomNeeds = []
        let spawnRoom = this.spawnRoom
        let numberOfSources = spawnRoom.find(FIND_SOURCES).length

        let rcl = spawnRoom.controller.level;
        var numberOfTowers = spawnRoom.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy > 0
        });
        let allMyCreeps = _.filter(Game.creeps, (c) => c.memory.home == spawnRoom.name && (c.ticksToLive > (c.body.length * 3) - 3 || c.spawning == true));


        // Builder
        var constructionSites = spawnRoom.find(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length > 0) {
            //There are construction sites
            var progress = 0;
            var totalProgress = 0;
            for (var w in constructionSites) {
                progress += constructionSites[w].progress;
                totalProgress += constructionSites[w].progressTotal;
            }
            let buildersNeeded = Math.ceil((totalProgress - progress) / 10000)
            if (buildersNeeded > Math.ceil(numberOfSources * 1.5)) {
                buildersNeeded = Math.ceil(numberOfSources * 1.5);
            }
            for (let i = 0; i < buildersNeeded - _.sum(allMyCreeps, (c) => c.memory.role == 'builder' && c.memory.home == this.name); i++) {
                homeRoomNeeds.push([this.name, "builder"]);
            }
        } else if ((rcl <= 3 || numberOfTowers.length == 0) &&
            _.sum(allMyCreeps, (c) => c.memory.role == 'builder' && c.memory.home == this.name) == 0) {
            //keep a builder until we have towers for repairs
            homeRoomNeeds.push([this.name, "builder"]);
        }


        // Upgrader
        let upgradersNeeded = 1;
        if (!_.isEmpty(spawnRoom.storage)) {
            var terminalExcessEnergy = 0
            if (!_.isEmpty(spawnRoom.terminal)) {
                if (spawnRoom.terminal.store[RESOURCE_ENERGY] > (spawnRoom.memory.resourceLimits.energy.minTerminal * 1.2)) {
                    terminalExcessEnergy = spawnRoom.terminal.store[RESOURCE_ENERGY] - (spawnRoom.memory.resourceLimits.energy.minTerminal * 1.2)
                }
            }
            if ((spawnRoom.storage.store[RESOURCE_ENERGY] + terminalExcessEnergy) > (MINSURPLUSENERGY * spawnRoom.controller.level) && spawnRoom.controller.level < 8) {
                //add more upgraders
                var mutiply = spawnRoom.storage.store[RESOURCE_ENERGY] / (MINSURPLUSENERGY * spawnRoom.controller.level)
                upgradersNeeded = _.ceil(2 * mutiply)
            }
            if (spawnRoom.storage.store[RESOURCE_ENERGY] < 10000) {
                upgradersNeeded = 0
            }
        }
        let upgradersAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'upgrader' && c.memory.home == this.name)
        for (let i = 0; i < upgradersNeeded - upgradersAlive; i++) {
            homeRoomNeeds.push([this.name, "upgrader"]);
        }

        //Wall Repairer – CONSTRUCTION
        let wallRepairerNeeded = 0
        var wallRepairTargets = spawnRoom.find(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < WALLMAX
        });
        if (wallRepairTargets.length > 0) {
            wallRepairerNeeded = Math.ceil(numberOfSources * 0.5);
        }
        let wallRepairerAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'wallRepairer' && c.memory.home == this.name)
        for (let i = 0; i < wallRepairerNeeded - wallRepairerAlive; i++) {
            homeRoomNeeds.push([this.name, "wallRepairer"]);
        }


        // runner
        if (spawnRoom.storage != undefined) {
            let wallRepairerAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'runner' && c.memory.home == this.name)
            if (wallRepairerAlive == 0) homeRoomNeeds.push([this.name, "runner"]);
        } else if (rcl <= 4 && spawnRoom.energyCapacity > 300) {
            let wallRepairerAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'runner' && c.memory.home == this.name)
            if (wallRepairerAlive == 0) homeRoomNeeds.push([this.name, "runner"]);
        }

        var numberOfMiners = _.sum(allMyCreeps, (c) => c.memory.role == 'miner' && c.memory.home == spawnRoom.name)
        var numberOfSA = _.sum(allMyCreeps, (c) => c.memory.role == 'runner' && c.memory.home == spawnRoom.name)
        var numberOfHarvesters = _.sum(allMyCreeps, (c) => c.memory.role == 'harvester' && c.memory.home == spawnRoom.name)

        // Miners
        for (let i = 0; i < numberOfSources - numberOfMiners; i++) {
            homeRoomNeeds.push([this.name, "miner"]);
        }
        // Harvester
        if (numberOfMiners + numberOfSA == 0 && numberOfHarvesters == 0) {
            homeRoomNeeds.push([this.name, "harvester"]);
        }

        if (!_.isEmpty(spawnRoom.storage) && rcl >= 4) {
            if (spawnRoom.storage.store.energy < 20000 && numberOfHarvesters == 0) {
                homeRoomNeeds.push([this.name, "harvester"]);
            }
        }

        if (_.isEmpty(spawnRoom.storage) && rcl < 4) {
            let harvestersNeeded = 0;
            if (numberOfMiners == 0) {
                let sources = spawnRoom.find(FIND_SOURCES);
                var freeSpots = 0
                for (var s of sources) {
                    //check how many free space each has
                    if (_.isEmpty(s)) continue
                    var freeSpaces = spawnRoom.lookForAtArea(LOOK_TERRAIN, s.pos.y - 1, s.pos.x - 1, s.pos.y + 1, s.pos.x + 1, true);
                    freeSpaces = freeSpaces.filter(f => f.terrain == "wall")
                    freeSpots = freeSpots + (9 - freeSpaces.length)
                }
                harvestersNeeded = freeSpots;
                if (harvestersNeeded > 10) {
                    harvestersNeeded = 10
                }
            } else {
                harvestersNeeded = numberOfSources * 2
            }
            let harvesterAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'harvester' && c.memory.home == this.name)
            for (let i = 0; i < harvestersNeeded - harvesterAlive; i++) {
                homeRoomNeeds.push([this.name, "harvester"]);
            }
        }
        /** Rest **/

        // Miner
        if (spawnRoom.storage == undefined || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]) == null || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]).mineralAmount == 0) {
            //no mineralHarvester needed
        } else {
            if (!_.isEmpty(spawnRoom.storage) && !_.isEmpty(spawnRoom.extractor)) {
                if (spawnRoom.storage.store.energy > 50000) {
                    let mineralHarvesterAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'mineralHarvester' && c.memory.home == this.name)
                    if (mineralHarvesterAlive == 0) homeRoomNeeds.push([this.name, "mineralHarvester"]);
                }
            }
        }

        // Transporter
        var spawnTransporter = false;
        if (spawnRoom.terminal != undefined) {
            if (spawnRoom.memory.terminalTransfer != undefined) {
                spawnTransporter = true;
            } else {
                var terminalDelta;
                if (spawnRoom.memory.terminalDelta == undefined || Game.time % 10 == 0 || spawnRoom.memory.terminalDelta != 0) {
                    terminalDelta = 0;
                    for (var res in spawnRoom.terminal.store) {
                        var delta = checkTerminalLimits(spawnRoom, res);
                        terminalDelta += Math.abs(delta.amount);
                        //console.log(terminalDelta)
                    }

                    for (var res in spawnRoom.storage.store) {
                        var delta = checkTerminalLimits(spawnRoom, res);
                        terminalDelta += Math.abs(delta.amount);
                        //console.log(terminalDelta)
                    }
                } else {
                    terminalDelta = spawnRoom.memory.terminalDelta;
                }
                if (terminalDelta > 0) {
                    spawnTransporter = true;
                }
            }
            if (spawnTransporter) {
                if (spawnRoom.storage.store.energy > 50000) {
                    let transporterAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'transporter' && c.memory.home == this.name)
                    if (transporterAlive == 0) homeRoomNeeds.push([this.name, "transporter"]);
                }
            }
        }

        // Scientist
        if (spawnRoom.memory.labOrder != undefined) {
            var info = spawnRoom.memory.labOrder.split(":");
            if (info[3] == "prepare" || info[3] == "done") {
                if (spawnRoom.storage.store.energy > 50000) {
                    let scientistAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'scientist' && c.memory.home == this.name)
                    if (scientistAlive == 0) homeRoomNeeds.push([this.name, "scientist"]);
                }
            }
        }

        //HEROcreep
        if (!_.isEmpty(spawnRoom.storage)) {
            var powerSpawn = spawnRoom.find(FIND_STRUCTURES, {
                filter: f => f.structureType == STRUCTURE_POWER_SPAWN
            })
            if (!_.isEmpty(powerSpawn) && spawnRoom.storage.store[RESOURCE_POWER] >= 100 && spawnRoom.storage.store[RESOURCE_ENERGY] >= MINSURPLUSENERGY) {
                let herocreepAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'herocreep' && c.memory.home == this.name)
                if (herocreepAlive == 0) homeRoomNeeds.push([this.name, "herocreep"]);
            }
            if (spawnRoom.storage.store[RESOURCE_GHODIUM] >= 1000 && spawnRoom.controller.safeModeAvailable <= 3) {
                let herocreepAlive = _.sum(allMyCreeps, (c) => c.memory.role == 'herocreep' && c.memory.home == this.name)
                if (herocreepAlive == 0) homeRoomNeeds.push([this.name, "herocreep"]);
            }
        }

        //keep at least one guard ready
        var avaliableGuards = _.filter(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.home == spawnRoom.name)
        var remoteMiners = _.filter(allMyCreeps, (c) => c.memory.role == 'longDistanceMiner' && c.memory.home == spawnRoom.name)
        if (avaliableGuards.length == 0 && remoteMiners.length > 0) {
            homeRoomNeeds.push([this.name, "guard"]);
        }

        // Adjustments in case of hostile presence
        /*  var hostileValues = spawnRoom.checkForHostiles(spawnRoom);
         if (!_.isEmpty(hostileValues)) {
             if (hostileValues.numHostiles > 0) {
                 //console.log("Being attacked by " + hostileValues.numHostiles + " with:" + hostileValues.maxAttackBodyParts + " attack parts")

                 //Get number of towers
                 if (numberOfTowers >= hostileValues.numHostiles) {
                     //towers shoudl be enough
                 } else {
                     if (hostileValues.numHostiles >= 4) {
                         //siege mode, just support walls!
                         minimumSpawnOf.guard = 0;
                         guard[spawnRoom.name] = 0;
                     } else {
                         if (spawnRoom.controller.safeMode == undefined) {
                             //only when safe mode is not active
                             minimumSpawnOf.guard = hostileValues.numHostiles;
                             guard[spawnRoom.name] = hostileValues.numHostiles;
                         }
                     }
                 }
                 if (spawnRoom.controller.safeMode == undefined) {
                     //limit everything else
                     minimumSpawnOf.upgrader = 0;
                     minimumSpawnOf.builder = 0;
                     minimumSpawnOf.longDistanceHarvester = 0;
                     minimumSpawnOf.mineralHarvester = 0;
                     minimumSpawnOf.runner = 0;
                     minimumSpawnOf.longDistanceMiner = 0;
                     minimumSpawnOf.longDistanceLorry = 0;
                     minimumSpawnOf.longDistanceBuilder = 0;
                     minimumSpawnOf.demolisher = 0;
                 }
                 minimumSpawnOf.wallRepairer *= 2;
             }
		 } */

        return this.prioritize(homeRoomNeeds)
    }

    hostilePresence() {
        //return true, if hostiles are in spawnroom
        return false
    }

    remoteRooms() {
        var allFlags = _.filter(Game.flags, (f) => _.last(_.words(f.name, /[^-]+/g)) == this.name)
        let allMyCreeps = _.filter(Game.creeps, (c) => c.memory.home == this.name && (c.ticksToLive > (c.body.length * 3) - 3 || c.spawning == true));
        let remoteRoomNeeds = []

        for (var flag of allFlags) {
            //what they need, how much they need
            let flagNeeds = []
            if (flag.color == COLOR_RED) {
                var existingCreeps = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    flagNeeds.push([flag.pos.roomName, "longDistanceHarvester"])
                }
            }

            if (flag.color == COLOR_PURPLE) {
                var existingCreeps = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceMiner' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    flagNeeds.push([flag.pos.roomName, "longDistanceMiner"])
                }

                //add lorries for miners
                let lorries = this.remoteRoomContainers(flag.pos.roomName)
                var existingCreepsLDL = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceLorry' && c.memory.home == this.name)
                for (let i = 0; i < lorries - existingCreepsLDL; i++) {
                    flagNeeds.push([flag.pos.roomName, "longDistanceLorry"])
                }

                //add remote builders
                if (Game.rooms[flag.pos.roomName] != undefined) {
                    var numOfConstrustions = Game.rooms[flag.pos.roomName].find(FIND_CONSTRUCTION_SITES)
                    var numOfRepairsites = Game.rooms[flag.pos.roomName].find(FIND_STRUCTURES, {
                        filter: (s) =>
                            ((s.hits / s.hitsMax) < 0.7) &&
                            s.structureType != STRUCTURE_CONTROLLER &&
                            s.structureType != STRUCTURE_WALL &&
                            s.structureType != STRUCTURE_RAMPART
                    });
                    if ((numOfConstrustions.length + numOfRepairsites.length) > 0) {
                        var existingCreepsLDB = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.target == flag.pos.roomName)
                        if (existingCreepsLDB == 0) flagNeeds.push([flag.pos.roomName, "longDistanceBuilder"])
                    }
                } else {
                    //flagNeeds.push([flag.pos.roomName, "scout"])
                }

                //add claimers
                var existingCreepsC = _.sum(allMyCreeps, (c) => c.memory.role == 'claimer' && c.memory.target == flag.pos.roomName)
                if (Game.rooms[flag.pos.roomName] != undefined) {
                    if (Game.rooms[flag.pos.roomName].controller != undefined && Game.rooms[flag.pos.roomName].controller.reservation != undefined) {
                        if (Game.rooms[flag.pos.roomName].controller.reservation.username == playerUsername) {
                            var reservationLeft = Game.rooms[flag.pos.roomName].controller.reservation.ticksToEnd
                            if (reservationLeft < 3000) {
                                if (existingCreepsC == 0) flagNeeds.push([flag.pos.roomName, "claimer"])
                            }
                        } else {
                            if (existingCreepsC == 0) flagNeeds.push([flag.pos.roomName, "claimer"])
                        }
                    } else {
                        if (existingCreepsC == 0) flagNeeds.push([flag.pos.roomName, "claimer"])
                    }
                } else {
                    if (existingCreepsC == 0) flagNeeds.push([flag.pos.roomName, "claimer"])
                }

            }

            if (flag.color == COLOR_WHITE) {
                var existingCreeps = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.home == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    //flagNeeds.push([flag.pos.roomName, "guard"])
                }
            }

            if (flag.color == COLOR_GREY) {
                var existingCreeps = _.sum(allMyCreeps, (c) => c.memory.role == 'claimer' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    flagNeeds.push([flag.pos.roomName, "claimer"])
                }
            }

            if (flag.color == COLOR_BROWN) {
                var existingCreeps = _.sum(allMyCreeps, (c) => c.memory.role == 'einarr' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    flagNeeds.push([flag.pos.roomName, "einarr"])
                }
            }

            if (flag.color == COLOR_ORANGE) {
                var existingCreeps = _.sum(allMyCreeps, (c) => c.memory.role == 'demolisher' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    flagNeeds.push([flag.pos.roomName, "demolisher"])
                }
            }

            if (flag.color == COLOR_YELLOW) {
                var existingCreeps = _.sum(allMyCreeps, (c) => c.memory.role == 'scout' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    //flagNeeds.push([flag.pos.roomName, "scout"])
                }
            }
            flagNeeds = this.prioritize(flagNeeds)
            remoteRoomNeeds.push(...flagNeeds)
        }
        //return list of needs for given room
        return remoteRoomNeeds;
    }

    statistics() {
        //send stats about spawning to grafana
    }

    remoteRoomContainers(remoteRoomName) {
        let spawnRoom = Game.rooms[this.name]
        if (!_.isEmpty(spawnRoom.memory.containerSources)) {
            var cS = spawnRoom.memory.containerSources;
            cS = _.filter(cS, (f) => f.pos.roomName == remoteRoomName)

            // get combined distance to all sources
            var sumDistance = _.sum(cS, c => c.distance) * 2 //times 2 for round trip
            var count = _.keys(cS).length
            var avgDistance = sumDistance / count

            // add overhead

            //we have 5-10e/t production at the targets
            var avgEnergyCapacity = (_.sum(cS, c => c.energyCapacity) / ENERGY_REGEN_TIME) / count


            // calculate the number of creeps needed
            let rrcl = spawnRoom.controller.level;
            var numCarryBody = 10
            if (rrcl == 7) numCarryBody = 13
            if (rrcl == 8) numCarryBody = 16
            var lorryCarryCapacity = numCarryBody * CARRY_CAPACITY


            var creepsNeeded = ((avgDistance * avgEnergyCapacity) / lorryCarryCapacity) * count


            if (false) {
                var creepsCrurrent = _.filter(allMyCreeps, (c) => c.memory.role == 'longDistanceLorry' && c.memory.home == spawnRoom.name).length
                console.log(spawnRoom.name + " distance: " + sumDistance + " count: " + count + " e/t: " + avgEnergyCapacity + " avgDist: " + (avgDistance).toFixed(2) + " carryCapacity: " +
                    lorryCarryCapacity + " = creepsNeed: " + (creepsNeeded).toFixed(2) + " currently: " + creepsCrurrent);
            }

            if (!_.isEmpty(spawnRoom.storage)) {
                if (_.sum(spawnRoom.storage.store) < 950000) {
                    return _.ceil(creepsNeeded)
                }
            }
        }
    }

    prioritize(list) {
        //prioritize lists of [where, what] need to be spawned

        let spawnList = []
        for (let l in list) {
            for (let p in tableImportance) {

                if (list[l][1] == p) {
                    //console.log(list[l][1], JSON.stringify(tableImportance[p]))
                    spawnList.push([list[l][0], list[l][1], tableImportance[p].prio, tableImportance[p].type, tableImportance[p].noRoads])
                }
            }
        }
        //FIXME: prioritization is not working
        spawnList.sort(function(a, b) {
            return a[2] - b[2];
        });

        return spawnList;
    }
}

module.exports = RoomSpawn;


StructureSpawn.prototype.newCreep =
    function(roleName, home = this.room, target, sourceId, body) {
        if (roleName == "miniharvester") {
            roleName = "harvester";
        }

        let name = roleName + "-" + home + "-" + target + "-" + Game.time;

        var testIfCanSpawn = this.spawnCreep(body, name, {
            dryRun: true
        });

        let running = true //to false to stop

        if (body != null && testIfCanSpawn == OK && running) {
            return this.createCreep(body, name, {
                role: roleName,
                sourceId: sourceId,
                home: home,
                target: target
            });
        } else {
            if (testIfCanSpawn != -6) {
                console.log(this.name + " result: " + testIfCanSpawn + " body: " + body + " energyValiable: " + this.room.energyAvailable + "/" + this.room.energyCapacityAvailable + "<br> " + roleName, home, target, sourceId)
            }
        }
    };