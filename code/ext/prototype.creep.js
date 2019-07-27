require("tools.creep-tasks");
var Tasks = require("tools.creep-tasks");

let builder = require('role.role.builder')
let upgrader = require('role.role.upgrader')
let harvester = require('role.role.harvester')
let longDistanceHarvester = require('role.role.longDistanceHarvester')
let claimer = require('role.role.claimer')
let miner = require('role.role.miner')
let guard = require('role.role.guard')
let einarr = require('role.role.einarr')
let runner = require('role.role.runner')
let scout = require('role.role.scout')
let transporter = require('role.role.transporter')
let mineralHarvester = require('role.role.mineralHarvester')
let longDistanceMiner = require('role.role.longDistanceMiner')
let longDistanceLorry = require('role.role.longDistanceLorry')
let longDistanceBuilder = require('role.role.longDistanceBuilder')
let scientist = require('role.role.scientist')
let wallRepairer = require('role.role.wallRepairer')
let herocreep = require('role.role.herocreep')
let demolisher = require('role.role.demolisher')


Creep.prototype.runRole =
	function () {
		//console.log(this)
		if (this.memory.role == 'builder') {
			builder.newTask(this)
		} else if (this.memory.role == 'upgrader') {
			upgrader.newTask(this)
		} else if (this.memory.role == 'harvester') {
			harvester.newTask(this)
		} else if (this.memory.role == 'longDistanceHarvester') {
			longDistanceHarvester.newTask(this)
		} else if (this.memory.role == 'claimer') {
			claimer.newTask(this)
		} else if (this.memory.role == 'miner') {
			miner.newTask(this)
		} else if (this.memory.role == 'guard') {
			guard.nonTask(this)
		} else if (this.memory.role == 'einarr') {
			einarr.nonTask(this)
		} else if (this.memory.role == 'runner') {
			runner.newTask(this)
		} else if (this.memory.role == 'scout') {
			scout.newTask(this)
		} else if (this.memory.role == 'transporter') {
			transporter.newTask(this)
		} else if (this.memory.role == 'mineralHarvester') {
			mineralHarvester.newTask(this)
		} else if (this.memory.role == 'longDistanceMiner') {
			longDistanceMiner.newTask(this)
		} else if (this.memory.role == 'longDistanceLorry') {
			longDistanceLorry.newTask(this)
		} else if (this.memory.role == 'longDistanceBuilder') {
			longDistanceBuilder.newTask(this)
		} else if (this.memory.role == 'scientist') {
			scientist.newTask(this)
		} else if (this.memory.role == 'wallRepairer') {
			wallRepairer.newTask(this)
		} else if (this.memory.role == 'herocreep') {
			herocreep.newTask(this)
		} else if (this.memory.role == 'demolisher') {
			demolisher.newTask(this)
		} else {
			console.log("error - missing creep " + this.name + " role " + this.memory.role + " " + this.room.name)
			//purge old/wrong roles
			if (this.memory.role == "spawnAttendant" || this.memory.role == "lorry") {
				this.suicide()
			}
		}
	};

