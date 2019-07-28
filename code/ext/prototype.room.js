"use strict";

/** ADD
- structure placement
	- road building system for main room
	- bunker around spawn
*/

//import the base blueprints
require("base.blueprint");
require("globals.old")

Room.prototype.countDefences = function () {
	var structures = this.find(FIND_STRUCTURES, {
		filter: (f) => f.structureType == STRUCTURE_WALL || f.structureType == STRUCTURE_RAMPART
	})
	return structures.length
}

Room.prototype.buildRoad = function (from, to) {
	//requires two IDs
	var origin = Game.getObjectById(from)
	var destination = Game.getObjectById(to)

	//work only when there are NO construction sites
	var constructionSites = origin.room.find(FIND_CONSTRUCTION_SITES)
	if (constructionSites.length > 0) {
		return "already constructing"
	}

	var path = origin.pos.findPathTo(destination, {
		ignoreCreeps: true,
		ignoreRoads: false
	});
	const terrain = origin.room.getTerrain();

	var number = 0
	for (var step in path) {

		var tile = terrain.get(path[step].x, path[step].y)
		if (tile == TERRAIN_MASK_WALL) {
			//something already there
		} else {
			var response = origin.room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
			if (response == OK) {
				number++;
			}
		}
	}
	//TODO: for a road ending at room end, check road coming from the other side as well
	if (number > 0) {
		console.log("finished road building loop with " + number + " new roads");
	}
};

Room.prototype.buildRoadXY = function (fx, fy, tx, ty) {
	//requires two X Y (this first one is not created)
	var origin = new RoomPosition(fx, fy, this.name)
	var destination = new RoomPosition(tx, ty, this.name)
	console.log("Create road from: " + origin + "to: " + destination);

	var path = origin.findPathTo(destination, {
		ignoreCreeps: true,
		ignoreRoads: false
	});
	const terrain = this.getTerrain();
	for (var step in path) {

		var tile = terrain.get(path[step].x, path[step].y)
		if (tile == TERRAIN_MASK_WALL) {
			//something already there
		} else {
			this.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
		}
	} //for
	console.log("finsihed for loop");
};

Room.prototype.removeSites = function () {
	var room = this
	var sites = room.find(FIND_MY_CONSTRUCTION_SITES);
	var i = sites.length
	while (--i) {
		sites[i].remove();
	}
};

Room.prototype.buildRoadsRoom = function () {
	var room = this

	if (!_.isEmpty(room.storage)) {
		var center = room.storage
	} else {
		var center = room.spawns[0];
	}

	var structures = room.containers
	structures.push(room.controller)
	if (!_.isEmpty(room.extractor)) {
		structures.push(room.extractor)
	}


	//TODO: add exits
	// can be null when no path
	/* var exit_top = center.pos.findClosestByPath(FIND_EXIT_TOP)
	var exit_left = center.pos.findClosestByPath(FIND_EXIT_LEFT)
	var exit_right = center.pos.findClosestByPath(FIND_EXIT_RIGHT)
	var exit_bottom = center.pos.findClosestByPath(FIND_EXIT_BOTTOM) */


	//TODO: make smarter and check existing road construction sites?

	console.log(room, "buildroads for", structures.length);
	for (var i = 0; i < structures.length; i++) {
		this.buildRoad(structures[i].id, center.id);
	}
};

