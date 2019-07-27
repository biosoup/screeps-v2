var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for this role
	newTask: function (creep) {
		// get source
		if (!_.isEmpty(creep.memory.target) && creep.room.name != creep.memory.target) {
			creep.task = Tasks.goToRoom(creep.memory.target)
		} else if (!_.isEmpty(creep.memory.target) && creep.room.name == creep.memory.target) {
			//check for hostiles
			let hostileValues = creep.room.checkForHostiles(creep.room)
			if (!_.isEmpty(hostileValues)) {
				if (hostileValues.numHostiles > 0) {
					creep.room.createFlag(25, 25, "DEFEND-" + creep.room.name + "-" + creep.memory.home, COLOR_WHITE, COLOR_RED)
					creep.task = Tasks.goToRoom(creep.memory.home);
					return
				}
			} else {
				var whiteFlags = _.first(_.filter(Game.flags, (f) => f.color == COLOR_WHITE && f.pos.roomName == creep.room.name))
				if (!_.isEmpty(whiteFlags)) {
					whiteFlags.remove()
				}
			}

			//console.log(creep.room.containers)

			if (!_.isEmpty(creep.memory.container)) {
				var cID = Game.getObjectById(creep.memory.container)
				var source = cID.pos.findInRange(FIND_SOURCES)
			}

			let sources = creep.room.find(FIND_SOURCES);
			let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
			if (!_.isEmpty(unattendedSource) && _.isEmpty(source)) {
				var source = creep.pos.findClosestByRange(unattendedSource);
			}

			if (_.isEmpty(source)) {
				var source = sources[0];
			}

			if (!_.isEmpty(source)) {
				// find container next to source
				var container = source.pos.findInRange(FIND_STRUCTURES, 1, {
					filter: s => s.structureType == STRUCTURE_CONTAINER
				});
				//check for free space on first container
				if (!_.isEmpty(container)) {
					if (container[0].pos.lookFor(LOOK_CREEPS).length > 0 && container.length > 1 && creep.pos != container[1].pos && creep.pos != container[0].pos) {
						container = container[1];
					} else {
						container = container[0];
					}

					// if creep is on top of the container
					if (creep.pos.isEqualTo(container.pos)) {
						creep.memory.container = container.id
						//if container needs repairs
						if (container.hits < container.hitsMax && creep.carry.energy > 0) {
							creep.task = Tasks.repair(container)
							creep.say(EM_WRENCH, true)

							//run a road to home storage
							if (creep.memory.buildRoadCounter == 20 || _.isEmpty(creep.memory.buildRoadCounter)) {
								creep.room.buildRoad(container.id, Game.rooms[creep.memory.home].storage.id)
								creep.memory.buildRoadCounter = 0
							}
							creep.memory.buildRoadCounter++
							
							
							return;
						} else {
							//if there is a free space in container
							if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
								// harvest source
								creep.task = Tasks.harvest(source);
								creep.say(EM_HAMMER, true)
								return
							} else {
								if (container.hits < container.hitsMax && container.store[RESOURCE_ENERGY] == container.storeCapacity) {
									creep.task = Tasks.withdraw(container);
									return
								}
								creep.say(EM_ZZZ, true)
								return
							}
						}
					} else {
						// if creep is not on top of the container
						creep.travelTo(container);
					}
				} else {
					creep.say("missing container")
					if (creep.carry.energy < creep.carryCapacity) {
						creep.task = Tasks.harvest(source);
						return
					} else {
						//go build stuff?
						var buildSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
						if (!_.isEmpty(buildSite)) {
							creep.task = Tasks.build(buildSite);
							creep.say(EM_WRENCH, true)
							return
						}
					}
				}
			} else {
				creep.say("missing source")
				console.log(Game.time + " Smth wrong with: " + creep + " " + source + " " + creep.room.name) //+" "+JSON.stringify(sources)
			}
		} else {
			creep.say("confused")
		}
	}
};