Creep.prototype.getEnergy = function (creep, useSource) {
	// 1) storage, 2) continers, 3) harvest

	//if no hostiles around, go for dropped resources
	var hostiles = creep.room.find(FIND_HOSTILE_CREEPS)
	if (hostiles.length == 0) {
		//look for dropped resources
		var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
			filter: s => s.targetedBy.length == 0
		})
		if (!_.isEmpty(droppedEnergy)) {
			droppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
			creep.task = Tasks.pickup(droppedEnergy);
			return;
		}
		var tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => _.sum(t.store) > 0 && t.targetedBy.length == 0)
		if (!_.isEmpty(tombstones)) {
			tombstone = creep.pos.findClosestByRange(tombstones)
			if (!_.isEmpty(tombstone)) {
				if (!_.isEmpty(creep.room.storage)) {
					creep.task = Tasks.withdrawAll(tombstone);
					return;
				} else {
					creep.task = Tasks.withdraw(tombstone, RESOURCE_ENERGY);
					return;
				}
			}
		}
	}

	//get from terminal, when full
	if (!_.isEmpty(creep.room.terminal)) {
		if (creep.room.terminal.store[RESOURCE_ENERGY] > (creep.room.memory.resourceLimits.energy.minTerminal * 1.2)) {
			//we have excess energy, probably incoming
			creep.task = Tasks.withdraw(creep.room.terminal, RESOURCE_ENERGY);
			return;
		}
	}

	//get energy from main structures
	if (!_.isEmpty(creep.room.storage)) {
		var link = _.first(creep.room.storage.pos.findInRange(FIND_MY_STRUCTURES, 4, {
			filter: s => s.structureType == STRUCTURE_LINK && (s.energy >= creep.carryCapacity || s.energy == s.energyCapacity)
		}));
		if (!_.isEmpty(link)) {
			//get energy from link
			creep.task = Tasks.withdraw(link);
			return;
		} else {
			//link is empty, or nonexistent
			if (creep.room.storage.store[RESOURCE_ENERGY] > 100) {
				//get energy from storage
				creep.task = Tasks.withdraw(creep.room.storage);
				return true;
			} else {
				//storage is empty, get from containers
				var containers = creep.room.containers.filter(s => s.store[RESOURCE_ENERGY] >= creep.carryCapacity)
				if (!_.isEmpty(containers)) {
					var container = creep.pos.findClosestByRange(containers)
					if (!_.isEmpty(container)) {
						creep.task = Tasks.withdraw(container);
						return true;
					}
				}
			}
		}
	}

	// if no container was found and the Creep should look for Sources
	if (useSource) {
		let sources = creep.room.find(FIND_SOURCES);
		let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
		if (!_.isEmpty(unattendedSource)) {
			unattendedSource = creep.pos.findClosestByRange(unattendedSource);
			if (!_.isEmpty(unattendedSource)) {
				creep.task = Tasks.harvest(unattendedSource);
				creep.say(EM_HAMMER, true)
				return true;
			}
		} else {
			if (!_.isEmpty(sources)) {
				var targetSource = []
				var i = 0;
				for (var s of sources) {
					//check how many free space each has
					//console.log(JSON.stringify(s))
					var freeSpaces = creep.room.lookForAtArea(LOOK_TERRAIN, s.pos.y - 1, s.pos.x - 1, s.pos.y + 1, s.pos.x + 1, true);
					freeSpaces = freeSpaces.filter(f => f.terrain == "wall")
					//console.log(freeSpaces.length+" "+JSON.stringify(freeSpaces))

					//check how many targets it
					if (freeSpaces.length + s.targetedBy.length < 9) {
						targetSource[i] = s
						i++
					}
				}
				if (!_.isEmpty(targetSource)) {
					var rand = _.random(targetSource.length - 1)
					creep.task = Tasks.harvest(targetSource[rand]);
					creep.say(EM_HAMMER, true)
					return true;
				} else {
					var rand = _.random(sources.length - 1)
					creep.task = Tasks.harvest(sources[rand]);
					creep.say(EM_HAMMER, true)
					return true;
				}
			}
		}
	}
};

