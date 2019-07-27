var Tasks = require("tools.creep-tasks");

module.exports = upgrader = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	newTask: function (creep) {
		if (_.sum(creep.carry) > creep.carry[RESOURCE_ENERGY] && !_.isEmpty(creep.room.storage)) {
			//creep has something other than energy
			creep.task = Tasks.transferAll(creep.room.storage);
			creep.say("other")
			return;
		} else if (creep.carry.energy > 0) {
			//do the actual job

			if (!_.isEmpty(creep.room.controller.sign)) {
				if (creep.room.controller.sign.username != playerUsername) {
					creep.task = Tasks.signController(creep.room.controller, roomSign)
				}
			} else {
				creep.task = Tasks.signController(creep.room.controller, roomSign)
			}
			creep.task = Tasks.upgrade(creep.room.controller, {workOffRoad: true});
			return
		} else {
			//first link nearby
			var link = creep.room.controller.pos.findInRange(creep.room.links, 2, {filter: f=> f.energy > 0})
			if (!_.isEmpty(link)) {
				creep.task = Tasks.withdraw(link[0]);
				creep.say(EM_LIGHTNING, true)
				return;
			}

			//then container nearby
			var container = creep.room.controller.pos.findInRange(creep.room.containers, 2, {filter: f=> f.store[RESOURCE_ENERGY] > 0})
			if (!_.isEmpty(container)) {
				creep.task = Tasks.withdraw(container[0]);
				creep.say(EM_PACKAGE, true)
				return;
			}

			if(creep.getEnergy(creep, true)) {
				return;
			}

			creep.say("ERR!!")
		}
	}
};