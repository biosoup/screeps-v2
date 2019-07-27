var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for this role
	nonTask: function (creep) {
		//heal
		if (creep.hits < creep.hitsMax) {
			creep.heal(creep)
		}

		var injuredCreep = creep.room.find(FIND_MY_CREEPS, {
			filter: f => f.hits < f.hitsMax
		})
		if (!_.isEmpty(injuredCreep)) {
			var injuredCreep = creep.pos.findClosestByRange(injuredCreep)
			if (creep.pos.inRangeTo(injuredCreep, 3)) {
				creep.heal(injuredCreep);
			}
		}


		if (creep.room.name == creep.memory.target) {
			//if in target room

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


			//FIXME: attack healers first

			//find hostiles
			var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
			if (!_.isEmpty(hostile)) {
				if (_.isEmpty(creep.memory.travelData)) {
					creep.memory.travelData = {}
				}
				//get in for the kill
				if (creep.rangedAttack(hostile) == ERR_NOT_IN_RANGE) {
					creep.travelTo(hostile, {
						movingTarget: true,
						travelData: travelData
					});
				} else {
					if (creep.attack(hostile) == ERR_NOT_IN_RANGE) {
						creep.travelTo(hostile, {
							movingTarget: true,
							travelData: creep.memory.travelData
						});
					}
				}
				console.log(JSON.stringify(creep.memory.travelData))
				creep.say("Hostile!" + EM_SWORDS, true);
				return;
			} else {
				//find enemy structures
				var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
					filter: f => f.structureType != STRUCTURE_CONTROLLER
				})
				if (!_.isEmpty(hostile)) {
					//get in for the kill
					creep.task = Tasks.attack(hostile, {
						movingTarget: true
					})
					creep.say("Hostile!" + EM_SWORDS, true);
					return;
				}

				var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
				if (!_.isEmpty(hostile)) {
					//get in for the kill
					creep.travelTo(hostile, {
						movingTarget: true
					});
					creep.say("Hostile!" + EM_SWORDS, true);
					return;
				}

				//find damaged creeps
				var hitCreeps = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
					filter: c => c.hits < c.hitsMax
				})
				if (!_.isEmpty(hitCreeps)) {
					creep.task = Tasks.heal(hitCreeps)
					creep.say(EM_SYRINGE, true)
					return
				}


				//remove flags when no enemies
				/* var whiteFlags = _.first(_.filter(Game.flags, (f) => f.color == COLOR_WHITE && f.room == creep.room))
				if (!_.isEmpty(whiteFlags)) {
					creep.say(EM_FLAG)
					whiteFlags.remove()
				} */

				//go sign the controller
				creep.graffity()

				if ((Game.time % 3) == 0) {
					creep.say(EM_SINGING, true)

					//send guard home
					/* creep.memory.target = creep.memory.home;
					return */
				}


			}

		} else {
			//go to target room
			creep.task = Tasks.goToRoom(creep.memory.target, {
				preferHighway: true
			})
		}

	}
}