Creep.prototype.fillStructures = function (creep, workpart = false) {
	//FIXME: change to findClosestByRange, add targetedBy check

	//fill towers
	if (!_.isEmpty(creep.room.towers)) {
		var towers = creep.room.towers.filter(s => s.energy < 500)
		var tower = creep.pos.findClosestByRange(towers)
		if (!_.isEmpty(tower)) {
			creep.task = Tasks.transfer(tower);
			return true;
		}
	}

	//fill main structures
	var spawns = creep.room.spawns.filter(s => s.energy < s.energyCapacity && s.targetedBy.length == 0)
	var structure = creep.pos.findClosestByRange(spawns)
	if (!_.isEmpty(structure)) {
		creep.task = Tasks.transfer(structure);
		return true;
	}

	var extensions = creep.room.extensions.filter(s => s.energy < s.energyCapacity && s.targetedBy.length == 0)
	var structure = creep.pos.findClosestByRange(extensions)
	if (!_.isEmpty(structure)) {
		creep.task = Tasks.transfer(structure);
		return true;
	}

	//fill towers
	var towers = creep.room.towers.filter(s => s.energy < s.energyCapacity && s.targetedBy.length == 0)
	var tower = creep.pos.findClosestByRange(towers)
	if (!_.isEmpty(tower)) {
		creep.task = Tasks.transfer(tower);
		return true;
	}

	//fill labs with energy
	var labs = creep.room.find(FIND_MY_STRUCTURES, {
		filter: f => f.structureType == STRUCTURE_LAB && f.energy < f.energyCapacity
	})
	if (!_.isEmpty(labs)) {
		let lab = creep.pos.findClosestByRange(labs)
		creep.task = Tasks.transfer(lab);
		return true;
	}

	//fill powerSpawns with energy
	var powerSpawn = creep.room.find(FIND_MY_STRUCTURES, {
		filter: f => f.structureType == STRUCTURE_POWER_SPAWN && f.energy < f.energyCapacity
	})
	if (!_.isEmpty(powerSpawn)) {
		creep.task = Tasks.transfer(powerSpawn[0]);
		return true;
	}

	//fill upgrade container
	if (workpart) {
		var container = _.first(creep.room.controller.pos.findInRange(creep.room.containers, 2, {
			filter: f => f.store[RESOURCE_ENERGY] < f.storeCapacity && f.targetedBy.length == 0
		}))
		if (!_.isEmpty(container)) {
			creep.task = Tasks.transfer(container);
			return;
		}
	}

	//put into storage
	if (!_.isEmpty(creep.room.storage)) {
		creep.task = Tasks.transfer(creep.room.storage);
		return true;
	}

};

Creep.prototype.storeAllBut = function (resource) {
	// send creep to storage to empty itself into it, keeping one resource type. Use null to drop all resource types.
	// returns true if only carrying allowed resource
	if (arguments.length == 0 && _.sum(this.carry) == 0) {
		return true;
	}
	if (arguments.length == 1 && (_.sum(this.carry) == this.carry[resource] || _.sum(this.carry) == 0)) {
		return true;
	}

	if (_.sum(this.carry) > 0) {
		var targetContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_STORAGE);
		if (targetContainer == null) {
			targetContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
		}
		if (this.pos.getRangeTo(targetContainer) > 1) {
			this.travelTo(targetContainer);
		} else {
			for (var res in this.carry) {
				if (arguments.length == 1 && resource == res) {
					//keep this stuff
				} else {
					this.transfer(targetContainer, res);
				}
			}
		}
		return false;
	} else {
		return true;
	}
};

Creep.prototype.graffity = function () {
	//go sign the controller
	if (!_.isEmpty(this.room.controller.sign)) {
		if (this.room.controller.sign.text != roomSign) {
			this.task = Tasks.signController(this.room.controller, roomSign)
			return
		}
	} else {
		this.task = Tasks.signController(this.room.controller, roomSign)
		return
	}
};


