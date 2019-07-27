var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	newTask: function (creep) {
		// 2 main mission
		//      - refill safemode
		//      - refill powerspawn


		//safemode first
		if (creep.room.controller.safeModeAvailable <= 3) {
			if (creep.carry[RESOURCE_GHODIUM] >= 1000 && creep.room.controller.safeModeAvailable <= 3) {
				//go generate safemodes
				if (creep.generateSafeMode(creep.room.controller) == ERR_NOT_IN_RANGE) {
					creep.travelTo(creep.room.controller);
				}
			} else if (creep.room.controller.safeModeAvailable > 3) {
				//enough safemodes

				//deposit ghodium into storage
				if (_.sum(creep.carry) > 0) {
					if (!_.isEmpty(creep.room.storage)) {
						creep.task = Tasks.transferAll(creep.room.storage)
						return
					}
				}

				//suicide
				/* if (_.sum(creep.carry) == 0) {
					creep.suicide()
				} */
			} else {
				//get ghodium from storage
				if (!_.isEmpty(creep.room.storage)) {
					if (creep.room.storage.store[RESOURCE_GHODIUM] >= 1000) {
						creep.task = Tasks.withdraw(creep.room.storage, RESOURCE_GHODIUM, 1000)
						return
					} else {
						creep.say("G??")
					}
				} else {
					creep.say("no storage")
				}
			}
		}

		if (!_.isEmpty(creep.room.storage)) {
			//refill powerspawn
			var powerSpawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: f => f.structureType == STRUCTURE_POWER_SPAWN
			})
			if (!_.isEmpty(powerSpawn) && creep.room.storage.store[RESOURCE_POWER] >= 100) {
				if (_.sum(creep.carry) == 0 && powerSpawn.power < powerSpawn.powerCapacity) {
					//powerspawn is missing power
					creep.task = Tasks.withdraw(creep.room.storage, RESOURCE_POWER, 100)
					return
				} else if (creep.carry[RESOURCE_POWER] > 0 && powerSpawn.power < powerSpawn.powerCapacity) {
					//place power into powerspawn
					creep.task = Tasks.transferAll(powerSpawn)
					return
				} else {
					//powerspawn is full of power, refill with energy
					if (_.sum(creep.carry) == 0) {
						if (powerSpawn.energy < powerSpawn.energyCapacity) {
							//creep is empty, and powerspawn needs energy
							creep.task = Tasks.withdraw(creep.room.storage)
							return
						}
					} else {
						if (powerSpawn.energy < powerSpawn.energyCapacity) {
							creep.task = Tasks.transfer(powerSpawn)
							return
						} else {
							if (creep.carry[RESOURCE_POWER] > 0) {
								creep.task = Tasks.transferAll(creep.room.storage)
								return
							}
							creep.task = Tasks.transferAll(creep.room.storage)
							return
						}


					}
				}
			} else {
				if (powerSpawn.power < powerSpawn.powerCapacity && creep.carry[RESOURCE_POWER] > 0) {
					creep.task = Tasks.transfer(powerSpawn)
					return
				} else {
					creep.task = Tasks.transferAll(creep.room.storage)
					return
				}
			}
		}
	}
}