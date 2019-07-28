var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	newTask: function (creep) {

		if (_.sum(creep.carry) > creep.carry[RESOURCE_ENERGY] && !_.isEmpty(creep.room.storage)) {
			//creep has something other than energy
			creep.task = Tasks.transferAll(creep.room.storage);
			creep.say("other")
			return;
		} else if (creep.carry[RESOURCE_ENERGY] > 0) {
			// creep has energy -> work

			let ext = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
				filter: f => f.structureType == STRUCTURE_EXTENSION && f.energy < f.energy
			})
			if (ext.length) {
				creep.transfer(ext[0], RESOURCE_ENERGY)
			}

			if (creep.fillStructures(creep, false)) {
				return;
			}

		} else {
			//creep is empty

			//FIXME: do not go near hostiles!

			//get energy
			if (creep.getEnergy(creep, false)) {
				return;
			}

			//go sign the controller
			creep.graffity()

			if ((Game.time % 3) == 0) {
				creep.say(EM_TEA, true)
			}
		}
	}
};