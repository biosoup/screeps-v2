//manager spawn

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
    constructor(colony, roomName) {
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

		//combine them both

        if (this.hostilePresence()) {
			//siege mode	
        }

        if (spawnList != null && spawnList.length > 0) {
            for (var s in spawnRoom.memory.roomArray.spawns) {
                //
            }
        }
    }

    homeRoom() {
        let homeRoomNeeds = []
        let spawnRoom = this.spawnRoom
        let numberOfSources = _.sum(spawnRoom.find(FIND_SOURCES))
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
            let buildersNeeded = Math.ceil((totalProgress - progress) / 5000)
            if (buildersNeeded > Math.ceil(numberOfSources * 1.5)) {
                buildersNeeded = Math.ceil(numberOfSources * 1.5);
            }
            for (let i = 0; i < buildersNeeded; i++) {
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
        }
        for (let i = 0; i < upgradersNeeded; i++) {
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
        for (let i = 0; i < wallRepairerNeeded; i++) {
            homeRoomNeeds.push([this.name, "wallRepairer"]);
        }


        // runner
        if (spawnRoom.storage != undefined) {
            homeRoomNeeds.push([this.name, "runner"]);
        } else if (rcl <= 4 && spawnRoom.energyCapacity > 300) {
            homeRoomNeeds.push([this.name, "runner"]);
        }

        var numberOfMiners = _.sum(allMyCreeps, (c) => c.memory.role == 'miner' && c.memory.home == spawnRoom.name)
        var numberOfSA = _.sum(allMyCreeps, (c) => c.memory.role == 'runner' && c.memory.home == spawnRoom.name)

        // Miners
        for (let i = 0; i < numberOfSources; i++) {
            homeRoomNeeds.push([this.name, "miner"]);
        }
        // Harvester
        if (numberOfMiners + numberOfSA == 0) {
            homeRoomNeeds.push([this.name, "harvester"]);
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
            for (let i = 0; i < harvestersNeeded; i++) {
                homeRoomNeeds.push([this.name, "harvester"]);
            }
        }
        /** Rest **/

        // Miner
        if (spawnRoom.storage == undefined || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]) == null || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]).mineralAmount == 0) {
            //no mineralHarvester needed
        } else {
            homeRoomNeeds.push([this.name, "mineralHarvester"]);
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
                homeRoomNeeds.push([this.name, "transporter"]);
            }
        }

        // Scientist
        if (spawnRoom.memory.labOrder != undefined) {
            var info = spawnRoom.memory.labOrder.split(":");
            if (info[3] == "prepare" || info[3] == "done") {
                homeRoomNeeds.push([this.name, "scientist"]);
            }
        }

        //HEROcreep
        if (!_.isEmpty(spawnRoom.storage)) {
            var powerSpawn = spawnRoom.find(FIND_STRUCTURES, {
                filter: f => f.structureType == STRUCTURE_POWER_SPAWN
            })
            if (!_.isEmpty(powerSpawn) && spawnRoom.storage.store[RESOURCE_POWER] >= 100 && spawnRoom.storage.store[RESOURCE_ENERGY] >= MINSURPLUSENERGY) {
                homeRoomNeeds.push([this.name, "herocreep"]);
            }
            if (spawnRoom.storage.store[RESOURCE_GHODIUM] >= 1000 && spawnRoom.controller.safeModeAvailable <= 3) {
                homeRoomNeeds.push([this.name, "herocreep"]);
            }
        }

        //keep at least one guard ready
        var avaliableGuards = _.filter(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == spawnRoom.name)
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

        return homeRoomNeeds
    }

    hostilePresence() {
        //return true, if hostiles are in spawnroom

    }

    remoteRooms() {
        var allFlags = _.filter(Game.flags, (f) => _.last(_.words(f.name, /[^-]+/g)) == this.name)
        let remoteRoomNeeds = []

        for (var flag of allFlags) {
            //what they need, how much they need

            if (flag.color == COLOR_RED) {
                var existingCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    remoteRoomNeeds.push([flag.pos.roomName, "longDistanceHarvester"])
                }
            }

            if (flag.color == COLOR_PURPLE) {
                var existingCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceMiner' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    remoteRoomNeeds.push([flag.pos.roomName, "longDistanceMiner"])
                }

                //add lorries for miners
                let lorries = this.remoteRoomContainers(flag.pos.roomName)
                for (let i = 0; i < lorries; i++) {
                    remoteRoomNeeds.push([flag.pos.roomName, "longDistanceLorry"])
                }

                //add remote builders
                if (Game.rooms[flag.pos.roomName] != undefined) {
                    var numOfConstrustions = Game.rooms[interest].find(FIND_CONSTRUCTION_SITES)
                    var numOfRepairsites = Game.rooms[interest].find(FIND_STRUCTURES, {
                        filter: (s) =>
                            ((s.hits / s.hitsMax) < 0.7) &&
                            s.structureType != STRUCTURE_CONTROLLER &&
                            s.structureType != STRUCTURE_WALL &&
                            s.structureType != STRUCTURE_RAMPART
                    });
                    if ((numOfConstrustions.length + numOfRepairsites.length) > 0) {
                        remoteRoomNeeds.push([flag.pos.roomName, "longDistanceBuilder"])
                    }
                } else {
                    remoteRoomNeeds.push([flag.pos.roomName, "scout"])
                }

                //add claimers
                if (Game.rooms[flag.pos.roomName] != undefined) {
                    if (Game.rooms[flag.pos.roomName].controller != undefined && Game.rooms[flag.pos.roomName].controller.reservation != undefined) {
                        if (Game.rooms[flag.pos.roomName].controller.reservation.username == playerUsername) {
                            var reservationLeft = Game.rooms[flag.pos.roomName].controller.reservation.ticksToEnd
                            if (reservationLeft < 3000) {
                                remoteRoomNeeds.push([flag.pos.roomName, "claimer"])
                            }
                        } else {
                            remoteRoomNeeds.push([flag.pos.roomName, "claimer"])
                        }
                    } else {
                        remoteRoomNeeds.push([flag.pos.roomName, "claimer"])
                    }
                } else {
                    remoteRoomNeeds.push([flag.pos.roomName, "claimer"])
                }

            }

            if (flag.color == COLOR_WHITE) {
                var existingCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'guard' && c.memory.home == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    remoteRoomNeeds.push([flag.pos.roomName, "guard"])
                }
            }

            if (flag.color == COLOR_GREY) {
                var existingCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'claimer' && c.memory.home == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    remoteRoomNeeds.push([flag.pos.roomName, "claimer"])
                }
            }

            if (flag.color == COLOR_BROWN) {
                var existingCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'einarr' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    remoteRoomNeeds.push([flag.pos.roomName, "einarr"])
                }
            }

            if (flag.color == COLOR_ORANGE) {
                var existingCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'demolisher' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    remoteRoomNeeds.push([flag.pos.roomName, "demolisher"])
                }
            }

            if (flag.color == COLOR_YELLOW) {
                var existingCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'scout' && c.memory.target == flag.pos.roomName)
                for (let i = 0; i < (flag.secondaryColor - existingCreeps); i++) {
                    remoteRoomNeeds.push([flag.pos.roomName, "scout"])
                }
            }
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
            var LDLorryBody = buildingPlans["longDistanceLorry"][rrcl - 1].body
            var numCarryBody = _.sum(LDLorryBody, b => b == "carry")
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
}

module.exports = RoomSpawn;