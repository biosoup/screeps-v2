//empire management code

'use strict';

let tasks = require('tasks');
let task = require('task');
var market = require('base.market');


/**
 * TODO:
 * - notify/grafana when spawning recovery harvester
 */

class mngColony {
	/**
	 * Init the class
	 * @return {tasks}
	 */
	static init() {
		if (mngColony._init !== true) {
			mngColony._init = true;
		}
	}
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 * @this {tasks}
	 */
	constructor(empire, homeRoom) {
		mngColony.init();
		mngColony.taskList = empire.taskList
		this.homeRoom = homeRoom
	}

	get taskList() {
		return this._taskList;
	}
	set taskList(v) {
		this._taskList = v;
	}

	get homeRoom() {
		return this._homeRoom;
	}
	set homeRoom(v) {
		this._homeRoom = v;
	}

	/**
	 * Get memory
	 * @return {Object}
	 */
	get memory() {
		if (Memory.empire === undefined) Memory.empire = {};
		return Memory.empire;
	}

	addTask(task) {
		this.taskList.add(task);
	}

	/**
	 * Colony
	- creep
		- spawn a creep
	- room
		- room focus ?
		- build blueprint ?
		- build defences
		- build road
		- add safemode
	- surroundings
		- add remote harvest room
		- add remote minign room
		- abandon room
	- assigned empire tasks to a colony

	Room
	- is the end point for all tasks, so all above
	 */

	/*
        Functions:
- gather colony data
    - layout
    - rooms terrain
    - put all into segments
        - one segment for each colony?
- figure out current colony status
    - level
    - what is happening
    - what needs to happen
- figure current status
    - main room
    - remote rooms
    - interest rooms
- figure current tasks
    - run logic based on them
- run colony logic
    - flag logic
    - spawning
        - colony que
        - empire requests
        - prioritization
        - spawn assigment
        - creep memory preparation
    - link logic
    - storage logic
    - terminal logic
    - market logic
    - labs logic
- gather colony stats and send them to empire
- create room visuals
        */

