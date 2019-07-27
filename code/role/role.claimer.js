var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for this role
	newTask: function (creep) {

		if (creep.room.name != creep.memory.target) {
			//go to target room
			creep.task = Tasks.goToRoom(creep.memory.target)
			creep.say(EM_TRUCK, true);
			return;

		} else if (creep.room.name == creep.memory.target) {
			// if in target room

			//check for hostiles
			let hostileValues = creep.room.checkForHostiles(creep.room)
			if (!_.isEmpty(hostileValues)) {
				if (hostileValues.numHostiles > 0) {
					creep.room.createFlag(25, 25, "DEFEND-" + creep.room.name + "-" + creep.memory.home, COLOR_WHITE, COLOR_RED)
					creep.task = Tasks.goToRoom(creep.memory.home);
					return
				}
			}

			//check for grey flags to claim the room
			var greyFlag = creep.room.find(FIND_FLAGS, {
				filter: (f) => f.color == COLOR_GREY && f.room == creep.room
			})
			if (greyFlag.length > 0) {
				// try to claim controller
				if (!creep.room.controller.my) {
					creep.task = Tasks.claim(creep.room.controller)
					creep.say(EM_FLAG + "" + EM_FLAG + "" + EM_FLAG, true)
					return;
				} else {
					creep.say(EM_FLAG + "" + EM_COOKIE + "" + EM_TEA, true)
					creep.suicide()
				}
			} else {
				//reserve controller
				if (!_.isEmpty(creep.room.controller.sign)) {
					if (creep.room.controller.sign.username != playerUsername) {
						creep.task = Tasks.signController(creep.room.controller, roomSign)
					}
				} else {
					creep.task = Tasks.signController(creep.room.controller, roomSign)
				}
				creep.task = Tasks.reserve(creep.room.controller);
				creep.say(EM_FLAG, true)
				return;

			}
		} else {
			creep.say("confused")
		}
	}
};