Room.prototype.refreshData =
	function (r) {
		let roomCreeps = Game.rooms[r].find(FIND_MY_CREEPS);
		var refresh = false;

		//  Refresher
		if (Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername && Game.rooms[r].memory.roomArray == undefined) {
			Game.rooms[r].memory.roomArray = {};
		} else if (Game.rooms[r].memory.roomArray == undefined && Game.rooms[r].controller != undefined && roomCreeps > 0) {
			Game.rooms[r].memory.roomArray = {};
		} else if (refresh == true) {
			Game.rooms[r].memory.roomArray = {};
		}

		//FIXME: add postion to IDs as well

		var searchResult;
		if (roomCreeps > 0 || (Game.rooms[r].controller != undefined &&
				Game.rooms[r].controller.owner != undefined &&
				Game.rooms[r].controller.owner.username == playerUsername) ||
			Game.rooms[r].memory.roomArray == undefined) {

			// Preloading room structure
			if (Game.rooms[r].memory.roomArray == undefined) {
				Game.rooms[r].memory.roomArray = {};
			}

			//time of last check
			Game.rooms[r].memory.roomArray.lastCheck = Game.time;

			//Hostile structures
			var hostileStructures = [];
			var hostileStructuresPos = [];
			searchResult = Game.rooms[r].find(FIND_HOSTILE_STRUCTURES);
			for (let s in searchResult) {
				hostileStructures.push(searchResult[s].id);
				hostileStructuresPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.hostileStructures = hostileStructures;
			Game.rooms[r].memory.roomArray.hostileStructuresPos = hostileStructuresPos;

			//Hostile creeps
			var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS, {
				filter: h => h.owner.username != "Invader"
			})
			if (hostiles > 0) {
				Game.rooms[r].memory.roomArray.hostileCreeps = [hostiles.length, _.first(hostiles).owner.username];
			} else {
				Game.rooms[r].memory.roomArray.hostileCreeps = [0, null]
			}



			//avaliable exits
			Game.rooms[r].memory.roomArray.exits = Game.map.describeExits(r);

			//Room sources
			if (Game.rooms[r].memory.roomArraySources != undefined) {
				delete Game.rooms[r].memory.roomArraySources;
			}
			var sourceIDs = [];
			var sourceIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_SOURCES);
			for (let s in searchResult) {
				sourceIDs.push(searchResult[s].id);
				sourceIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.sources = sourceIDs;
			Game.rooms[r].memory.roomArray.sourcesPos = sourceIDsPos;

			if (Game.rooms[r].memory.roomArrayMinerals != undefined) {
				delete Game.rooms[r].memory.roomArrayMinerals;
			}
			var mineralIDs = [];
			var mineralIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MINERALS);
			for (let s in searchResult) {
				mineralIDs.push(searchResult[s].id);
				mineralIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.minerals = mineralIDs;
			Game.rooms[r].memory.roomArray.mineralsPos = mineralIDsPos;

			//containers
			if (Game.rooms[r].memory.roomArrayContainers != undefined) {
				delete Game.rooms[r].memory.roomArrayContainers;
			}
			var containerIDs = [];
			var containerIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_CONTAINER
			});
			for (let s in searchResult) {
				containerIDs.push(searchResult[s].id);
				containerIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.containers = containerIDs;
			Game.rooms[r].memory.roomArray.containersPos = containerIDsPos;

			//room MY_structures
			if (Game.rooms[r].memory.roomArrayPowerSpawns != undefined) {
				delete Game.rooms[r].memory.roomArrayPowerSpawns;
			}
			var powerSpawnIDs = [];
			var powerSpawnIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN
			});
			for (let s in searchResult) {
				powerSpawnIDs.push(searchResult[s].id);
				powerSpawnIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.powerSpawns = powerSpawnIDs;
			Game.rooms[r].memory.roomArray.powerSpawnsPos = powerSpawnIDsPos;

			if (Game.rooms[r].memory.roomArraySpawns != undefined) {
				delete Game.rooms[r].memory.roomArraySpawns;
			}
			var spawnIDs = [];
			var spawnIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_SPAWN
			});
			for (let s in searchResult) {
				spawnIDs.push(searchResult[s].id);
				spawnIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.spawns = spawnIDs;
			Game.rooms[r].memory.roomArray.spawnsPos = spawnIDsPos;

			if (Game.rooms[r].memory.roomArrayExtensions != undefined) {
				delete Game.rooms[r].memory.roomArrayExtensions;
			}
			var extensionIDs = [];
			var extensionIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_EXTENSION
			});
			for (let s in searchResult) {
				extensionIDs.push(searchResult[s].id);
				extensionIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.extensions = extensionIDs;
			Game.rooms[r].memory.roomArray.extensionsPos = extensionIDsPos;

			if (Game.rooms[r].memory.roomArrayLinks != undefined) {
				delete Game.rooms[r].memory.roomArrayLinks;
			}
			var LinkIDs = [];
			var LinkIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_LINK
			});
			for (let s in searchResult) {
				LinkIDs.push(searchResult[s].id);
				LinkIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.links = LinkIDs;
			Game.rooms[r].memory.roomArray.linksPos = LinkIDsPos;

			if (Game.rooms[r].memory.roomArrayLabs != undefined) {
				delete Game.rooms[r].memory.roomArrayLabs;
			}
			var LabIDs = [];
			var LabIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_LAB
			});
			for (let s in searchResult) {
				LabIDs.push(searchResult[s].id);
				LabIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.labs = LabIDs;
			Game.rooms[r].memory.roomArray.labsPos = LabIDsPos;

			if (Game.rooms[r].memory.roomArrayExtractors != undefined) {
				delete Game.rooms[r].memory.roomArrayExtractors;
			}
			var ExtractorIDs = [];
			var ExtractorIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_EXTRACTOR
			});
			for (let s in searchResult) {
				ExtractorIDs.push(searchResult[s].id);
				ExtractorIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.extractors = ExtractorIDs;
			Game.rooms[r].memory.roomArray.extractorsPos = ExtractorIDsPos;

			if (Game.rooms[r].memory.roomArrayRamparts != undefined) {
				delete Game.rooms[r].memory.roomArrayRamparts;
			}
			var rampartIDs = [];
			var rampartIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_RAMPART
			});
			for (let s in searchResult) {
				rampartIDs.push(searchResult[s].id);
				rampartIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.ramparts = rampartIDs;
			Game.rooms[r].memory.roomArray.rampartsPos = rampartIDsPos;

			if (Game.rooms[r].memory.roomArrayNukers != undefined) {
				delete Game.rooms[r].memory.roomArrayNukers;
			}
			var nukerIDs = [];
			var nukerIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_NUKER
			});
			for (let s in searchResult) {
				nukerIDs.push(searchResult[s].id);
				nukerIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.nukers = nukerIDs;
			Game.rooms[r].memory.roomArray.nukersPos = nukerIDsPos;

			if (Game.rooms[r].memory.roomArrayObservers != undefined) {
				delete Game.rooms[r].memory.roomArrayObservers;
			}
			var observerIDs = [];
			var observerIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_OBSERVER
			});
			for (let s in searchResult) {
				observerIDs.push(searchResult[s].id);
				observerIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.observers = observerIDs;
			Game.rooms[r].memory.roomArray.observersPos = observerIDsPos;

			if (Game.rooms[r].memory.roomArrayTowers != undefined) {
				delete Game.rooms[r].memory.roomArrayTowers;
			}
			var towerIDs = [];
			var towerIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_TOWER
			});
			for (let s in searchResult) {
				towerIDs.push(searchResult[s].id);
				towerIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.towers = towerIDs;
			Game.rooms[r].memory.roomArray.towersPos = towerIDsPos;

			//Source Keepers
			if (Game.rooms[r].memory.roomArrayLairs != undefined) {
				delete Game.rooms[r].memory.roomArrayLairs;
			}
			var lairIDs = [];
			var lairIDsPos = [];
			searchResult = Game.rooms[r].find(FIND_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_KEEPER_LAIR
			});
			for (let s in searchResult) {
				lairIDs.push(searchResult[s].id);
				lairIDsPos.push(searchResult[s].pos);
			}
			Game.rooms[r].memory.roomArray.lairs = lairIDs;
			Game.rooms[r].memory.roomArray.lairsPos = lairIDsPos;

			if (hostileStructures.length > 0) {
				//we got a hostile room
				Game.rooms[r].memory.roomArray.type = "hostile"
			} else if (lairIDs.length > 0) {
				// SK room
				Game.rooms[r].memory.roomArray.type = "SK"
			} else {
				//normal room
				Game.rooms[r].memory.roomArray.type = "normal"
			}
		}

		//Check master spawn
		if (Game.rooms[r].memory.masterSpawn != undefined && Game.getObjectById(Game.rooms[r].memory.masterSpawn) == null) {
			delete Game.rooms[r].memory.masterSpawn;
		}
		if (Game.rooms[r].memory.masterSpawn == undefined && Game.rooms[r].memory.roomArray != undefined && Game.rooms[r].memory.roomArray.spawns != undefined) {
			if (Game.rooms[r].memory.roomArray.spawns.length == 1) {
				Game.rooms[r].memory.masterSpawn = Game.rooms[r].memory.roomArray.spawns[0];
			} else if (Game.rooms[r].memory.roomArray.spawns.length > 1) {
				for (var id in Game.rooms[r].memory.roomArray.spawns) {
					var testSpawn = Game.getObjectById(Game.rooms[r].memory.roomArray.spawns[id]);
					if (!_.isEmpty(testSpawn)) {
						if (testSpawn.memory.spawnRole == 1) {
							Game.rooms[r].memory.masterSpawn = Game.rooms[r].memory.roomArray.spawns[id];
						}
					}
				}
			}
		}
	};

