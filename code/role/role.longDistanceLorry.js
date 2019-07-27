var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	newTask: function (creep) {
		let cpuStart = Game.cpu.getUsed();

		//check for hostiles
		let hostileValues = creep.room.checkForHostiles(creep.room)
		if (!_.isEmpty(hostileValues)) {
			if (hostileValues.numHostiles > 0) {
				creep.room.createFlag(25, 25, "DEFEND-" + creep.room.name + "-" + creep.memory.home, COLOR_WHITE, COLOR_RED)
				creep.task = Tasks.goToRoom(creep.memory.home);
				return
			}
		}

		//creep.say("transport!")
		//console.log(creep.name+" "+JSON.stringify(creep.memory.target))

		if (!_.isEmpty(Game.rooms[creep.memory.home].memory.containerSources)) {
			if (creep.room.name == creep.memory.home && (creep.carry.energy == 0 || _.isEmpty(creep.memory.target))) {
				//creep is home, empty, with no target
				var r = Game.rooms[creep.memory.home];

				//get creep TTL
				var creepPossibleDistance = (creep.ticksToLive / 2) - 40;

				//get all possible targets
				var allContainers = _.filter(r.memory.containerSources, (c) => (c.energy + (c.distance * 10)) >= creep.carryCapacity &&
					c.distance != false &&
					c.distance < creepPossibleDistance && 
					c.valid == true);

				if (!_.isEmpty(allContainers)) {
					//console.log(JSON.stringify(allContainers))
				}

				//sort by distance and amount
				if (_.size(allContainers) > 0) {
					//sort valid conteiners by best
					validTarget = _.first(_.sortByOrder(allContainers, ['ed'], ['desc'], _.values))

					if (!_.isEmpty(validTarget)) {
						//target found, add it to creep.memory.target
						creep.memory.target = validTarget.id;
						container = Game.getObjectById(validTarget.id)
						if (!_.isEmpty(container)) {
							//go work the target
							creep.task = Tasks.withdraw(container);
							creep.say(EM_TRUCK, true)

							//substract current request
							r.memory.containerSources[validTarget.id].valid = false
							energyLeft = (validTarget.energy + (validTarget.distance * 10)) - creep.carryCapacity

							if (true) {
								console.log(creep.name + " going for " + container.id + " in " + container.room.name + " with " + container.store[RESOURCE_ENERGY] +
									"(" + energyLeft + "/" + r.memory.containerSources[validTarget.id].energy + ") in distance " + validTarget.distance + " for a return of e/d " + validTarget.ed.toFixed(2) + " (CPU used: " + (Game.cpu.getUsed() - cpuStart).toFixed(2) + ")")
							}

						} else {
							console.log(creep.name + " ERRRRR!!!  target not valid " + JSON.stringify(validTarget) + " " + JSON.stringify(allContainers) + " " + JSON.stringify(container))
							delete r.memory.containerSources[validTarget.id]
						}
					}
				} else {
					if (creepPossibleDistance < 50) {
						creep.say("dying", true)
						/* let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
						creep.task = Tasks.getRecycled(spawn); */
						creep.suicide()
					} else {
						creep.memory.target = {};
						creep.say(EM_ZZZ, true)
					}
				}
			} else if (creep.room.name == creep.memory.home && creep.carry.energy > 0) {
				//creep is home and have some energy left

				//get home storage
				var homeStorage = Game.rooms[creep.memory.home].storage;
				if (!_.isEmpty(homeStorage)) {
					//put energy into storage
					creep.task = Tasks.transfer(homeStorage)
					creep.say("storage full!", true)
				} else {
					console.log("storage not found!!! " + creep.name + " " + creep.room.name + " " + creep.memory.home)
					creep.say("confused storage")
				}
			} else if (creep.room.name == creep.memory.home && !_.isEmpty(creep.memory.target)) {
				//creep is home, nad target is valid
				var validContainer = Game.getObjectById(creep.memory.target)

				if (!_.isEmpty(validContainer)) {
					//go work the target
					creep.task = Tasks.withdraw(validContainer);
					//creep.say("empty err?")
				}

			} else if (creep.room.name != creep.memory.home && creep.carry.energy > 0) {
				//creep is abroad and have some energy

				//get home storage
				var homeStorage = Game.rooms[creep.memory.home].storage;
				if (!_.isEmpty(homeStorage)) {
					//put energy into storage
					creep.task = Tasks.transfer(homeStorage)
					creep.say(EM_TRUCK, true)
				} else {
					console.log("storage not found!!! " + creep.name + " " + creep.room.name + " " + creep.memory.home)
					creep.say("confused")
				}
			} else if (_.isEmpty(creep.memory.target)) {
				creep.say("what?")
				if (creep.carry.energy > 0) {
					//get home storage
					var homeStorage = Game.rooms[creep.memory.home].storage;
					if (!_.isEmpty(homeStorage)) {
						//put energy into storage
						creep.task = Tasks.transfer(homeStorage)
						creep.say("to storage!", true)
					} else {
						console.log("storage not found!!! " + creep.name + " " + creep.room.name + " " + creep.memory.home)
						creep.say("confused")
					}
				} else if (creep.ticksToLive < 200) {
					creep.say("dying")
				} else {
					creep.say("empty task")
					//get home storage
					var homeStorage = Game.rooms[creep.memory.home].storage;
					creep.task = Tasks.goTo(homeStorage)
				}
			} else if (creep.room.name != creep.memory.home && creep.carry.energy == 0 && !_.isEmpty(creep.memory.target)) {
				//creep is abroad, nad target is valid
				var validTarget = creep.memory.target
				validTarget = Game.getObjectById(validTarget.id)
				if (!_.isEmpty(validTarget)) {
					if (validTarget.store[RESOURCE_ENERGY] > 0) {
						//go work the target
						creep.task = Tasks.withdraw(validTarget);
						creep.say(EM_PIN + "" + EM_TRUCK, true)
					} else {
						creep.say("target empty")
						creep.memory.target = {}
						creep.task = Tasks.goToRoom(creep.memory.home)
					}
				}
			} else {
				//something wrong
				//console.log("creep confused!!! " + creep.name + " " + creep.room.name + " " + creep.carry.energy + " " + JSON.stringify(creep.memory.target) + " " + _.isEmpty(creep.memory.target))
				creep.say("run confused")
				//console.log(JSON.stringify(creep.memory))

				creep.memory.target = {}
				//creep.task = Tasks.goToRoom(creep.memory.home)

			}
			//console.log(creep.name+" CPU used: " + (Game.cpu.getUsed() - cpuStart))
		} else {
			creep.say("no D containers")
		}
	}
};