Creep.prototype.findResource = function (resource, sourceTypes) {
	if (this.memory.targetBuffer != undefined) {
		let tempTarget = Game.getObjectById(this.memory.targetBuffer);
		if (tempTarget == undefined || this.memory.roomBuffer != this.room.name) {
			delete this.memory.targetBuffer;
		} else if (resource == RESOURCE_SPACE) {
			if (tempTarget.energy != undefined && tempTarget.energyCapacity - tempTarget.energy == 0) {
				delete this.memory.targetBuffer;
			} else if (tempTarget.storeCapacity != undefined && tempTarget.storeCapacity - _.sum(tempTarget.store) == 0) {
				delete this.memory.targetBuffer;
			}
		} else if (resource == RESOURCE_ENERGY && tempTarget.energy != undefined && tempTarget.energy == 0) {
			delete this.memory.targetBuffer;
		} else if (resource != RESOURCE_ENERGY && tempTarget.store[resource] == 0) {
			delete this.memory.targetBuffer;
		}
	}

	if (this.memory.targetBuffer != undefined && this.memory.resourceBuffer != undefined && this.memory.resourceBuffer == resource && Game.time % DELAYRESOURCEFINDING != 0) {
		//return buffered resource
		return Game.getObjectById(this.memory.targetBuffer);
	} else if (this.room.memory.roomArray != undefined) {
		let IDBasket = [];
		let tempArray = [];

		for (let argcounter = 1; argcounter < arguments.length; argcounter++) {
			// Go through requested sourceTypes
			switch (arguments[argcounter]) {
				case FIND_SOURCES:
					if (resource == RESOURCE_ENERGY) {
						tempArray = this.room.memory.roomArray.sources;
						for (var s in tempArray) {
							if (Game.getObjectById(tempArray[s]).energy > 0) {
								IDBasket.push(Game.getObjectById(tempArray[s]));
							}
						}
					}
					break;

				case STRUCTURE_EXTENSION:
					if (resource == RESOURCE_ENERGY) {
						tempArray = this.room.memory.roomArray.extensions;
						for (var s in tempArray) {
							if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
								IDBasket.push(Game.getObjectById(tempArray[s]));
							}
						}
					} else if (resource == RESOURCE_SPACE) {
						// Look for links with space left
						tempArray = this.room.memory.roomArray.extensions;
						for (var s in tempArray) {
							let container = Game.getObjectById(tempArray[s]);
							if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
								IDBasket.push(container);
							}
						}
					}
					break;

				case STRUCTURE_SPAWN:
					if (resource == RESOURCE_ENERGY) {
						tempArray = this.room.memory.roomArray.spawns;
						for (var s in tempArray) {
							if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
								IDBasket.push(Game.getObjectById(tempArray[s]));
							}
						}
					} else if (resource == RESOURCE_SPACE) {
						// Look for spawns with space left
						tempArray = this.room.memory.roomArray.spawns;
						for (var s in tempArray) {
							let container = Game.getObjectById(tempArray[s]);
							if (container.energy < container.energyCapacity) {
								IDBasket.push(container);
							}
						}
					}
					break;

				case STRUCTURE_LINK:
					if (resource == RESOURCE_ENERGY) {
						tempArray = this.room.memory.roomArray.links;
						for (var s in tempArray) {
							if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
								IDBasket.push(Game.getObjectById(tempArray[s]));
							}
						}
					} else if (resource == RESOURCE_SPACE) {
						// Look for links with space left
						tempArray = this.room.memory.roomArray.links;
						for (var s in tempArray) {
							let container = Game.getObjectById(tempArray[s]);
							if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
								IDBasket.push(container);
							}
						}
					}
					break;

				case STRUCTURE_TOWER:
					if (resource == RESOURCE_ENERGY) {
						tempArray = this.room.memory.roomArray.towers;
						for (var s in tempArray) {
							if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
								IDBasket.push(Game.getObjectById(tempArray[s]));
							}
						}
					} else if (resource == RESOURCE_SPACE) {
						// Look for links with space left
						tempArray = this.room.memory.roomArray.towers;
						for (var s in tempArray) {
							let container = Game.getObjectById(tempArray[s]);
							if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
								IDBasket.push(container);
							}
						}
					}
					break;

				case STRUCTURE_CONTAINER:
					if (resource == RESOURCE_SPACE) {
						// Look for containers with space left
						tempArray = this.room.memory.roomArray.containers;
						for (var s in tempArray) {
							if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).storeCapacity - _.sum(Game.getObjectById(tempArray[s]).store) > 0) {
								IDBasket.push(Game.getObjectById(tempArray[s]));
							}
						}
					} else {
						// Look for containers with resource
						tempArray = this.room.memory.roomArray.containers;
						for (var s in tempArray) {
							if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).store[resource] > 0) {
								IDBasket.push(Game.getObjectById(tempArray[s]));
							}
						}
					}
					break;

				case STRUCTURE_STORAGE:
					if (resource == RESOURCE_SPACE) {
						// Look for storage with space left
						if (this.room.storage != undefined && this.room.storage.storeCapacity - _.sum(this.room.storage.store) > 0) {
							IDBasket.push(this.room.storage);
						}
					} else {
						// Look for containers with resource
						if (this.room.storage != undefined && this.room.storage != undefined && this.room.storage.store[resource] > 0) {
							IDBasket.push(this.room.storage);
						}
					}
					break;

				case STRUCTURE_TERMINAL:
					if (resource == RESOURCE_SPACE) {
						// Look for storage with space left
						if (this.room.terminal != undefined && this.room.terminal.storeCapacity - _.sum(this.room.terminal.store) > 0) {
							IDBasket.push(this.room.terminal);
						}
					} else {
						// Look for containers with resource
						if (this.room.terminal != undefined && this.room.terminal.store[resource] > 0) {
							IDBasket.push(this.room.terminal);
						}
					}
					break;
			}
		}

		//Get path to collected objects
		var target = this.pos.findClosestByRange(IDBasket);
		this.memory.resourceBuffer = resource;
		if (target != null) {
			this.memory.targetBuffer = target.id;
			this.memory.roomBuffer = this.room.name;
			return target;
		} else {
			return null;
		}
	}
};

