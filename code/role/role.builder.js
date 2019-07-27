var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	newTask: function (creep) {
		if (creep.carry.energy > 0) {
			//has energy -> do work

			//find important buidlsites -> SPAWN
			var closestImportantConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
				filter: (s) => s.structureType == STRUCTURE_SPAWN
			});
			//FIXME: get construction sites once, then filter on top of them

			if (!_.isEmpty(closestImportantConstructionSite)) {
				creep.task = Tasks.build(closestImportantConstructionSite);
				creep.say(EM_BUILD + " " + EM_EXCLAMATION, true);
				return;
			}

			//find important buidlsites -> TOWER
			var closestImportantConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
				filter: (s) => s.structureType == STRUCTURE_TOWER
			});
			if (!_.isEmpty(closestImportantConstructionSite)) {
				creep.task = Tasks.build(closestImportantConstructionSite);
				creep.say(EM_BUILD + " " + EM_EXCLAMATION, true);
				return;
			}

			//find important buidlsites
			var closestImportantConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
				filter: (s) => s.structureType == STRUCTURE_CONTAINER ||
					s.structureType == STRUCTURE_EXTENSION || 
					s.structureType == STRUCTURE_STORAGE
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
			var closestRepairSite = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
				filter: (s) =>
					s.structureType != STRUCTURE_CONTROLLER &&
					s.structureType != STRUCTURE_WALL &&
					s.structureType != STRUCTURE_RAMPART &&
					s.hits < s.hitsMax
			});
			if (!_.isEmpty(closestRepairSite)) {
				creep.task = Tasks.repair(closestRepairSite);
				creep.say(EM_WRENCH, true);
				return;
			}

			//repair walls & ramparts
			var ramparts = creep.room.ramparts.filter(s => s.hits < WALLMAX);
			var walls = creep.room.constructedWalls.filter(s => s.hits < WALLMAX);
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
				creep.task = Tasks.repair(target)
				creep.say(EM_WRENCH, true)
				return
			}

			//nothing to do -> upgrade controller
			if (!_.isEmpty(creep.room.controller)) {
				if (creep.room.controller.my) {
					creep.task = Tasks.upgrade(creep.room.controller);
					creep.say(EM_LIGHTNING, true);
					return;
				}
			} else {
				creep.say(EM_SINGING, true);
				return
			}

		} else {
			if (creep.getEnergy(creep, true)) {
				return;
			}
		}
	}
};