Room.prototype.creepSpawnRun =
	function (spawnRoom) {
		let globalSpawningStatus = 0;
		let cpuStart = Game.cpu.getUsed();

		if (spawnRoom.memory.roomArray != undefined) {
			for (var s in spawnRoom.memory.roomArray.spawns) {
				var testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
				if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
					globalSpawningStatus++;
				}
				//if multiple spawns are in room, and one of them is spawning, wait for next round

			}
		}

		/* if (this.checkForDefeat(spawnRoom)) {
			//room has been defeated, no need to spawn anymore
			return -1;
		} */

		if (globalSpawningStatus == 0) {
			//All spawns busy, inactive or player lost control of the room
			return -1;
		}
		let allMyCreeps = _.filter(Game.creeps, (c) => c.memory.home == spawnRoom.name && (c.ticksToLive > (c.body.length * 3) - 3 || c.spawning == true));

		//Check for sources & minerals
		let numberOfSources = spawnRoom.memory.roomArray.sources.length;
		let numberOfExploitableMineralSources = spawnRoom.memory.roomArray.extractors.length;

		// Define spawn minima
		let minimumSpawnOf = {};
		//Volume defined by flags
		minimumSpawnOf["longDistanceHarvester"] = 0;
		minimumSpawnOf["claimer"] = 0;
		minimumSpawnOf["bigClaimer"] = 0; //unused
		minimumSpawnOf["guard"] = 0;
		minimumSpawnOf["miner"] = 0;
		minimumSpawnOf["longDistanceMiner"] = 0;
		minimumSpawnOf["demolisher"] = 0;
		minimumSpawnOf["runner"] = 0;
		minimumSpawnOf["scout"] = 0;
		minimumSpawnOf["longDistanceLorry"] = 0;
		minimumSpawnOf["longDistanceBuilder"] = 0;
		minimumSpawnOf["attacker"] = 0; //unused
		minimumSpawnOf["healer"] = 0; //unused
		minimumSpawnOf["einarr"] = 0;
		minimumSpawnOf["archer"] = 0; //unused
		minimumSpawnOf["scientist"] = 0; //unused
		minimumSpawnOf["transporter"] = 0;
		minimumSpawnOf["SKHarvester"] = 0; //unused
		minimumSpawnOf["SKHauler"] = 0; //unused
		minimumSpawnOf["herocreep"] = 0;

		// LL code for miners and long distances

		//room interests
		let roomInterests = {}

		// REMOTE HARVEST
		var redFlags = _.filter(Game.flags, (f) => f.color == COLOR_RED && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
		//get remote mining rooms for this spawnroom
		if (!_.isEmpty(redFlags)) {
			for (var flag of redFlags) {
				//roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
				roomInterests[flag.pos.roomName] = [flag.secondaryColor, 0, 0, 1, 0, 1]
			}
		}

		// REMOTE MINING
		if (!_.isEmpty(spawnRoom.storage)) {
			//get all flags with code PURPLE for remote MINERS
			var purpleFlags = _.filter(Game.flags, (f) => f.color == COLOR_PURPLE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
			//get remote mining rooms for this spawnroom
			if (!_.isEmpty(purpleFlags)) {
				for (var flag of purpleFlags) {
					//roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
					//builders & guard = boolean
					roomInterests[flag.pos.roomName] = [0, flag.secondaryColor, 0, 1, 1, 1]
					//FIXME: dynamic number of lorries, based on distance, e/t and RCL
				}
			}
		}

		//add longDistanceLorries based on distance to sources
		if (!_.isEmpty(spawnRoom.memory.containerSources)) {
			var cS = spawnRoom.memory.containerSources;


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
					minimumSpawnOf.longDistanceLorry = _.ceil(creepsNeeded)
				}
			}
		}


		// DEFENSE
		if (!_.isEmpty(spawnRoom.storage)) {
			//get gcl and number of rooms
			var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
			if (!_.isEmpty(whiteFlags)) {
				for (var flag of whiteFlags) {
					//check if there are avaliable quards
					var avaliableGuards = _.filter(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == spawnRoom.name)
					if (avaliableGuards.length > 0) {
						//we have guards ready
						for (var c in avaliableGuards) {
							//send all to deal with stuff
							avaliableGuards[c].memory.target = flag.pos.roomName
							if (avaliableGuards[c].hasValidTask) {
								//avaliableGuards[c].task.fork(creepsInDanger[c].runRole())
							}
						}
					} else {
						//spawn more guards

						//roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
						//builders & guard = boolean
						roomInterests[flag.pos.roomName] = [0, 0, 0, 0, 0, flag.secondaryColor]
						var defend = flag.pos.roomName;
					}
					//break tasks for all creeps in room
					var creepsInDanger = _.filter(allMyCreeps, (c) => c.memory.role != 'guard' && c.memory.target == flag.pos.roomName)
					for (var c in creepsInDanger) {
						if (creepsInDanger[c].room.name != creepsInDanger[c].memory.home) {
							//if other room than home -> go home
							if (creepsInDanger[c].hasValidTask) {
								//creepsInDanger[c].task.fork(creepsInDanger[c].runRole())
							}
						}
					}
				}
			}
		}

		// CLAIM ROOM
		if (!_.isEmpty(spawnRoom.storage)) {
			//get gcl and number of rooms
			var gcl = Game.gcl.level;
			var numberOfRooms = _.sum(Game.rooms, room => room.controller && room.controller.my)
			var greyFlags = _.filter(Game.flags, (f) => f.color == COLOR_GREY && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
			if (gcl > numberOfRooms) {
				if (!_.isEmpty(greyFlags)) {
					for (var flag of greyFlags) {
						//roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
						//builders & guard = boolean
						roomInterests[flag.pos.roomName] = [0, 0, 0, flag.secondaryColor, 1, 1]
						var newRoom = flag.pos.roomName;
					}
				}
			} else {
				if (!_.isEmpty(greyFlags)) {
					for (var flag of greyFlags) {
						var spawnExists = Game.rooms[flag.pos.roomName].spawns
						if (spawnExists.length == 0) {
							//roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
							//builders & guard = boolean
							roomInterests[flag.pos.roomName] = [0, 0, 0, flag.secondaryColor, 0, 1]
							var newRoom = flag.pos.roomName;
						} else {
							//remove flag
							flag.remove()
						}
					}
				}
			}
		}

		//ATTACK
		var attackFlags = _.filter(Game.flags, (f) => f.color == COLOR_BROWN && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
		var einarr = {}
		if (!_.isEmpty(attackFlags)) {
			for (var flag of attackFlags) {
				minimumSpawnOf.einarr = flag.secondaryColor
				einarr[flag.pos.roomName] = flag.secondaryColor
			}
		}

		if (einarr.length > 0) {
			console.log(spawnRoom.name + " " + JSON.stringify(einarr))
		}

		//DEMOLISH
		var demoFlags = _.filter(Game.flags, (f) => f.color == COLOR_ORANGE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
		var demolisher = {}
		if (!_.isEmpty(demoFlags)) {
			for (var flag of demoFlags) {
				minimumSpawnOf.demolisher = minimumSpawnOf.demolisher + flag.secondaryColor
				demolisher[flag.pos.roomName] = flag.secondaryColor
			}
		}


		let longDistanceHarvester = {}
		let longDistanceMiner = {}
		let longDistanceBuilder = {}
		let claimer = {}
		let guard = {}

		for (let interest in roomInterests) {
			if (roomInterests[interest][0] > 0) {
				var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.target == interest)
				minimumSpawnOf.longDistanceHarvester += roomInterests[interest][0] - inRooms;
				if (inRooms < roomInterests[interest][0]) {
					longDistanceHarvester[interest] = roomInterests[interest][0]
				}
				//console.log(interest+" "+inRooms+" "+roomInterests[interest][0]+" "+minimumSpawnOf.longDistanceHarvester)
			}
			if (roomInterests[interest][1] > 0) {
				var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceMiner' && c.memory.target == interest)
				minimumSpawnOf.longDistanceMiner += roomInterests[interest][1];
				if (inRooms < roomInterests[interest][1]) {
					longDistanceMiner[interest] = roomInterests[interest][1]
				}

				//check for controller reservation status
				var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'claimer' && c.memory.target == interest)
				if (Game.rooms[interest] != undefined) {
					//console.log(JSON.stringify(Game.rooms[interest].controller))
					if (Game.rooms[interest].controller != undefined && Game.rooms[interest].controller.reservation != undefined) {
						if (Game.rooms[interest].controller.reservation.username == playerUsername) {
							var reservationLeft = Game.rooms[interest].controller.reservation.ticksToEnd
							if (reservationLeft < 3000) {
								minimumSpawnOf.claimer += 1 - inRooms;
								if (inRooms < 1) {
									claimer[interest] = 1;
								}
							}
						} else {
							minimumSpawnOf.claimer += 1 - inRooms;
							if (inRooms < 1) {
								claimer[interest] = 1;
							}
						}
					} else {
						minimumSpawnOf.claimer += 1 - inRooms;
						if (inRooms < 1) {
							claimer[interest] = 1;
						}
					}
				}
				//console.log(interest+" "+inRooms+" "+roomInterests[interest][1]+" "+minimumSpawnOf.longDistanceMiner)
			}
			if (roomInterests[interest][2] > 0) {
				//code moved somewhere else :)

				//minimumSpawnOf.longDistanceLorry += roomInterests[interest][2];
			}
			if (roomInterests[interest][3] > 0) {
				var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.target == interest)
				//if construction or repairs are needed, launch a builder
				if (Game.rooms[interest] != undefined) {
					var numOfConstrustions = Game.rooms[interest].find(FIND_CONSTRUCTION_SITES)
					var numOfRepairsites = Game.rooms[interest].find(FIND_STRUCTURES, {
						filter: (s) =>
							((s.hits / s.hitsMax) < 0.7) &&
							s.structureType != STRUCTURE_CONTROLLER &&
							s.structureType != STRUCTURE_WALL &&
							s.structureType != STRUCTURE_RAMPART
					});
					//console.log(interest+" "+numOfConstrustions.length +" "+ numOfRepairsites.length)
					if (interest == newRoom) {
						minimumSpawnOf.longDistanceBuilder += roomInterests[interest][3];
					} else if ((numOfConstrustions.length + numOfRepairsites.length) > 0) {
						roomInterests[interest][3] = _.ceil((numOfConstrustions.length + numOfRepairsites.length) / 10)
					} else {
						roomInterests[interest][3] = 0
					}

					if (roomInterests[interest][3] > 2) {
						roomInterests[interest][3] = 2
					}

					minimumSpawnOf.longDistanceBuilder += roomInterests[interest][3];
					if (inRooms < roomInterests[interest][3]) {
						longDistanceBuilder[interest] = roomInterests[interest][3]
					}

					//console.log(interest + " " + newRoom + " " + roomInterests[interest][3] + " " + minimumSpawnOf.longDistanceBuilder)
				} else {
					//no vision into the room
					if (interest == newRoom) {
						minimumSpawnOf.longDistanceBuilder += roomInterests[interest][3];
						if (inRooms < roomInterests[interest][3]) {
							longDistanceBuilder[interest] = roomInterests[interest][3]
						}
					}
				}
			}
			if (roomInterests[interest][4] > 0) {
				if (interest == newRoom) {
					var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'claimer' && c.memory.target == interest)
					minimumSpawnOf.claimer += 1 - inRooms;
					if (inRooms < 1) {
						claimer[interest] = 1;
					}
				}
			}
			if (roomInterests[interest][5] > 0) {
				var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == interest)
				var inRoomsCurrent = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.home == spawnRoom.name && c.memory.target != interest)
				if (Game.rooms[interest] != undefined) {
					//if I have vision, check for other properties of hostiles

					//if hostiles present, spawn a task force!
					let hostileValues = spawnRoom.checkForHostiles(Game.rooms[interest])
					if (!_.isEmpty(hostileValues)) {
						if (hostileValues.numHostiles > 0) {
							if (hostileValues.numberOfAttackBodyParts > 0) {
								console.log("*!!!* " + interest + " Being attacked by " + hostileValues.numHostiles + " with: " + hostileValues.numberOfAttackBodyParts + " attack parts and " + hostileValues.numberOfHealBodyParts + " heal parts. Response team: " + inRooms)
								if (hostileValues.numberOfAttackBodyParts < 3 && hostileValues.numberOfHealBodyParts < 2) {
									//small invader
									roomInterests[interest][5] = hostileValues.numHostiles;
								} else {
									//big invader or with healers
									roomInterests[interest][5] = hostileValues.numHostiles * 2;
								}

								//hostiles, do not spawn anything else for this room
								roomInterests[interest][0] = 0
								minimumSpawnOf.longDistanceHarvester = minimumSpawnOf.longDistanceHarvester - roomInterests[interest][0];
								roomInterests[interest][1] = 0
								minimumSpawnOf.longDistanceMiner = minimumSpawnOf.longDistanceMiner - roomInterests[interest][1];
								roomInterests[interest][2] = 0
								minimumSpawnOf.longDistanceLorry = minimumSpawnOf.longDistanceLorry - roomInterests[interest][2];
								roomInterests[interest][3] = 0
								minimumSpawnOf.longDistanceBuilder = minimumSpawnOf.longDistanceBuilder - roomInterests[interest][3];
								roomInterests[interest][4] = 0
								minimumSpawnOf.claimer = minimumSpawnOf.claimer - roomInterests[interest][4];
							} else {
								console.log("R enemy scout in " + interest)
							}
						} else {
							//should not happen
							roomInterests[interest][5] = 0;
							console.log("guard code - smth wrong")
						}

						//update the minimumSpawnOf
						minimumSpawnOf.guard += roomInterests[interest][5];

						//update count for spawn loop
						if (inRooms < roomInterests[interest][5]) {
							guard[interest] = roomInterests[interest][5]
						}
						//FIXME: not spawning enough guards

						//console.log("Enemy in " + interest + " with " + inRooms + " guards dispathed from " + spawnRoom.name + " " + JSON.stringify(guard) + " " + minimumSpawnOf.guard)
					}
				} else {
					//we do not have vision - rely on flag

					//check for flag
					var whiteFlags = _.first(_.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name && f.pos.roomName == interest))
					if (!_.isEmpty(whiteFlags)) {
						minimumSpawnOf.guard += roomInterests[interest][5] + inRoomsCurrent;
						if (inRooms < roomInterests[interest][5]) {
							guard[interest] = roomInterests[interest][5]
						}

						console.log("Enemy in " + whiteFlags.pos.roomName + " with " + inRooms + " guards dispathed from " + _.last(_.words(whiteFlags.name, /[^-]+/g)) + "/" + spawnRoom.name + " " + JSON.stringify(guard) + " " + minimumSpawnOf.guard)
					}
				}
			}
		}

		/* if (minimumSpawnOf.guard > 0) {
			var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.home == spawnRoom.name)
			console.log("Enemy! " + inRooms + " guards from " + spawnRoom.name + " " + JSON.stringify(guard) + " " + minimumSpawnOf.guard)
		} */

		/**Spawning volumes scaling with # of sources in room**/
		var constructionSites = spawnRoom.find(FIND_MY_CONSTRUCTION_SITES);
		var constructionOfRampartsAndWalls = 0;

		// Builder
		if (constructionSites.length == 0) {
			minimumSpawnOf.builder = 0;
		} else {
			//There are construction sites
			var progress = 0;
			var totalProgress = 0;
			for (var w in constructionSites) {
				progress += constructionSites[w].progress;
				totalProgress += constructionSites[w].progressTotal;
				if (constructionSites[w].structureType == STRUCTURE_RAMPART || constructionSites[w].structureType == STRUCTURE_WALL) {
					constructionOfRampartsAndWalls++;
				}
			}
			minimumSpawnOf.builder = Math.ceil((totalProgress - progress) / 5000);

			if (minimumSpawnOf.builder > Math.ceil(numberOfSources * 1.5)) {
				minimumSpawnOf.builder = Math.ceil(numberOfSources * 1.5);
			}
			//console.log(minimumSpawnOf.builder+" "+totalProgress +" "+progress)
		}


		// Upgrader
		minimumSpawnOf["upgrader"] = 1;
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
				minimumSpawnOf.upgrader = _.ceil(2 * mutiply)
			}
		}

		//Wall Repairer – CONSTRUCTION
		var wallRepairTargets = spawnRoom.find(FIND_STRUCTURES, {
			filter: (s) => (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < WALLMAX
		});
		if (constructionOfRampartsAndWalls == 0) {
			minimumSpawnOf["wallRepairer"] = 0;
		}
		if (wallRepairTargets.length > 0) {
			if (_.isEmpty(spawnRoom.storage)) {
				minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
			} else {
				if (spawnRoom.storage.store[RESOURCE_ENERGY] > (MINSURPLUSENERGY * spawnRoom.controller.level)) {
					//minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources);
					minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
				} else {
					minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
				}
			}
		}


		// runner
		if (spawnRoom.storage != undefined) {
			minimumSpawnOf["runner"] = 2;

			//pull back on lorries when storage is overflowing
			if (_.sum(spawnRoom.storage.store) > 900000) {
				minimumSpawnOf.longDistanceLorry = Math.floor(minimumSpawnOf.longDistanceLorry / 3);
			} else {
				//round that number
				minimumSpawnOf.longDistanceLorry = Math.floor(minimumSpawnOf.longDistanceLorry);
			}
		}

		var numberOfMiners = _.sum(allMyCreeps, (c) => c.memory.role == 'miner' && c.memory.home == spawnRoom.name)
		var numberOfSA = _.sum(allMyCreeps, (c) => c.memory.role == 'runner' && c.memory.home == spawnRoom.name)

		// lorry, Harvester & Repairer
		minimumSpawnOf["miner"] = numberOfSources;
		minimumSpawnOf["harvester"] = numberOfSources - Math.ceil(numberOfMiners / 2) - numberOfSA
		//minimumSpawnOf["harvester"] = numberOfSources - numberOfSA



		/** Rest **/

		// Miner
		minimumSpawnOf["mineralHarvester"] = numberOfExploitableMineralSources;
		if (spawnRoom.storage == undefined || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]) == null || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]).mineralAmount == 0) {
			minimumSpawnOf.mineralHarvester = 0;
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
				minimumSpawnOf.transporter = 1;
			}
		}

		// Scientist
		if (spawnRoom.memory.labOrder != undefined) {
			var info = spawnRoom.memory.labOrder.split(":");
			if (info[3] == "prepare" || info[3] == "done") {
				minimumSpawnOf.scientist = 1;
			}
		}

		//HEROcreep
		if (!_.isEmpty(spawnRoom.storage)) {
			var powerSpawn = spawnRoom.find(FIND_STRUCTURES, {
				filter: f => f.structureType == STRUCTURE_POWER_SPAWN
			})
			if (!_.isEmpty(powerSpawn) && spawnRoom.storage.store[RESOURCE_POWER] >= 100 && spawnRoom.storage.store[RESOURCE_ENERGY] >= MINSURPLUSENERGY) {
				minimumSpawnOf.herocreep = 1
			}

			if (spawnRoom.storage.store[RESOURCE_GHODIUM] >= 1000 && spawnRoom.controller.safeModeAvailable <= 3) {
				minimumSpawnOf.herocreep = 1
			}
		}


		//Scout
		//minimumSpawnOf.scout = 1;


		// Adjustments in case of hostile presence
		var hostileValues = spawnRoom.checkForHostiles(spawnRoom);
		var numberOfTowers = spawnRoom.find(FIND_STRUCTURES, {
			filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy > 0
		});
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
		}

		//keep at least one guard ready
		var avaliableGuards = _.filter(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == spawnRoom.name)
		var remoteMiners = _.filter(allMyCreeps, (c) => c.memory.role == 'longDistanceMiner' && c.memory.home == spawnRoom.name)
		if (avaliableGuards.length == 0 && remoteMiners.length > 0) {
			minimumSpawnOf.guard = 1;
			guard[spawnRoom.name] = 1;
		}



		// Measuring number of active creeps
		let counter = _.countBy(allMyCreeps, "memory.role");
		let roleList = (Object.getOwnPropertyNames(minimumSpawnOf));
		for (let z in roleList) {
			if (roleList[z] != "length" && counter[roleList[z]] == undefined) {
				counter[roleList[z]] = 0;
			}
		}
		let numberOf = counter;
		numberOf.claimer = 0; //minimumSpawnOf only contains claimer delta. Hence numberOf.claimer is always 0

		// Role selection
		let energy = spawnRoom.energyCapacityAvailable;
		let name = undefined;
		let rcl = spawnRoom.controller.level;

		/* 
		FIXME:
			- more agressive spawning on lower RCL
			- fixed numbers for now
		*/

		if (rcl <= 3) {
			/* minimumSpawnOf.guard += 1
			guard[spawnRoom.name] += 1 */

			if (numberOfMiners == 0) {
				let sources = spawnRoom.find(FIND_SOURCES);
				var freeSpots = 0
				for (var s of sources) {
					//check how many free space each has
					var freeSpaces = spawnRoom.lookForAtArea(LOOK_TERRAIN, s.pos.y - 1, s.pos.x - 1, s.pos.y + 1, s.pos.x + 1, true);
					freeSpaces = freeSpaces.filter(f => f.terrain == "wall")
					freeSpots = freeSpots + (9 - freeSpaces.length)
				}
				minimumSpawnOf.harvester = freeSpots * 2;
				if (minimumSpawnOf.harvester > 10) {
					minimumSpawnOf.harvester = 10
				}
			} else {
				minimumSpawnOf.harvester = numberOfSources * 2
			}
		}

		if (rcl <= 2) {
			minimumSpawnOf.runner = 1
		}

		//we can claim new room, pause upgraders
		if (!_.isEmpty(newRoom)) {
			minimumSpawnOf.upgrader = 0
			minimumSpawnOf.longDistanceMiner = 0
			minimumSpawnOf.longDistanceLorry = 0
		}

		//keep a builder until we have towers for repairs
		if ((rcl < 3 || numberOfTowers.length == 0) && minimumSpawnOf.builder == 0) {
			minimumSpawnOf.builder = 1;
		}

		//Check whether spawn trying to spawn too many creeps
		let missingBodyParts = 0;
		for (let rn in minimumSpawnOf) {
			if (!_.isEmpty(minimumSpawnOf[rn]) && !_.isEmpty(buildingPlans[rn])) {
				missingBodyParts += minimumSpawnOf[rn] * buildingPlans[rn][rcl - 1].body.length;
			}
		}
		let neededTicksToSpawn = 3 * missingBodyParts;
		let neededTicksThreshold = 1300 * spawnRoom.memory.roomArray.spawns.length;
		if (neededTicksToSpawn > neededTicksThreshold) {
			console.log("<font color=#ff0000 type='highlight'>Warning: Possible bottleneck to spawn creeps needed for room " + spawnRoom.name + "  detected: " + neededTicksToSpawn + " ticks > " + neededTicksThreshold + " ticks</font>");
			minimumSpawnOf.runner = minimumSpawnOf.runner + 1
		}
		if (spawnRoom.energyAvailable < (spawnRoom.energyCapacityAvailable / 2) && minimumSpawnOf.runner == 1) {
			minimumSpawnOf.runner = minimumSpawnOf.runner + 1
		}
		let spawnList = this.getSpawnList(spawnRoom, minimumSpawnOf, numberOf);
		let spawnEntry = 0;

		if (spawnList != null && spawnList.length > 0) {
			for (var s in spawnRoom.memory.roomArray.spawns) {
				// Iterate through spawns
				let testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
				if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {

					if (false) {
						var debug = [spawnList, minimumSpawnOf, numberOf]
						console.log(spawnRoom.name + " " + JSON.stringify(debug) + " *** ticks needed: " + neededTicksToSpawn)
					}

					// Spawn!
					if (spawnList[spawnEntry] == "miner") {
						// check if all sources have miners
						var sources = spawnRoom.memory.roomArray.sources

						// iterate over all sources
						for (var source of sources) {
							source = Game.getObjectById(source);

							// if the source has no miner
							if (!_.some(allMyCreeps, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {

								// check whether or not the source has a container
								var containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
									filter: s => s.structureType == STRUCTURE_CONTAINER
								});

								// if there is a container next to the source
								if (containers.length > 0 && spawnRoom.energyAvailable >= 300) {
									// spawn a miner
									name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName, source.id);
								} else {
									// check whether or not the source has a link
									var containers = source.pos.findInRange(FIND_STRUCTURES, 2, {
										filter: s => s.structureType == STRUCTURE_LINK
									});

									// if there is a container next to the source
									if (containers.length > 0 && spawnRoom.energyAvailable >= 300) {
										name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName, source.id);
									}
								}
							}
						}
					} else if (spawnList[spawnEntry] == "claimer") {
						for (var roomName in claimer) {
							name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
						}
					} else if (spawnList[spawnEntry] == "longDistanceHarvester") {
						for (var roomName in longDistanceHarvester) {
							name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
						}
					} else if (spawnList[spawnEntry] == "longDistanceMiner") {
						for (var roomName in longDistanceMiner) {
							name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
						}
					} else if (spawnList[spawnEntry] == "longDistanceBuilder") {
						for (var roomName in longDistanceBuilder) {
							name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
						}
					} else if (spawnList[spawnEntry] == "einarr") {
						for (var roomName in einarr) {
							name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
						}
					} else if (spawnList[spawnEntry] == "demolisher") {
						for (var roomName in demolisher) {
							name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
						}
					} else if (spawnList[spawnEntry] == "guard") {
						if (_.isEmpty(guard)) {
							console.log("ERR spawning a GUARD!! in " + spawnRoom.name + " " + JSON.stringify(minimumSpawnOf.guard))
						}
						for (var roomName in guard) {
							name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
						}
					} else {
						name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name);
					}
					testSpawn.memory.lastSpawnAttempt = spawnList[spawnEntry];
					if (!(name < 0) && name != undefined) {
						testSpawn.memory.lastSpawn = spawnList[spawnEntry];
						if (LOG_SPAWN == true) {
							console.log("<font color=#00ff22 type='highlight'>" + testSpawn.name + " is spawning creep: " + name + " in room " + spawnRoom.name + ". (CPU used: " + (Game.cpu.getUsed() - cpuStart) + ") on tick " + Game.time + "<br> creeps left: " + JSON.stringify(spawnList) + "</font>");
						}
						spawnEntry++;
					}
				}
				if (spawnEntry >= spawnList.length) {
					break;
				}
			}
		}
	};

