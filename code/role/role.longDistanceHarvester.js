var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	newTask: function (creep) {
		//check for hostiles
		let hostileValues = creep.room.checkForHostiles(creep.room)
		if (!_.isEmpty(hostileValues)) {
			if (hostileValues.numHostiles > 0) {
				creep.room.createFlag(25, 25, "DEFEND-" + creep.room.name + "-" + creep.memory.home, COLOR_WHITE, COLOR_RED)
				creep.task = Tasks.goToRoom(creep.memory.home);
				return
			}
		}
		
		if (creep.memory.home != undefined && creep.room.name == creep.memory.home) {
			//if in home room
			if (creep.carry.energy > 0) {
				if(creep.fillStructures(creep, true)) {
					return;
				}

				//dump into storage
				if (!_.isEmpty(creep.room.storage)) {
					creep.task = Tasks.transfer(creep.room.storage);
					return;
				} else {
					//nothing to do -> upgrade controller
					//find important buidlsites
					var closestImportantConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
						filter: (s) => s.structureType == STRUCTURE_CONTAINER ||
							s.structureType == STRUCTURE_EXTENSION
					});
					if (!_.isEmpty(closestImportantConstructionSite)) {
						creep.task = Tasks.build(closestImportantConstructionSite);
						creep.say(EM_BUILD + " " + EM_EXCLAMATION, true);
						return;
					}

					if (creep.room.controller.my) {
						creep.task = Tasks.upgrade(creep.room.controller);
						creep.say(EM_LIGHTNING, true);
						return;
					} else {
						creep.say(EM_SINGING, true);
						return
					}
				}
			} else {
				//go to target room
				creep.task = Tasks.goToRoom(creep.memory.target)
			}
		} else if (!_.isEmpty(creep.memory.target) && creep.room.name == creep.memory.target) {
			//if in target room

			//console.log(creep)

			// if creep need energy, get him refilled
			if (creep.carry.energy < creep.carryCapacity) {
				let sources = creep.room.find(FIND_SOURCES);
				let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
				if (!_.isEmpty(unattendedSource)) {
					unattendedSource = creep.pos.findClosestByRange(unattendedSource);
					if (!_.isEmpty(unattendedSource)) {
						creep.task = Tasks.harvest(unattendedSource);
						creep.say(EM_HAMMER, true)
						return
					}
				} else {
					if (!_.isEmpty(sources)) {
						creep.task = Tasks.harvest(sources[0]);
						creep.say(EM_HAMMER, true)
						return
					}
				}
			} else {
				//if full, go home
				creep.task = Tasks.goToRoom(creep.memory.home)
			}
		} else {
			creep.say("confused")
		}
	}
};