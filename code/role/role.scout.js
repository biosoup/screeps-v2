var Tasks = require("tools.creep-tasks");

module.exports = {
	// a function to run the logic for creep role
	/** @param {Creep} creep */
	newTask: function (creep) {
		this.breadthFirstSearch(creep);
	},
	breadthFirstSearch: function (creep) {
		if (!creep.memory.searchIndex) {
			creep.memory.searchIndex = 0;
		}

		if (!creep.memory.seen) {
			creep.memory.seen = [creep.room.name];
		}

		if (!creep.memory.search) {
			this.addExitsToSearch(creep);
			creep.memory.roomTarget = creep.memory.search[creep.memory.searchIndex];
		}

		if (creep.room.name === creep.memory.roomTarget) {
			//refresh room data
			creep.room.refreshData(creep.room.name)

			creep.memory.seen.push(creep.room.name);
			console.log(creep.name+" has seen "+creep.room.name)

			this.addExitsToSearch(creep);

			creep.memory.searchIndex++;
			creep.memory.roomTarget = creep.memory.search[creep.memory.searchIndex];
		} else {
			creep.travelTo(new RoomPosition(25, 25, creep.memory.roomTarget), {
				ignoreRoads: true
			});
			// if hostile run away?
		}
	},
	findRandomExit: function (creep) {
		let rooms = Game.map.describeExits(creep.pos.roomName);
		let exits = Object.keys(rooms);
		let random = Math.floor(Math.random() * exits.length);
		return rooms[exits[random]];
	},
	addExitsToSearch: function (creep) {
		if (!creep.memory.search) {
			creep.memory.search = [];
		}
		let rooms = Game.map.describeExits(creep.room.name);
		for (let key in rooms) {
			if (creep.memory.seen.indexOf(rooms[key]) === -1 &&
				creep.memory.search.indexOf(rooms[key]) === -1) {
				creep.memory.search.push(rooms[key]);
			}
		}
	}
}