Room.prototype.getSpawnList = function (spawnRoom, minimumSpawnOf, numberOf) {
	let rcl = spawnRoom.controller.level;

	let tableImportance = {
		harvester: {
			name: "harvester",
			prio: 10,
			energyRole: true,
			min: minimumSpawnOf.harvester,
			max: numberOf.harvester,
			minEnergy: buildingPlans.harvester[rcl - 1].minEnergy
		},
		miniharvester: {
			name: "miniharvester",
			prio: 1,
			energyRole: true,
			min: 0,
			max: 0,
			minEnergy: buildingPlans.miniharvester[rcl - 1].minEnergy
		},
		miner: {
			name: "miner",
			prio: 11,
			energyRole: true,
			min: minimumSpawnOf.miner,
			max: numberOf.miner,
			minEnergy: buildingPlans.miner[rcl - 1].minEnergy
		},
		builder: {
			name: "builder",
			prio: 60,
			energyRole: false,
			min: minimumSpawnOf.builder,
			max: numberOf.builder,
			minEnergy: buildingPlans.builder[rcl - 1].minEnergy
		},
		repairer: {
			name: "repairer",
			prio: 170,
			energyRole: false,
			min: minimumSpawnOf.repairer,
			max: numberOf.repairer,
			minEnergy: buildingPlans.repairer[rcl - 1].minEnergy
		},
		wallRepairer: {
			name: "wallRepairer",
			prio: 130,
			energyRole: false,
			min: minimumSpawnOf.wallRepairer,
			max: numberOf.wallRepairer,
			minEnergy: buildingPlans.wallRepairer[rcl - 1].minEnergy
		},
		mineralHarvester: {
			name: "mineralHarvester",
			prio: 200,
			energyRole: false,
			min: minimumSpawnOf.mineralHarvester,
			max: numberOf.mineralHarvester,
			minEnergy: buildingPlans.mineralHarvester[rcl - 1].minEnergy
		},
		upgrader: {
			name: "upgrader",
			prio: 80,
			energyRole: false,
			min: minimumSpawnOf.upgrader,
			max: numberOf.upgrader,
			minEnergy: buildingPlans.upgrader[rcl - 1].minEnergy
		},
		runner: {
			name: "runner",
			prio: 15,
			energyRole: true,
			min: minimumSpawnOf.runner,
			max: numberOf.runner,
			minEnergy: buildingPlans.runner[rcl - 1].minEnergy
		},
		scientist: {
			name: "scientist",
			prio: 200,
			energyRole: false,
			min: minimumSpawnOf.scientist,
			max: numberOf.scientist,
			minEnergy: buildingPlans.scientist[rcl - 1].minEnergy
		},
		longDistanceHarvester: {
			name: "longDistanceHarvester",
			prio: 100,
			energyRole: true,
			min: minimumSpawnOf.longDistanceHarvester,
			max: numberOf.longDistanceHarvester,
			minEnergy: buildingPlans.longDistanceHarvester[rcl - 1].minEnergy
		},
		longDistanceMiner: {
			name: "longDistanceMiner",
			prio: 120,
			energyRole: true,
			min: minimumSpawnOf.longDistanceMiner,
			max: numberOf.longDistanceMiner,
			minEnergy: buildingPlans.longDistanceMiner[rcl - 1].minEnergy
		},
		claimer: {
			name: "claimer",
			prio: 145,
			energyRole: false,
			min: minimumSpawnOf.claimer,
			max: numberOf.claimer,
			minEnergy: buildingPlans.claimer[rcl - 1].minEnergy
		},
		bigClaimer: {
			name: "bigClaimer",
			prio: 160,
			energyRole: false,
			min: minimumSpawnOf.bigClaimer,
			max: numberOf.bigClaimer,
			minEnergy: buildingPlans.bigClaimer[rcl - 1].minEnergy
		},
		guard: {
			name: "guard",
			prio: 11,
			energyRole: false,
			min: minimumSpawnOf.guard,
			max: numberOf.guard,
			minEnergy: buildingPlans.guard[rcl - 1].minEnergy
		},
		demolisher: {
			name: "demolisher",
			prio: 230,
			energyRole: true,
			min: minimumSpawnOf.demolisher,
			max: numberOf.demolisher,
			minEnergy: buildingPlans.demolisher[rcl - 1].minEnergy
		},
		longDistanceLorry: {
			name: "longDistanceLorry",
			prio: 140,
			energyRole: true,
			min: minimumSpawnOf.longDistanceLorry,
			max: numberOf.longDistanceLorry,
			minEnergy: buildingPlans.longDistanceLorry[rcl - 1].minEnergy
		},
		longDistanceBuilder: {
			name: "longDistanceBuilder",
			prio: 70,
			energyRole: true,
			min: minimumSpawnOf.longDistanceBuilder,
			max: numberOf.longDistanceBuilder,
			minEnergy: buildingPlans.longDistanceBuilder[rcl - 1].minEnergy
		},
		attacker: {
			name: "attacker",
			prio: 80,
			energyRole: false,
			min: minimumSpawnOf.attacker,
			max: numberOf.attacker,
			minEnergy: buildingPlans.attacker[rcl - 1].minEnergy
		},
		archer: {
			name: "archer",
			prio: 80,
			energyRole: false,
			min: minimumSpawnOf.apaHatchi,
			max: numberOf.apaHatchi,
			minEnergy: buildingPlans.archer[rcl - 1].minEnergy
		},
		healer: {
			name: "healer",
			prio: 90,
			energyRole: false,
			min: minimumSpawnOf.healer,
			max: numberOf.healer,
			minEnergy: buildingPlans.healer[rcl - 1].minEnergy
		},
		einarr: {
			name: "einarr",
			prio: 50,
			energyRole: false,
			min: minimumSpawnOf.einarr,
			max: numberOf.einarr,
			minEnergy: buildingPlans.einarr[rcl - 1].minEnergy
		},
		transporter: {
			name: "transporter",
			prio: 2000,
			energyRole: false,
			min: minimumSpawnOf.transporter,
			max: numberOf.transporter,
			minEnergy: buildingPlans.transporter[rcl - 1].minEnergy
		},
		herocreep: {
			name: "herocreep",
			prio: 90,
			energyRole: false,
			min: minimumSpawnOf.herocreep,
			max: numberOf.herocreep,
			minEnergy: buildingPlans.herocreep[rcl - 1].minEnergy
		},
		scout: {
			name: "scout",
			prio: 20,
			energyRole: false,
			min: minimumSpawnOf.scout,
			max: numberOf.scout,
			minEnergy: buildingPlans.scout[rcl - 1].minEnergy
		}
	};

	if ((numberOf.harvester + numberOf.runner) == 0) {
		// Set up miniHarvester to spawn
		tableImportance.miniharvester.min = 1
	}

	tableImportance = _.filter(tableImportance, function (x) {
		return (!(x.min == 0 || x.min == x.max || x.max > x.min))
	});

	if (tableImportance.length > 0) {
		tableImportance = _.sortBy(tableImportance, "prio");

		let spawnList = [];
		for (let c in tableImportance) {
			for (let i = 0; i < (tableImportance[c].min - tableImportance[c].max); i++) {
				spawnList.push(tableImportance[c].name);
			}
		}

		/* var hostiles = spawnRoom.find(FIND_HOSTILE_CREEPS);

		//Surplus Upgrader Spawning
		if (numberOf.harvester + numberOf.runner > 0 && hostiles.length == 0 && spawnRoom.controller.level < 8) {
			let container = spawnRoom.find(FIND_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE
			});
			let containerEnergy = 0;
			for (let e in container) {
				containerEnergy += container[e].store[RESOURCE_ENERGY];
			}
			if (containerEnergy > (MINSURPLUSENERGY * spawnRoom.controller.level) + 100000) {
				//spawnList.push("upgrader");
			}
		} */

		return spawnList;
	} else {
		return null;
	}
};