	run() {
		//logic for each task needed done in the empire

		//console.log("Colony: " + this.homeRoom)

		if ((Game.time % DELAYSPAWNING) == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
			Game.rooms[this.homeRoom].creepSpawnRun(Game.rooms[this.homeRoom]);
		}

		// find all towers
		var towers = Game.rooms[this.homeRoom].towers
		var hostileValues = Game.rooms[this.homeRoom].checkForHostiles(this.homeRoom);
		try {
			if (!_.isEmpty(towers)) {
				//find hostiles in the room
				if (!_.isEmpty(hostileValues)) {
					if (hostileValues.numHostiles > 0) {
						if (Game.rooms[this.homeRoom].controller.safeMode == undefined) {
							var hostiles = Game.rooms[this.homeRoom].find(FIND_HOSTILE_CREEPS)
							//only attack when safe mode is not active
							for (var tower of towers) {
								tower.defend(hostiles);
							}
						}
					}
				} else {
					for (var tower of towers) {
						tower.healCreeps()
						if ((Game.time % 3) == 0) {
							tower.repairStructures();
						}
					}
				}
			}
		} catch (err) {
			console.log("TOWER ERR: " + tower + " " + err.stack)
		}

		//add room visuals
		if (Game.cpu.bucket > (CPU_THRESHOLD * 2)) {
			try {
				this.roomVisuals()
			} catch (err) {
				console.log("VISUALS ERR: " + this.homeRoom + " " + err.stack)
			}
		}

		// refresh every 10 ticks if we have no master spawn on our own room
		if ((Game.time % 10) == 0 && _.isEmpty(Game.rooms[this.homeRoom].memory.masterSpawn) &&
			Game.cpu.bucket > CPU_THRESHOLD) {

			Game.rooms[this.homeRoom].refreshData(this.homeRoom)
		}

		//refresh blueprints after RCL upgrade
		if ((Game.time % 10) == 0 && Game.rooms[this.homeRoom].controller.level > Game.rooms[this.homeRoom].memory.RCL && Game.cpu.bucket > CPU_THRESHOLD) {
			var response = this.baseRCLBuild()
			console.log(this.homeRoom + " RCL upgrade! " + response)
		}
		Game.rooms[this.homeRoom].memory.RCL = Game.rooms[this.homeRoom].controller.level;

		// refresh room data 
		if ((Game.time % DELAYFLOWROOMCHECK) == 0 &&
			Game.cpu.bucket > CPU_THRESHOLD &&
			Game.rooms[this.homeRoom].controller != undefined &&
			Game.rooms[this.homeRoom].controller.owner != undefined &&
			Game.rooms[this.homeRoom].controller.owner.username == playerUsername || ROOMARRAY_REFRESH == true) {

			//refresh room data
			Game.rooms[this.homeRoom].refreshData(this.homeRoom)
			//refreshed room buildings
			this.baseRCLBuild()
		}

		if ((Game.time % 10) == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
			//run link balancing
			//this.linksRun()
			this.linkBalance()

			//refresh refresh remote containers
			this.refreshContainerSources()
		}

		if (Game.cpu.bucket > CPU_THRESHOLD * 2 && Game.rooms[this.homeRoom].controller.my) {
			try {
				// default resource limits
				market.resourceLimits(this.homeRoom);
				// balance resources
				market.resourceBalance();
				// terminal transfers
				market.terminalCode(this.homeRoom);

				market.productionCode(this.homeRoom);

				market.labCode(this.homeRoom);
			} catch (err) {
				console.log("ROOM FNC ERR: " + this.homeRoom + " " + err.stack)
			}
		}

		if (Game.cpu.bucket > CPU_THRESHOLD * 2) {
			//run market code
			try {
				market.marketCode();
			} catch (err) {
				console.log("ROOM FNC ERR: " + this.homeRoom + " " + err.stack)
			}

		}

		var powerSpawn = _.first(Game.rooms[this.homeRoom].find(FIND_STRUCTURES, {
			filter: f => f.structureType == STRUCTURE_POWER_SPAWN
		}))
		if (!_.isEmpty(powerSpawn) && (Game.rooms[this.homeRoom].storage.store[RESOURCE_ENERGY] > (MINSURPLUSENERGY * Game.rooms[this.homeRoom].controller.level)) && Game.cpu.bucket > CPU_THRESHOLD) {
			if (powerSpawn.energy >= 50 && powerSpawn.power >= 1) {
				powerSpawn.processPower()
			}
		}

		if (!_.isEmpty(hostileValues)) {
			if (hostileValues.numHostiles > 0) {
				if (hostileValues.numberOfAttackBodyParts > 0) {
					var avaliableGuards = _.filter(Game.creeps, (c) => (c.memory.role == 'guard' || c.memory.role == "einarr") && c.memory.target == this.homeRoom)
					if ((Game.time % 3) == 0 && hostileValues.username != "Invader") {
						console.log("Hostiles in " + this.homeRoom + ": " + hostileValues.username + "! " + hostileValues.numHostiles + " hostile with " + hostileValues.numberOfAttackBodyParts + " ATTACK and " + hostileValues.numberOfHealBodyParts + " HEAL. Response team of: " + avaliableGuards.length)
					}
				}
			}

			if (Game.rooms[this.homeRoom].controller.my) {
				//check for hostiles
				if (hostileValues.username != "Invader") {
					//activate safemode, when non-invaders get too close to spawn
					var closeRange = 0;

					var closeRangeHostile = Game.rooms[this.homeRoom].spawns[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
						filter: f => f.owner.username != "Invader"
					})
					closeRange = Game.rooms[this.homeRoom].spawns[0].pos.getRangeTo(closeRangeHostile);


					//console.log("close range:" + closeRange+" "+closeRangeHostile)

					//if hostile is closer than 6 -> safemode
					if (closeRange < 6 && closeRange > 0 && Game.rooms[this.homeRoom].controller.safeModeAvailable > 0) {
						Game.rooms[this.homeRoom].controller.activateSafeMode()
						console.log("WARNING: Hostile too close!! SAFEMODE!!")
					} else if (!_.isEmpty(Game.rooms[this.homeRoom].storage)) {
						if (Game.rooms[this.homeRoom].storage.store[RESOURCE_ENERGY] > 100000) {
							//we have energy, do siege mode
							//TODO: implement siege mode
						} else {
							//no energy left, ask for help

							//get closest other spawns
							var flagRoomName = this.homeRoom
							var distance = {}
							for (let room in Game.rooms) {
								var r = Game.rooms[room];
								if (!_.isEmpty(r.memory.roomArray.spawns)) {
									if (r.name != flagRoomName) {
										distance[r.name] = {}
										distance[r.name].name = r.name
										distance[r.name].dist = Game.map.getRoomLinearDistance(r.name, flagRoomName);
									}
								}
							}
							var distanceName = _.first(_.map(_.sortByOrder(distance, ['dist'], ['asc']), _.values))[0];

							//check if flag does not exists
							var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.words(f.name, /[^-]+/g)[1] == Game.rooms[this.homeRoom].name)
							if (_.isEmpty(whiteFlags)) {
								//set a flag
								Game.rooms[this.homeRoom].createFlag(25, 25, "DEFEND-" + this.homeRoom + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
								console.log(this.homeRoom + " in troubles!! Sending response team!!")
							}
						}
					} else {
						//no avaliable storage and no safe modes –> send response team
						if (Game.rooms[this.homeRoom].controller.safeMode == undefined) {

							//get closest other spawns
							var flagRoomName = this.homeRoom
							var distance = {}
							for (let room in Game.rooms) {
								var r = Game.rooms[room];
								if (!_.isEmpty(r.memory.roomArray)) {
									if (!_.isEmpty(r.memory.roomArray.spawns)) {
										if (r.name != flagRoomName) {
											distance[r.name] = {}
											distance[r.name].name = r.name
											distance[r.name].dist = Game.map.getRoomLinearDistance(r.name, flagRoomName);
										}
									}
								}
							}
							if (!_.isEmpty(distance)) {
								var distanceName = _.first(_.map(_.sortByOrder(distance, ['dist'], ['asc']), _.values))[0];

								//check if flag does not exists
								var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.words(f.name, /[^-]+/g)[1] == Game.rooms[this.homeRoom].name)
								if (_.isEmpty(whiteFlags)) {
									//set a flag
									Game.rooms[this.homeRoom].createFlag(25, 25, "DEFEND-" + this.homeRoom + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
									console.log(this.homeRoom + " in troubles!! Sending response team!!")
								}
							} else {
								//no room to send help from
								console.log("No room to send help :(")
							}

						}
					}
				}
			}
		}
	}

	roomVisuals() {
		let cpuStart = Game.cpu.getUsed();
		var room = Game.rooms[this.homeRoom]
		var rcl = room.controller.level

		if (rcl == 0) {
			//run only in relevant rooms
			return null
		}

		var numberOfSources = room.find(FIND_SOURCES).length

		var maxEnergyIncome = (numberOfSources * SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME //max 20 e/t

		//in room miners
		var numberOfMiners = _.filter(Game.creeps, (c) => c.memory.home == room.name && c.memory.role == "miner");
		//var miningPerTick = _.countBy(buildingPlans.miner[rcl].body).work * HARVEST_POWER
		var miningPerTickMax = (numberOfMiners.length * SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME

		//remote miners
		var numberOfRemoteMiners = _.filter(Game.creeps, (c) => c.memory.home == room.name && c.memory.role == "longDistanceMiner");
		//var remoteMiningPerTick = _.countBy(buildingPlans.longDistanceMiner[rcl].body).work * HARVEST_POWER
		var remoteMiningPerTickMax = (numberOfRemoteMiners.length * SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME

		var numberOfRoads = room.find(FIND_STRUCTURES, {
			filter: (f) => f.structureType == STRUCTURE_ROAD
		}).length
		var roadDecay = (numberOfRoads * ROAD_DECAY_AMOUNT) / ROAD_DECAY_TIME / REPAIR_POWER //without wearout, non spawm roads only

		var numberOfRamparts = room.find(FIND_STRUCTURES, {
			filter: (f) => f.structureType == STRUCTURE_RAMPART
		}).length
		var rampartsDecay = (numberOfRamparts * RAMPART_DECAY_AMOUNT) / RAMPART_DECAY_TIME / REPAIR_POWER

		var numberOfContainers = room.find(FIND_STRUCTURES, {
			filter: (f) => f.structureType == STRUCTURE_CONTAINER
		}).length
		var containersDecay = (numberOfContainers * CONTAINER_DECAY) / CONTAINER_DECAY_TIME_OWNED / REPAIR_POWER



		//energy needed for construction
		var constructions = room.find(FIND_CONSTRUCTION_SITES)
		var constructionCost = _.sum(constructions, "progressTotal") - _.sum(constructions, "progress")

		//energy needed for walls
		var numberOfWallRepairers = _.filter(Game.creeps, (c) => c.memory.home == room.name && (c.memory.role == "wallRepairer" || c.memory.role == "builder"));
		if (!_.isEmpty(buildingPlans.wallRepairer[rcl])) {
			var fortifyPerTickMax = _.countBy(buildingPlans.wallRepairer[rcl].body).work * REPAIR_POWER
			var fortifyCostPerTick = _.countBy(buildingPlans.wallRepairer[rcl].body).work //costs one nergy per work part
		} else {
			var fortifyPerTickMax = 0
			var fortifyCostPerTick = 0
		}
		var structuresToBeFortified = room.find(FIND_STRUCTURES, {
			filter: (f) => f.structureType == STRUCTURE_WALL || f.structureType == STRUCTURE_RAMPART
		})
		var fortifyWorkLeft = (structuresToBeFortified.length * WALLMAX) - _.sum(structuresToBeFortified, "hits")
		var fortifyWorkLeftTicks = fortifyWorkLeft / fortifyPerTickMax
		if (fortifyWorkLeftTicks < 0) {
			fortifyWorkLeftTicks = 0
		}

		//rcl
		var praiseLeft = room.controller.progressTotal - room.controller.progress

		var oldProgress = room.memory.RCLprogress
		var amountPraisedLastTick = room.controller.progress - oldProgress
		room.memory.RCLprogress = room.controller.progress

		//aproximate amount energy avalible per tick
		var energySurpluss = miningPerTickMax + remoteMiningPerTickMax - roadDecay - rampartsDecay - containersDecay - (numberOfWallRepairers.length * fortifyCostPerTick)

		//storage
		if (!_.isEmpty(room.storage)) {
			var storageEnergy = room.storage.store[RESOURCE_ENERGY]
			var storageTarget = MINSURPLUSENERGY * rcl
			var ticksToStorageTarget = ((storageTarget - storageEnergy) / energySurpluss).toFixed(2)
		}

		room.visual.text("Room: energy production: " + (remoteMiningPerTickMax + miningPerTickMax) + " with " + numberOfRemoteMiners.length + " remote miners",
			2, 5, {
				size: '0.7',
				align: 'left',
				opacity: 0.5,
				'backgroundColor': '#040404',
				color: 'white'
			});
		room.visual.text("Roads: " + roadDecay.toFixed(2) + " | Ramparts: " + rampartsDecay.toFixed(2) + " | Containers: " + containersDecay.toFixed(2) + " | F/R/B: " + (numberOfWallRepairers.length * fortifyCostPerTick).toFixed(2),
			2, 6, {
				size: '0.7',
				align: 'left',
				opacity: 0.5,
				'backgroundColor': '#040404',
				color: 'white'
			});
		room.visual.text("Energy surpluss: " + energySurpluss.toFixed(2) + " | construction cost left: " + constructionCost + " | fortify left: " + fortifyWorkLeftTicks.toFixed(2) + " ticks",
			2, 7, {
				size: '0.7',
				align: 'left',
				opacity: 0.5,
				'backgroundColor': '#040404',
				color: 'white'
			});
		room.visual.text("RCL Praise left: " + praiseLeft.toFixed(2) + " (" + (praiseLeft / energySurpluss).toFixed(2) + " ticks) | Praised last tick: " + amountPraisedLastTick + " (" + (praiseLeft / amountPraisedLastTick).toFixed(2) + " ticks)",
			2, 8, {
				size: '0.7',
				align: 'left',
				opacity: 0.5,
				'backgroundColor': '#040404',
				color: 'white'
			});
		room.visual.text("Storage energy target: " + storageTarget + " | Ticks to reach: " + ticksToStorageTarget + " | (CPU used: " + (Game.cpu.getUsed() - cpuStart).toFixed(2) + ")",
			2, 9, {
				size: '0.7',
				align: 'left',
				opacity: 0.5,
				'backgroundColor': '#040404',
				color: 'white'
			});

		var rclPercent = (room.controller.progress / room.controller.progressTotal * 100).toFixed(2)
		var rclLeft = (room.controller.progressTotal - room.controller.progress).toFixed(2)
		var gcl = Game.gcl.level
		var gclPercent = (Game.gcl.progress / Game.gcl.progressTotal * 100).toFixed(2)
		var gclLeft = (Game.gcl.progressTotal - Game.gcl.progress).toFixed(2)

		room.visual.text("GCL: level " + gcl + " | " + gclPercent + "% progress left: " + gclLeft, 2, 2, {
			size: '0.7',
			align: 'left',
			opacity: 0.5,
			'backgroundColor': '#040404',
			color: 'white'
		});

		room.visual.text("RCL: level " + rcl + " | " + rclPercent + "% progress left: " + rclLeft, 2, 3, {
			size: '0.7',
			align: 'left',
			opacity: 0.5,
			'backgroundColor': '#040404',
			color: 'white'
		});

		if (!_.isEmpty(room.spawns)) {
			var spawningCreep = {}
			for (var s in room.spawns) {
				var spawnName = room.spawns[s]
				//if spawning just add visuals
				if (spawnName.spawning) {
					spawningCreep[spawnName] = {}
					spawningCreep[spawnName].name = spawnName.spawning.name;
					spawningCreep[spawnName].percent = (((spawnName.spawning.needTime - spawnName.spawning.remainingTime) / spawnName.spawning.needTime) * 100).toFixed(2);
				}
			}
			var i = 0
			if (!_.isEmpty(spawningCreep)) {
				for (var s in spawningCreep) {
					room.visual.text(
						spawningCreep[s].percent + '% ' + spawningCreep[s].name + ' ', 47, 2 + i, {
							size: '0.7',
							align: 'right',
							opacity: 0.5,
							'backgroundColor': '#040404',
							color: 'white'
						});
					i++;
				}
			}
		}

	}

	baseBunker(spawnName) {
		//TODO: finish this
		//build a rampart bunker around spawn
		var s1 = Game.spawns[spawnName]
		var tlc = new RoomPosition(s1.pos.x - 5, s1.pos.y - 9, s1.pos.roomName) //top left corner
		var brc = new RoomPosition(s1.pos.x + 5, s1.pos.y + 4, s1.pos.roomName) //bottom right corner
		var rcl = room.controller.level
		var room = Game.rooms[s1.pos.roomName];
		var numberOfTowers = room.find(FIND_MY_STRUCTURES, {
			filter: f => f.structureType == STRUCTURE_TOWER
		})

		if (rcl >= 4 && numberOfTowers.length >= 1) {
			//find important buildings
			//check if they have rampart
			//place rampart

			//place ramparts on the edge
			//check if there is no wall
		}
	}

	baseRCLBuildCheck() {
		var room = Game.rooms[this.homeRoom];
		if (!_.isEmpty(room.memory.masterSpawn)) {
			var s1 = Game.getObjectById(room.memory.masterSpawn)
		} else {
			return null
		}
		var tlc = new RoomPosition(s1.pos.x - 5, s1.pos.y - 9, s1.pos.roomName)
		room = Game.rooms[s1.pos.roomName];
		var base = baseRCL2; //check against lvl2

		if (!_.isEmpty(base.buildings.extension)) {
			var extensionsCount = 0
			for (var s of base.buildings.extension.pos) {
				//go through different buildings
				var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
				var place = room.lookForAt(LOOK_STRUCTURES, destination)

				place = _.filter(place, (f) => f.structureType == STRUCTURE_EXTENSION)

				if (place.length > 0) {
					extensionsCount = extensionsCount + 1
					//something here, chech for extension
				} else {
					//nothing there, which is bad
				}
			}
		}

		if (extensionsCount == 5) {
			return true;
		} else {
			return false;
		}
	}

	baseRCLBuild() {
		//concole command: 
		// Game.rooms.E15N12.baseRCLBuild()

		var room = Game.rooms[this.homeRoom];
		if (!_.isEmpty(room.memory.masterSpawn)) {
			var s1 = Game.getObjectById(room.memory.masterSpawn)
		} else {
			return null
		}
		var tlc = new RoomPosition(s1.pos.x - 5, s1.pos.y - 9, s1.pos.roomName)
		var rcl = room.controller.level
		room = Game.rooms[s1.pos.roomName];

		if (!this.baseRCLBuildCheck() && rcl > 2) {
			//not current layout
			return "not current layout";
		}


		//fixed placement for each RCL level
		switch (rcl) {
			case 1:
				//FIXME:
				//containers for sources
				for (var s in room.sources) {
					//set containers for sources
					var freeSpaces = s.room.lookForAtArea(LOOK_TERRAIN, s.pos.y - 1, s.pos.x - 1, s.pos.y + 1, s.pos.x + 1, true);
					freeSpaces = freeSpaces.filter(f => f.terrain != "wall" && f.terrain != "source")
					var closestPlaceForContainer = s1.pos.findClosestByRange(freeSpaces) // <- isuue here??
					room.createConstructionSite(closestPlaceForContainer.pos.x, closestPlaceForContainer.pos.y, STRUCTURE_CONTAINER)
				}

				//container for controller
				var freeSpaces = room.controller.room.lookForAtArea(LOOK_TERRAIN, room.controller.pos.y - 1, room.controller.pos.x - 1, room.controller.pos.y + 1, room.controller.pos.x + 1, true);
				freeSpaces = freeSpaces.filter(f => f.terrain != "wall" && f.terrain != "controller")
				var closestPlaceForContainer = s1.pos.findClosestByRange(freeSpaces)
				room.createConstructionSite(closestPlaceForContainer.pos.x, closestPlaceForContainer.pos.y, STRUCTURE_CONTAINER)

				break
			case 2:
				//+5 extensions, ramparts, walls
				if (!_.isEmpty(baseRCL2)) {
					var base = baseRCL2
				}
				break
			case 3:
				//+5 extensions, +1 tower
				if (!_.isEmpty(baseRCL3)) {
					var base = baseRCL3
				}
				break
			case 4:
				//+10 extensions, storage
				if (!_.isEmpty(baseRCL4)) {
					var base = baseRCL4
				}

				if (!_.isEmpty(baseRCLdefences)) {
					//TODO: adjust postition x-1, y-1 & add to the base array

				}
				break
			case 5:
				//+10 extensions, +1 tower, 2 links
				if (!_.isEmpty(baseRCL5)) {
					var base = baseRCL5
				}
				break
			case 6:
				//+10 extensions, +1 link, extractor, 3 labs, terminal
				if (!_.isEmpty(baseRCL6)) {
					var base = baseRCL6
				}

				//build an extractor
				var mineral = _.first(room.find(FIND_MINERALS))
				if (!_.isEmpty(mineral)) {
					if (_.isEmpty(room.extractor)) {
						var place = room.lookForAt(LOOK_STRUCTURES, mineral)
						if (place.length == 0) {
							room.createConstructionSite(mineral, STRUCTURE_EXTRACTOR)
						}
						//and build a road for it
						room.buildRoad(room.storage.id, mineral.id)
					}
				}

				// define inner labs, only when build
				if (room.labs.length >= 3 && room.memory.innerLabs[0].labID == "[LAB_ID]" && room.memory.innerLabs[1].labID == "[LAB_ID]") {
					//labs IDs not defined

					//look for stuctures
					var lab0 = _.first(_.filter(room.lookForAt(LOOK_STRUCTURES, tlc.x + 5, tlc.y + 1), f => f.structureType == STRUCTURE_LAB))
					var lab1 = _.first(_.filter(room.lookForAt(LOOK_STRUCTURES, tlc.x + 5, tlc.y + 2), f => f.structureType == STRUCTURE_LAB))
					console.log("Lab0: " + lab0.id + " Lab1: " + lab1.id)
					//check if they are truly there
					if (!_.isEmpty(lab0.id) && !_.isEmpty(lab1.id)) {
						room.memory.innerLabs[0].labID = lab0.id;
						room.memory.innerLabs[1].labID = lab1.id;
					}
				}
				break
			case 7:
				//+10 extensions, +1 tower, +1 link, +3 labs, +1 spawn
				if (!_.isEmpty(baseRCL7)) {
					var base = baseRCL7
				}
				break
			case 8:
				//+10 extensions, +3 tower, +2 link, +1 spawn, +4 labs, observer, power spawn
				if (!_.isEmpty(baseRCL8)) {
					var base = baseRCL8
				}
				break
		}

		if (!_.isEmpty(base)) {
			//place the buildings
			if (!_.isEmpty(base.buildings.extension)) {
				for (var s of base.buildings.extension.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)

					//console.log(JSON.stringify(destination) + " " + place.length)

					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_EXTENSION)
					}
				}
			}
			if (!_.isEmpty(base.buildings.tower)) {
				for (var s of base.buildings.tower.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_TOWER)
					}
				}
			}
			if (!_.isEmpty(base.buildings.storage)) {
				for (var s of base.buildings.storage.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_STORAGE)
					}
				}
			}
			if (!_.isEmpty(base.buildings.road)) {
				for (var s of base.buildings.road.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					const terrain = room.getTerrain();
					var tile = terrain.get(tlc.x + s.x, tlc.y + s.y)
					if (place.length > 0 || tile == TERRAIN_MASK_WALL) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_ROAD)
					}
				}
			}
			if (!_.isEmpty(base.buildings.terminal)) {
				for (var s of base.buildings.terminal.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_TERMINAL)
					}
				}
			}
			if (!_.isEmpty(base.buildings.link)) {
				for (var s of base.buildings.link.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_LINK)
					}
				}
			}
			if (!_.isEmpty(base.buildings.spawn)) {
				for (var s of base.buildings.spawn.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_SPAWN)
					}
				}
			}
			if (!_.isEmpty(base.buildings.nuker)) {
				for (var s of base.buildings.nuker.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_NUKER)
					}
				}
			}
			if (!_.isEmpty(base.buildings.lab)) {
				for (var s of base.buildings.lab.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_LAB)
					}
				}
			}
			if (!_.isEmpty(base.buildings.powerSpawn)) {
				for (var s of base.buildings.powerSpawn.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_POWER_SPAWN)
					}
				}
			}
			if (!_.isEmpty(base.buildings.observer)) {
				for (var s of base.buildings.observer.pos) {
					//go through different buildings
					var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
					var place = room.lookForAt(LOOK_STRUCTURES, destination)
					if (place.length > 0) {
						//something here
					} else {
						//nothing there
						room.createConstructionSite(destination, STRUCTURE_OBSERVER)
					}
				}
			}
			return base.rcl
		} else {
			return null
		}
	}

	linkBalance() {
		let r = Game.rooms[this.homeRoom]
		let links = r.links
		if (!_.isEmpty(links)) {
			//we have links in room
			let sourceLinks = []
			let controllerLinks = []
			let coreLinks = []
			if (!_.isEmpty(r.memory.links)) {
				//find the place of links
				if (links.length >= 2 && r.memory.links.number < links.length && r.memory.links["controllerLinks"].length == 0) {
					//update links
					for (let l in links) {
						let nearSource = links[l].pos.findInRange(FIND_SOURCES, 3)
						if (nearSource.length > 0) {
							//link is nearby source -> consider it source link
							sourceLinks.push(links[l].id)
						} else {
							let nearController = links[l].pos.findInRange(FIND_STRUCTURES, 3, {
								filter: f => f.structureType == STRUCTURE_CONTROLLER
							})
							if (nearController.length > 0) {
								controllerLinks.push(links[l].id)
							} else {
								let nearCore = links[l].pos.findInRange(FIND_STRUCTURES, 3, {
									filter: f => f.structureType == STRUCTURE_STORAGE
								})
								if (nearCore.length > 0) {
									coreLinks.push(links[l].id)
								}
							}
						}
					}
					r.memory.links["sourceLinks"] = sourceLinks
					r.memory.links["controllerLinks"] = controllerLinks
					r.memory.links["coreLinks"] = coreLinks
					r.memory.links["number"] = links.length
				}

				controllerLinks = r.memory.links["controllerLinks"]
				sourceLinks = r.memory.links["sourceLinks"]
				coreLinks = r.memory.links["coreLinks"]

				//controller balancing
				if (controllerLinks.length >= 1) {
					for (let cl in controllerLinks) {
						let cLink = Game.getObjectById(controllerLinks[cl])
						if (cLink.energy < (cLink.energyCapacity - 100)) {
							//refill controller link
							for (let sl in sourceLinks) {
								let sLink = Game.getObjectById(sourceLinks[sl])
								if (sLink.energy > 100 && sLink.cooldown == 0) {
									//source link has enough energy
									let amount = cLink.energyCapacity - cLink.energy
									if (amount > sLink.energy) amount = sLink.energy;
									let response = sLink.transferEnergy(cLink, amount)
									if (response == 0) {
										console.log("Balancing controller link, sending: " + amount)
										break
									}
								}
							}
						}
					}
				}

				//core balancing
				if (coreLinks.length >= 1) {
					for (let bl in coreLinks) {
						let bLink = Game.getObjectById(coreLinks[bl])
						if (bLink.energy < (bLink.energyCapacity - 100)) {
							//refill controller link
							for (let sl in sourceLinks) {
								let sLink = Game.getObjectById(sourceLinks[sl])
								if (sLink.energy > 100 && sLink == 0) {
									//source link has enough energy
									let amount = bLink.energyCapacity - bLink.energy
									if (amount > sLink.energy) amount = sLink.energy;
									let response = sLink.transferEnergy(bLink, amount)
									if (response == 0) {
										console.log("Balancing core link, sending: " + amount)
										break
									}
								}
							}
						}
					}
				}
			} else {
				//create memory space for links
				if (_.isEmpty(r.memory.links)) {
					r.memory.links = {}
					r.memory.links["sourceLinks"] = []
					r.memory.links["controllerLinks"] = []
					r.memory.links["coreLinks"] = []
					r.memory.links["number"] = 0
				}
			}
		}
	}

	linksRun() {
		let r = Game.rooms[this.homeRoom]
		// Link code
		if (Game.rooms[r].memory.roomArray != undefined && Game.rooms[r].memory.roomArray.links != undefined && Game.rooms[r].memory.roomArray.links.length > 1) {
			var fillLinks = [];
			var emptyLinks = [];
			var targetLevel = 0;

			if (Game.rooms[r].memory.linksEmpty == undefined) {
				// Prepare link roles
				var emptyArray = [];
				emptyArray.push("[LINK_ID]");
				Game.rooms[r].memory.linksEmpty = emptyArray;
			}

			for (var link in Game.rooms[r].memory.roomArray.links) {
				if (Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]) != undefined) {
					if (Game.rooms[r].memory.linksEmpty == undefined || Game.rooms[r].memory.linksEmpty.indexOf(Game.rooms[r].memory.roomArray.links[link]) == -1) {
						fillLinks.push(Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]));
						targetLevel += Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]).energy;
					} else {
						emptyLinks.push(Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]));
					}
				}
			}
			targetLevel = Math.ceil(targetLevel / fillLinks.length / 100); //Targetlevel is now 0 - 8
			fillLinks = _.sortBy(fillLinks, "energy");
			//Empty emptyLinks
			for (var link in emptyLinks) {
				if (emptyLinks[link].cooldown == 0 && emptyLinks[link].energy > 0) {
					for (var i = 0; i < fillLinks.length; i++) {
						if (fillLinks[i].energy < 800) {
							if (fillLinks[i].energy + emptyLinks[link].energy < 799) {
								emptyLinks[link].transferEnergy(fillLinks[i], emptyLinks[link].energy);
							} else if (fillLinks[i].energy < 790) {
								emptyLinks[link].transferEnergy(fillLinks[i], (800 - fillLinks[i].energy));
							}
						}
					}
					break;
				}
			}
			fillLinks = _.sortBy(fillLinks, "energy");

			if (targetLevel > 0 && fillLinks.length > 1) {
				var minLevel = 99;
				var maxLevel = 0;
				var maxLink;
				var minLink;

				for (var link in fillLinks) {
					if (Math.ceil(fillLinks[link].energy / 100) <= targetLevel && Math.ceil(fillLinks[link].energy / 100) <= minLevel) {
						//Receiver link
						minLevel = Math.ceil(fillLinks[link].energy / 100);
						minLink = fillLinks[link];
					} else if (fillLinks[link].cooldown == 0 && Math.ceil(fillLinks[link].energy / 100) >= targetLevel && Math.ceil(fillLinks[link].energy / 100) >= maxLevel) {
						//Sender link
						maxLevel = Math.ceil(fillLinks[link].energy / 100);
						maxLink = fillLinks[link];
					}
				}

				if (maxLink != undefined && maxLink.id != minLink.id && fillLinks.length > 1 && maxLevel > targetLevel) {
					maxLink.transferEnergy(minLink, (maxLevel - targetLevel) * 100);
				}
			}
		}
	}

	checkForDefeat() {
		let spawnRoom = Game.rooms[this.homeRoom]
		if (_.isEmpty(spawnRoom.controller.owner)) {
			//check for DEMOLITION flag
			var demoFlags = _.filter(Game.flags, (f) => f.color == COLOR_ORANGE && f.pos.roomName == spawnRoom.name)
			if (!_.isEmpty(demoFlags)) {
				return "demolition in progress"
			}

			var hostiles = spawnRoom.find(FIND_HOSTILE_CREEPS)
			if (hostiles.length == 0) {
				//get closest other spawns
				var flagRoomName = spawnRoom.name
				var distance = {}
				for (let roomName in Game.rooms) {
					var r = Game.rooms[roomName];
					if (!_.isEmpty(r.memory.roomArray.spawns)) {
						if (r.name != flagRoomName) {
							distance[r.name] = {}
							distance[r.name].name = r.name
							distance[r.name].dist = Game.map.getRoomLinearDistance(r.name, flagRoomName);
						}
					}
				}
				var distanceName = _.first(_.map(_.sortByOrder(distance, ['dist'], ['asc']), _.values))[0];

				spawnRoom.createFlag(25, 25, "DEFEND-" + spawnRoom.name + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
				console.log(spawnRoom.name + " has been defeated!! Sending recovery team!!")

				//FIXME: claim flag only when safe –> when full complement of guards is in place

				//var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == spawnRoom.name)

				//spawnRoom.createFlag(24, 24, "CLAIM-" + spawnRoom.name + "-" + distanceName, COLOR_GREY, COLOR_PURPLE)
			} else {
				console.log(spawnRoom.name + " has been defeated!! Occupied by " + hostiles.length)
			}
			return true;
		} else {
			var greyFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && f.pos.roomName == spawnRoom.name)
			if (spawnRoom.controller.level >= 3 && !_.isEmpty(greyFlags) && !_.isEmpty(spawnRoom.towers)) {
				//console.log(JSON.stringify(greyFlags))
				for (var flag of greyFlags) {
					flag.remove()
				}
			}
			return false;
		}
	}

	refreshContainerSources() {
		let r = Game.rooms[this.homeRoom];
		//get home room storage
		if (!_.isEmpty(r.storage)) {
			//get rooms with longDistanceMiners in it
			var allMinerCreeps = _.filter(Game.creeps, (c) => c.memory.home == r.name && c.memory.role == "longDistanceMiner");
			var inRooms = _.map(allMinerCreeps, "memory.target")

			//get continers in those rooms
			var containerList = [];
			for (let roomName of inRooms) {
				if (!_.isEmpty(roomName)) {
					if (!_.isEmpty(Game.rooms[roomName])) {
						if (!_.isEmpty(Game.rooms[roomName].containers)) {
							var roomContainers = Game.rooms[roomName].containers
							containerList = [...containerList, ...roomContainers]
						}
					}
				}
			}

			var storagePosition = r.storage.pos;

			//if the memory space is not there
			if (r.memory.containerSources === undefined) {
				r.memory.containerSources = {};
			}

			//if refersh time, empty all container data
			if ((Game.time % DELAYFLOWROOMCHECK) == 0 && Game.cpu.bucket > 5000) {
				r.memory.containerSources = {};
			}



			//get info about containers
			for (let container of containerList) {
				if (!_.isEmpty(container) && !_.isEmpty(container)) {
					if (!_.isEmpty(r.memory.containerSources[container.id])) {
						if (!_.isEmpty(container.room.controller.reservation)) {
							if (container.room.controller.reservation.username == playerUsername) {
								var energyCapacity = SOURCE_ENERGY_CAPACITY
							}
						} else {
							var energyCapacity = SOURCE_ENERGY_NEUTRAL_CAPACITY
						}

						//check for how many creep target it
						var incomingLorries = _.filter(container.targetedBy, f => _.first(_.words(f.name, /[^-]+/g)) == "longDistanceLorry")
						var carryParts = 0
						if (!_.isEmpty(incomingLorries)) {
							//get their body size
							carryParts = _.sum(incomingLorries, h => _.sum(h.body, part => part.type === CARRY))
						}

						var energyNeededForCarry = carryParts * CARRY_CAPACITY

						var valid = false
						if (container.store[RESOURCE_ENERGY] >= energyNeededForCarry) {
							valid = true
						}
						//console.log(carryParts + " " + incomingLorries.length+ " "+valid)

						if ((r.memory.containerSources[container.id].time + 30) < Game.time) {
							//if the container ID exists, just update it
							r.memory.containerSources[container.id].id = container.id
							r.memory.containerSources[container.id].pos = container.pos
							r.memory.containerSources[container.id].time = Game.time
							//add info about validity of target
							r.memory.containerSources[container.id].valid = valid
							//add info about the current capacity based on reservation
							r.memory.containerSources[container.id].energyCapacity = energyCapacity
							//add info about current energy levels
							r.memory.containerSources[container.id].energy = container.store[RESOURCE_ENERGY]
							//add info for sorting
							r.memory.containerSources[container.id].ed = container.store[RESOURCE_ENERGY] / (r.memory.containerSources[container.id].distance * 2)
						}
					} else {
						//if it does not exists, create it and calculate distance
						r.memory.containerSources[container.id] = {}
						r.memory.containerSources[container.id].id = container.id
						r.memory.containerSources[container.id].pos = container.pos
						r.memory.containerSources[container.id].valid = valid
						r.memory.containerSources[container.id].energyCapacity = energyCapacity
						r.memory.containerSources[container.id].energy = container.store[RESOURCE_ENERGY]
						r.memory.containerSources[container.id].time = Game.time

						let distance = PathFinder.search(
							storagePosition, container.pos, {
								// We need to set the defaults costs higher so that we
								// can set the road cost lower in `roomCallback`
								plainCost: 2,
								swampCost: 10,

								roomCallback: function (roomName) {
									let room = Game.rooms[roomName];
									// In this example `room` will always exist, but since 
									// PathFinder supports searches which span multiple rooms 
									// you should be careful!
									if (!room) return;
									let costs = new PathFinder.CostMatrix;
									room.find(FIND_STRUCTURES).forEach(function (struct) {
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
							}
						);
						if (distance[4] != true) {
							r.memory.containerSources[container.id].distance = distance.path.length
							r.memory.containerSources[container.id].ed = container.store[RESOURCE_ENERGY] / (r.memory.containerSources[container.id].distance * 2)
						} else {
							r.memory.containerSources[container.id].distance = false
							r.memory.containerSources[container.id].ed = 0
						}
					}
				}
			}
		} else {
			return -1;
		}
	}
}

module.exports = mngColony;