var Tasks = require("../tools/creep-tasks");

module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	newTask: function (creep) {
		if (_.sum(creep.carry) == creep.carryCapacity) {
			//drop off everything
			if (!_.isEmpty(creep.room.storage)) {
				//if structure found, do work
				creep.task = Tasks.transferAll(creep.room.storage);
				creep.say(EM_TRUCK, true)
				return
			} else {
				creep.say(EM_EXCLAMATION, true)
			}
		} else {
			//go mine minerals
			let source = creep.pos.findClosestByRange(FIND_MINERALS, {filter: (s) => s.mineralAmount > 0});
			if (!_.isEmpty(source)) {
				creep.task = Tasks.harvest(source);
				creep.say(EM_FLEX)
				return
			}else {
				creep.say(EM_EXCLAMATION, true)
				
				/* let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
				creep.task = Tasks.getRecycled(spawn); */
				creep.suicide()
			}
		}
	}
};