Room.prototype.checkForHostiles = function (roomName) {
	//FIXME: add a check for friendly units
	var roomName = this
	var hostiles = roomName.find(FIND_HOSTILE_CREEPS);
	if (hostiles.length > 0) {
		var value = {};
		//check hostiles body composition
		var maxAttackBodyParts = 0;
		var maxHealBodyParts = 0;
		var maxCarryBodyParts = 0;
		var numberOfAttackBodyParts = 0;
		var numberOfHealBodyParts = 0;
		var numberOfCarryBodyParts = 0;
		var AttackBodyParts = 0;
		var HealBodyParts = 0;
		var carryBodyParts = 0;
		for (var h in hostiles) {
			AttackBodyParts = 0;
			HealBodyParts = 0;
			carryBodyParts = 0;
			for (var part in hostiles[h].body) {
				if (hostiles[h].body[part].type == ATTACK || hostiles[h].body[part].type == RANGED_ATTACK) {
					//attacking body part found
					AttackBodyParts++;
				}
				if (hostiles[h].body[part].type == HEAL) {
					//attacking body part found
					HealBodyParts++;
				}
				if (hostiles[h].body[part].type == CARRY) {
					//attacking body part found
					carryBodyParts++;
				}
			}
			if (AttackBodyParts > maxAttackBodyParts) {
				maxAttackBodyParts = AttackBodyParts;
				numberOfAttackBodyParts += AttackBodyParts;
			}
			if (HealBodyParts > maxHealBodyParts) {
				maxHealBodyParts = HealBodyParts;
				numberOfHealBodyParts += HealBodyParts;
			}
			if (carryBodyParts > maxCarryBodyParts) {
				maxCarryBodyParts = carryBodyParts;
				numberOfCarryBodyParts += carryBodyParts;
			}
		}

		value["numHostiles"] = hostiles.length;

		value["maxAttackBodyParts"] = maxAttackBodyParts;
		value["numberOfAttackBodyParts"] = numberOfAttackBodyParts;

		value["maxHealBodyParts"] = maxHealBodyParts;
		value["numberOfHealBodyParts"] = numberOfHealBodyParts;

		value["maxCarryBodyParts"] = maxCarryBodyParts;
		value["numberOfCarryBodyParts"] = numberOfCarryBodyParts;

		if (hostiles.length == 1 && maxAttackBodyParts == 0 && maxHealBodyParts == 0 && maxCarryBodyParts == 0) {
			value["scout"] = true
		}

		if (!_.isEmpty(hostiles[0].owner)) {
			value["username"] = hostiles[0].owner.username
		}

		return value;
	} else {
		return null;
	}
};

Room.prototype.getType = function (roomName) {
	const res = /[EW](\d+)[NS](\d+)/.exec(roomName);
	const [, EW, NS] = res;
	const EWI = EW % 10,
		NSI = NS % 10;
	if (EWI === 0 || NSI === 0) {
		return 'Highway';
	} else if (EWI === 5 && NSI === 5) {
		return 'Center';
	} else if (Math.abs(5 - EWI) <= 1 && Math.abs(5 - NSI) <= 1) {
		return 'SourceKeeper';
	} else {
		return 'Room';
	}
};