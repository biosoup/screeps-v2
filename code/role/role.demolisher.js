var Tasks = require("../tools/creep-tasks");

module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	newTask: function (creep) {
		if (creep.memory.home != undefined && creep.room.name == creep.memory.home) {
			//creep is home
			if (_.sum(creep.carry) > 0) {
				//dump into storage
				if (!_.isEmpty(creep.room.storage)) {
					creep.say(EM_PACKAGE, true)
					creep.task = Tasks.transferAll(creep.room.storage);
					return;
				} else {
					//no place for stuff, find nearest container
					var container = creep.pos.findClosestByRange(creep.room.containers)
					creep.task = Tasks.transferAll(container)
					return
				}
			} else {
				//go to target room
				creep.task = Tasks.goToRoom(creep.memory.target)
			}
		} else if (!_.isEmpty(creep.memory.target) && creep.room.name == creep.memory.target) {
			//creep is in taget room

			//check for hostiles
			let hostileValues = creep.room.checkForHostiles(creep.room)
			if (!_.isEmpty(hostileValues)) {
				if (hostileValues.numHostiles > 0) {
					creep.room.createFlag(25, 25, "DEFEND-" + creep.room.name + "-" + creep.memory.home, COLOR_WHITE, COLOR_RED)
					creep.say(EM_KILL, true)
					creep.task = Tasks.goToRoom(creep.memory.home);
					return
				}
			} else {
				if (_.sum(creep.carry) < creep.carryCapacity) {
					//look for dropped resources
					var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
						filter: s => s.targetedBy.length == 0
					})
					if (!_.isEmpty(droppedEnergy)) {
						creep.say(EM_PIN, true)
						droppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
						creep.task = Tasks.pickup(droppedEnergy);
						return;
					}
					var tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => _.sum(t.store) > 0 && t.targetedBy.length == 0)
					if (!_.isEmpty(tombstones)) {
						tombstone = creep.pos.findClosestByRange(tombstones)
						if (!_.isEmpty(tombstone)) {
							creep.say(EM_KILL, true)
							creep.task = Tasks.withdrawAll(tombstone);
							return;
						}
					}

					//find structures to withdraw energy from
					var storages = creep.pos.findClosestByPath(FIND_STRUCTURES, {
						filter: f => (f.structureType == STRUCTURE_STORAGE ||
							f.structureType == STRUCTURE_CONTAINER ||
							f.structureType == STRUCTURE_POWER_SPAWN ||
							f.structureType == STRUCTURE_TERMINAL) && _.sum(f.store) > 0
					})
					if (!_.isEmpty(storages)) {
						creep.say(EM_PACKAGE, true)
						creep.task = Tasks.withdrawAll(storages)
						return
					}

					//find structures to withdraw energy from
					var energies = creep.pos.findClosestByPath(FIND_STRUCTURES, {
						filter: f => (f.structureType == STRUCTURE_STORAGE ||
							f.structureType == STRUCTURE_CONTAINER ||
							f.structureType == STRUCTURE_EXTENSION ||
							f.structureType == STRUCTURE_SPAWN ||
							f.structureType == STRUCTURE_POWER_SPAWN ||
							f.structureType == STRUCTURE_LINK ||
							f.structureType == STRUCTURE_TOWER ||
							f.structureType == STRUCTURE_TERMINAL) && f.energy > 0
					})
					if (!_.isEmpty(energies)) {
						creep.say(EM_PACKAGE + "2", true)
						creep.task = Tasks.withdraw(energies)
						return
					}

					//find nearest structure, or wall and demolish until full
					var demo = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES)
					if (!_.isEmpty(demo)) {
						creep.say(EM_BOMB, true)
						creep.task = Tasks.dismantle(demo)
						return
					}

					var demo = creep.pos.findClosestByRange(FIND_STRUCTURES, {
						filter: f =>
							f.structureType == STRUCTURE_WALL ||
							f.structureType == STRUCTURE_CONTAINER
					})
					if (!_.isEmpty(demo)) {
						creep.say(EM_BOMB + "2", true)
						creep.task = Tasks.dismantle(demo)
						return
					}
				} else {
					//creep is full
					creep.say(EM_TRUCK, true)
					creep.task = Tasks.goToRoom(creep.memory.home);
					return
				}
			}
		} else {
			creep.say("confused")
		}
	}
}