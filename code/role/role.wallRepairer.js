var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for creep role
	/** @param {Creep} creep */
	newTask: function (creep) {
		if (!_.isEmpty(creep.memory.home) && creep.room.name != creep.memory.home) {
			creep.task = Tasks.goToRoom(creep.memory.target)
		} else {
			if (_.sum(creep.carry) > creep.carry[RESOURCE_ENERGY] && !_.isEmpty(creep.room.storage)) {
				//creep has something other than energy
				creep.task = Tasks.transferAll(creep.room.storage);
				creep.say("other")
				return;
			} else if (creep.carry.energy > 0) {
				//find buildsites for walls and ramparts
				var closestConstructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
					filter: (s) => s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL
				});
				if (!_.isEmpty(closestConstructionSite)) {
					creep.task = Tasks.build(closestConstructionSite);
					creep.say(EM_BUILD, true);
					return;
				}

				//find structures that need repairing
				if (!_.isEmpty(creep.room.ramparts)) {
					var ramparts = creep.room.ramparts.filter(s => s.hits < WALLMAX && s.hits < s.hitsMax);
				}
				if (!_.isEmpty(creep.room.constructedWalls)) {
					var walls = creep.room.constructedWalls.filter(s => s.hits < WALLMAX && s.hits < s.hitsMax);
				}
				//sort by hits
				var rampart = _.first(_.sortBy(ramparts, "hits"));
				var wall = _.first(_.sortBy(walls, "hits"));
				//console.log(creep.room.name+" R:"+rampart.hits+" W:"+wall.hits)

				if (!_.isEmpty(rampart) && !_.isEmpty(wall)) {
					if (rampart.hits < wall.hits) {
						var target = rampart;
					} else {
						var target = wall;
					}
				} else if (!_.isEmpty(rampart)) {
					var target = rampart;
				} else if (!_.isEmpty(wall)) {
					var target = wall;
				}

				// if we find a wall that has to be repaired
				if (!_.isEmpty(target)) {
					creep.task = Tasks.fortify(target)
					creep.say(EM_WRENCH, true)
					return
				} else {
					//nothing to do -> upgrade controller
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
				//get energy
				if (creep.getEnergy(creep, true)) {
					return;
				}
			}
		}
	}
}