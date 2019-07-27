// version 0.7
const CPUdebug = false;

if (CPUdebug == true) {
	let cpu = Game.cpu.getUsed();
	console.log("CPU@Start: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);
	global.reqCPU = Game.cpu.getUsed();
	global.start = Game.time;
	console.log('CPU@Initialization: ' + (global.reqCPU - cpu) + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);
}

//system imports
//import MemHack from 'tools.MemHack'
const MemHack = require('tools.MemHack');
MemHack.register()

require('globals.old')
require('tools.prototype.Room.structures');
const profiler = require('tools.screeps-profiler');
const stats = require('tools.stats');
// eslint-disable-next-line no-unused-vars
var Traveler = require('tools.Traveler');
require("tools.creep-tasks");
require('functions.game');

// import modules
require('ext/prototype.creep');
require('ext/prototype.tower');
require('prototype.spawn');
require('ext/prototype.room');
var market = require('base.market');

// PROFILER
profiler.enable();

module.exports.loop = function () {
	profiler.wrap(function () {
		MemHack.pretick()
		stats.reset()

		let cpu = Game.cpu.getUsed();
		if (Game.time == global.start) {
			cpu -= global.reqCPU;
		}
		if (cpu >= 35) {
			console.log("<font color=#ff0000 type='highlight'>CPU@LoopStart: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket + "</font>");
		}

		// check for memory entries of died creeps by iterating over Memory.creeps
		for (var name in Memory.creeps) {
			// and checking if the creep is still alive
			if (Game.creeps[name] == undefined) {
				//TODO: pull lifestats from a creep

				// if not, delete the memory entry
				delete Memory.creeps[name];
			}
		}

		var CPUdebugString = "CPU Debug";
		if (CPUdebug == true) {
			CPUdebugString = CPUdebugString.concat("<br>Start: " + Game.cpu.getUsed() + " ")
		}

		//Fill myRooms
		var myroomlist = _.values(Game.rooms).filter(r => _.get(r, ['controller', 'owner', 'username'], undefined) === playerUsername);
		for (let m in myroomlist) {
			myRooms[myroomlist[m].name] = myroomlist[m];
		}

		//run every 25 ticks and only when we have spare bucket CPU
		if ((Game.time % DELAYSPAWNING) == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
			if (CPUdebug == true) {
				CPUdebugString = CPUdebugString.concat("<br>Start Spawn Code: " + Game.cpu.getUsed())
			}
			for (let roomName in Game.rooms) {
				if (!_.isEmpty(Game.rooms[roomName].memory.roomArray)) {
					if (!_.isEmpty(Game.rooms[roomName].memory.roomArray.spawns)) {
						Game.rooms[roomName].creepSpawnRun(Game.rooms[roomName]);
					}
				} else {
					//refresh room data
					Game.rooms[roomName].refreshData(roomName)
				}
			}
		}

		if (CPUdebug == true) {
			CPUdebugString = CPUdebugString.concat("<br>Start Tasks Code: " + Game.cpu.getUsed())
		}
		// ************ NEW TASK SYSTEM ************
		if (Game.cpu.bucket > CPU_THRESHOLD) {
			for (let creep in Game.creeps) {
				if (CPUdebug == true) {
					CPUdebugString = CPUdebugString.concat("<br>Start Creep" + creep + " work Code: " + Game.cpu.getUsed())
				}

				//console.log(Game.creeps[creep])

				try {
					//if creep is idle, give him work
					if (Game.creeps[creep].isIdle) {
						Game.creeps[creep].runRole()
					} else if (!Game.creeps[creep].hasValidTask) {
						Game.creeps[creep].runRole()
					}
				} catch (err) {
					Game.creeps[creep].say("RUN ROLE ERR!!")
					console.log("RUN ROLE ERR: " + creep + " at " + err.stack)
				}
			}
		}

		if (CPUdebug == true) {
			CPUdebugString = CPUdebugString.concat("<br>Start Rooms Code: " + Game.cpu.getUsed())
		}
		//go through rooms
		for (let roomName in Game.rooms) {
			if (!_.isEmpty(Game.rooms[roomName].controller)) {
				//check for hostiles and response force
				var hostileValues = Game.rooms[roomName].checkForHostiles(roomName);
				if (!_.isEmpty(hostileValues)) {
					if (hostileValues.numHostiles > 0) {
						if (hostileValues.numberOfAttackBodyParts > 0) {
							var avaliableGuards = _.filter(Game.creeps, (c) => (c.memory.role == 'guard' || c.memory.role == "einarr") && c.memory.target == roomName)
							if ((Game.time % 3) == 0 && hostileValues.username != "Invader") {
								console.log("Hostiles in " + roomName + ": " + hostileValues.username + "! " + hostileValues.numHostiles + " hostile with " + hostileValues.numberOfAttackBodyParts + " ATTACK and " + hostileValues.numberOfHealBodyParts + " HEAL. Response team of: " + avaliableGuards.length)
							}
						}
					}

					if (Game.rooms[roomName].controller.my) {
						//check for hostiles
						if (hostileValues.username != "Invader") {
							//activate safemode, when non-invaders get too close to spawn
							var closeRange = 0;

							var closeRangeHostile = Game.rooms[roomName].spawns[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
								filter: f => f.owner.username != "Invader"
							})
							closeRange = Game.rooms[roomName].spawns[0].pos.getRangeTo(closeRangeHostile);


							//console.log("close range:" + closeRange+" "+closeRangeHostile)

							//if hostile is closer than 6 -> safemode
							if (closeRange < 6 && closeRange > 0 && Game.rooms[roomName].controller.safeModeAvailable > 0) {
								Game.rooms[roomName].controller.activateSafeMode()
								console.log("WARNING: Hostile too close!! SAFEMODE!!")
							} else if (!_.isEmpty(Game.rooms[roomName].storage)) {
								if (Game.rooms[roomName].storage.store[RESOURCE_ENERGY] > 100000) {
									//we have energy, do siege mode
									//TODO: implement siege mode
								} else {
									//no energy left, ask for help

									//get closest other spawns
									var flagRoomName = roomName
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

									//check if flag does not exists
									var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.words(f.name, /[^-]+/g)[1] == Game.rooms[roomName].name)
									if (_.isEmpty(whiteFlags)) {
										//set a flag
										Game.rooms[roomName].createFlag(25, 25, "DEFEND-" + roomName + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
										console.log(roomName + " in troubles!! Sending response team!!")
									}
								}
							} else {
								//no avaliable storage and no safe modes –> send response team
								if (Game.rooms[roomName].controller.safeMode == undefined) {

									//get closest other spawns
									var flagRoomName = roomName
									var distance = {}
									for (let roomName in Game.rooms) {
										var r = Game.rooms[roomName];
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
										var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.words(f.name, /[^-]+/g)[1] == Game.rooms[roomName].name)
										if (_.isEmpty(whiteFlags)) {
											//set a flag
											Game.rooms[roomName].createFlag(25, 25, "DEFEND-" + roomName + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
											console.log(roomName + " in troubles!! Sending response team!!")
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

				//add room visuals
				if (Game.cpu.bucket > CPU_THRESHOLD) {
					try {
						Game.rooms[roomName].basicVisuals()
						Game.rooms[roomName].roomEconomy()
					} catch (err) {
						console.log("VISUALS ERR: " + tower + " " + err.stack)
					}
				}

				// refresh every 10 ticks if we have no master spawn on our own room
				if ((Game.time % 10) == 0 && _.isEmpty(Game.rooms[roomName].memory.masterSpawn) &&
					Game.cpu.bucket > CPU_THRESHOLD &&
					Game.rooms[roomName].controller != undefined &&
					Game.rooms[roomName].controller.owner != undefined &&
					Game.rooms[roomName].controller.owner.username == playerUsername) {

					Game.rooms[roomName].refreshData(roomName)
				}

				//refresh blueprints after RCL upgrade
				if ((Game.time % 10) == 0 && Game.rooms[roomName].controller.level > Game.rooms[roomName].memory.RCL && Game.cpu.bucket > CPU_THRESHOLD) {
					var response = Game.rooms[roomName].baseRCLBuild()
					console.log(roomName + " RCL upgrade! " + response)
				}
				Game.rooms[roomName].memory.RCL = Game.rooms[roomName].controller.level;

				// refresh room data 
				if ((Game.time % DELAYFLOWROOMCHECK) == 0 &&
					Game.cpu.bucket > CPU_THRESHOLD &&
					Game.rooms[roomName].controller != undefined &&
					Game.rooms[roomName].controller.owner != undefined &&
					Game.rooms[roomName].controller.owner.username == playerUsername || ROOMARRAY_REFRESH == true) {

					//refresh room data
					Game.rooms[roomName].refreshData(roomName)
					//refreshed room buildings
					Game.rooms[roomName].baseRCLBuild()
				}


				if ((Game.time % DELAYLINK) == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
					//run link balancing
					Game.rooms[roomName].linksRun(roomName)

					//refresh refresh remote containers
					Game.rooms[roomName].refreshContainerSources(roomName)
				}

				// find all towers
				var towers = Game.rooms[roomName].towers
				try {
					if (!_.isEmpty(towers)) {
						//find hostiles in the room
						if (!_.isEmpty(hostileValues)) {
							if (hostileValues.numHostiles > 0) {
								if (Game.rooms[roomName].controller.safeMode == undefined) {
									var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS)
									//only attack when safe mode is not active
									for (var tower of towers) {
										tower.defend(hostiles);
									}
								}
							}
						} else {
							for (var tower of towers) {
								tower.healCreeps()
								tower.repairStructures();
							}
						}
					}
				} catch (err) {
					console.log("TOWER ERR: " + tower + " " + err.stack)
				}

				if (Game.cpu.bucket > CPU_THRESHOLD * 2 && Game.rooms[roomName].controller.my) {
					try {
						// default resource limits
						market.resourceLimits(roomName);
						// balance resources
						market.resourceBalance(CPUdebug);
						// terminal transfers
						market.terminalCode(roomName, CPUdebug);

						market.productionCode(roomName);

						market.labCode(roomName);
					} catch (err) {
						console.log("ROOM FNC ERR: " + roomName + " " + err.stack)
					}
				}
			}
		}

		if (Game.cpu.bucket > CPU_THRESHOLD * 2) {
			//run market code
			try {
				market.marketCode();
			} catch (err) {
				console.log("ROOM FNC ERR: " + roomName + " " + err.stack)
			}

		}

		if (CPUdebug == true) {
			CPUdebugString = CPUdebugString.concat("<br>Start Creep run Code: " + Game.cpu.getUsed())
		}
		// Now that all creeps have their tasks, execute everything
		for (let creep in Game.creeps) {
			//if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Creep"+creep+" run Code: " + Game.cpu.getUsed())}

			//console.log(creep)
			try {
				Game.creeps[creep].run();
			} catch (err) {
				Game.creeps[creep].say("MAIN ERR!!")
				console.log("MAIN ERR: " + creep + " at: " + err.stack)
				//Game.creeps[creep].suicide()
				Game.creeps[creep].task = {}
			}
		}

		if (CPUdebug == true) {
			CPUdebugString = CPUdebugString.concat("<br>Start stats Code: " + Game.cpu.getUsed())
		}
		//other stats
		//var elapsedInSeconds = ((new Date()).getTime() - Memory.stats.lastTS) / 1000
		if ((Game.time % 5) == 0 && Game.cpu.bucket > 100) {
			var spawnBusy = {};
			for (var spawnName in Game.spawns) {
				if (Game.spawns[spawnName].spawning) {
					spawnBusy[Game.spawns[spawnName].name] = Game.spawns[spawnName].spawning.needTime - Game.spawns[spawnName].spawning.remainingTime;
				} else {
					spawnBusy[Game.spawns[spawnName].name] = 0;
				}
			}
			stats.addStat('spawn-busy', {}, spawnBusy)

			var countHostiles = 0;
			for (var roomName in Game.rooms) {
				var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
				if (hostiles.length > 0) {
					countHostiles = countHostiles + hostiles.length
				}
			}

			//check for hostiles in any room
			stats.addSimpleStat('hostiles', countHostiles);
			stats.addSimpleStat('creep-population', Object.keys(Game.creeps).length);

			stats.commit();
		}


		/* *** TEST SPACE *** */

		try {
			if ((Game.time % 5) == 0 && Game.cpu.bucket > 100) {
				/* for (let roomName in Game.rooms) {
					
				} */
			}
			for (var roomName in Game.rooms) {
				var powerSpawn = _.first(Game.rooms[roomName].find(FIND_STRUCTURES, {
					filter: f => f.structureType == STRUCTURE_POWER_SPAWN
				}))
				if (!_.isEmpty(powerSpawn) && (Game.rooms[roomName].storage.store[RESOURCE_ENERGY] > (MINSURPLUSENERGY * Game.rooms[roomName].controller.level)) && Game.cpu.bucket > CPU_THRESHOLD) {
					if (powerSpawn.energy >= 50 && powerSpawn.power >= 1) {
						powerSpawn.processPower()
					}
				}
			}

		} catch (err) {
			console.log("ERR: " + err)
		}
		//var closeSpawn = spawnName.findClosestByRange(Game.spawns, {filter: s=> s.room.name != spawnName.room.name})
		//console.log(JSON.stringify(closeSpawn))


		if (CPUdebug == true) {
			CPUdebugString = CPUdebugString.concat("<br>Finish: " + Game.cpu.getUsed());
			console.log(CPUdebugString);
		}
	});
};