Creep.prototype.findWalkableExitToTargetRoom = function (targetRoom) {
	//all exit tiles as goals
	var goals = Game.rooms[targetRoom].find(FIND_EXIT)
	//navigate from random structur in the room itself
	var center = _.sample(Game.rooms[targetRoom].find(FIND_STRUCTURES, {
		filter: f => f.structureType != STRUCTURE_RAMPART &&
			f.structureType != STRUCTURE_WALL
	}))

	//find a valid path from center to exit
	let ret = PathFinder.search(
		center, goals, {
			roomCallback: function (roomName) {
				let room = Game.rooms[roomName];

				if (!room) return;
				let costs = new PathFinder.CostMatrix;

				room.find(FIND_STRUCTURES).forEach(function (struct) {
					if (struct.structureType !== STRUCTURE_WALL &&
						(struct.structureType !== STRUCTURE_RAMPART ||
							!struct.my)) {
						// Can't walk through non-walkable buildings
						costs.set(struct.pos.x, struct.pos.y, 0xff);
					}
				});
				return costs;
			},
		}
	);

	if (!ret.incomplete) {
		//we've found a valid path
		let exitPos = ret.path[ret.length]
		//get rooms around, to get the room to enter from
		let roomsAround = Game.map.describeExits(targetRoom);

		//mirror position for the exact tile, but in the other room
		let mirrorPos
		if (exitPos.x == 0) {
			//left
			mirrorPos = new RoomPosition(49, exitPos.y, roomsAround["7"])
		} else if (exitPos.x == 49) {
			//right
			mirrorPos = new RoomPosition(0, exitPos.y, roomsAround["3"])
		} else if (exitPos.y == 0) {
			//bottom
			mirrorPos = new RoomPosition(exitPos.x, 49, roomsAround["5"])
		} else if (exitPos.y == 49) {
			//top
			mirrorPos = new RoomPosition(exitPos.x, 0, roomsAround["1"])
		}

		if (!_.isEmpty(mirrorPos)) {
			//get a route that avoids target room to navigate around it to the room to enter from
			const route = Game.map.findRoute(this.room, mirrorPos.roomName, {
				routeCallback(roomName, fromRoomName) {
					if (roomName == targetRoom) { // avoid this room
						return Infinity;
					}
					return 1;
				}
			});
			//return route
			return route
			//the rest of the logic is on the creep itself
		} else {
			return "err"
		}
	} else {
		//no valid path found
		return false
		//let the creep deal with it
	}
};