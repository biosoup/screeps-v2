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

		// if target is defined and creep is not in target room
		if (!_.isEmpty(creep.memory.target) && creep.room.name != creep.memory.target) {
			creep.task = Tasks.goToRoom(creep.memory.target)
		} else {
			//step away from edge and from road
			if (creep.pos.y == 49) {
				var step = new RoomPosition(creep.pos.x, 48, creep.room.name)
				creep.travelTo(step)
			} else if (creep.pos.y == 0) {
				var step = new RoomPosition(creep.pos.x, 1, creep.room.name)
				creep.travelTo(step)
			} else if (creep.pos.x == 49) {
				var step = new RoomPosition(48, creep.pos.y, creep.room.name)
				creep.travelTo(step)
			} else if (creep.pos.y == 0) {
				var step = new RoomPosition(1, creep.pos.y, creep.room.name)
				creep.travelTo(step)
			} else if (!_.isEmpty(creep.pos.lookFor(LOOK_STRUCTURES))) {
				var step = new RoomPosition(creep.pos.x + _.random(1), creep.pos.y + _.random(1), creep.room.name)
				creep.travelTo(step)
			}

			if (creep.carry.energy > 0) {
				//has energy -> do work

				//do not let controleer to downgrade
				if (creep.room.controller.ticksToDowngrade < 5000) {
					creep.task = Tasks.transfer(creep.room.storage);
					return;
				}

				//find important buidlsites
				var closestImportantConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
					filter: (s) =>
						s.structureType == STRUCTURE_SPAWN
				});
				if (!_.isEmpty(closestImportantConstructionSite)) {
					creep.task = Tasks.build(closestImportantConstructionSite, {
						range: 1
					});
					creep.say(EM_BUILD + " " + EM_EXCLAMATION, true);
					return;
				}

				var closestImportantConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
					filter: (s) => s.structureType == STRUCTURE_CONTAINER ||
						s.structureType == STRUCTURE_EXTENSION ||
						s.structureType == STRUCTURE_TOWER
				});
				if (!_.isEmpty(closestImportantConstructionSite)) {
					creep.task = Tasks.build(closestImportantConstructionSite);
					creep.say(EM_BUILD + " " + EM_EXCLAMATION, true);
					return;
				}

				//find buildsites
				var closestConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
				if (!_.isEmpty(closestConstructionSite)) {
					creep.task = Tasks.build(closestConstructionSite);
					creep.say(EM_BUILD, true);
					return;
				}

				//find repairs
				var closestRepairSite = creep.room.find(FIND_STRUCTURES, {
					filter: (s) =>
						(s.structureType != STRUCTURE_CONTROLLER || 
							s.structureType != STRUCTURE_RAMPART || 
							s.structureType != STRUCTURE_WALL) && s.hits < s.hitsMax
				});
				if (!_.isEmpty(closestRepairSite)) {
					//sort them by hits
					var closestRepairSite = _.first(_.sortBy(closestRepairSite, "hits"))
					creep.task = Tasks.repair(closestRepairSite);
					creep.say(EM_WRENCH, true);
					return;
				}

				//nothing to do -> upgrade controller
				if (creep.room.controller.my) {
					creep.task = Tasks.upgrade(creep.room.controller);
					creep.say(EM_LIGHTNING, true);
					return;
				} else {
					creep.say(EM_SINGING, true);
					//go sign the controller
					creep.graffity()
					return
				}

			} else {
				var containers = creep.room.containers.filter(s => s.store[RESOURCE_ENERGY] >= 100)
				if (!_.isEmpty(containers)) {
					var container = creep.pos.findClosestByRange(containers)
					if (!_.isEmpty(container)) {
						creep.task = Tasks.withdraw(container);
						return true;
					}
				}

				if (creep.getEnergy(creep, true)) {
					return;
				}
			}
		}
	}
};