'use strict';

const MemHack = require('tools.MemHack');
MemHack.register()

const profiler = require('tools.screeps-profiler');
const stats = require('tools.stats');
// eslint-disable-next-line no-unused-vars
const Traveler = require('tools.Traveler');

//Management modules
let mngEmpire = require('manager.empire');
let mngColony = require('manager.colony');

let colonies = {}
let empire = new mngEmpire()
console.log(empire.name+" initialized at "+Game.time)

for(let r in Game.rooms) {
	let room = Game.rooms[r]
	if(room.controller.my && room.controller.level > 0) {
		colonies[r] = new mngColony(empire, r)
		console.log(r+" initialized at "+Game.time)
	}
}


require('global');
require('functions.game');
require('tools.prototype.Room.structures');
require("tools.creep-tasks");
require("ext.prototype.room")
require("ext.prototype.creep")
require("ext.prototype.spawn")
require("ext.prototype.structure")
require("ext.prototype.tower")


module.exports.loop = function () {
	profiler.wrap(function () {
		MemHack.pretick()
		stats.reset()

		// 1) empire run
		empire.run()

		// 2) colony tasks
		for(let c in colonies) {
			colonies[c].run()
		}

		// 3) room tasks

		// 4) Defense

		// 5) Creep Run
		for (let creep in Game.creeps) {
			//console.log(Game.creeps[creep])

			try {
				//if creep is idle, give him work
				if (Game.creeps[creep].isIdle) {
					Game.creeps[creep].runRole()
				} /* else if (!Game.creeps[creep].hasValidTask) {
					Game.creeps[creep].runRole()
				} */
			} catch (err) {
				Game.creeps[creep].say("RUN ROLE ERR!!")
				console.log("RUN ROLE ERR: " + creep + " at " + err.stack)
			}

			try {
				Game.creeps[creep].run();
			} catch (err) {
				Game.creeps[creep].say("MAIN ERR!!")
				console.log("MAIN ERR: " + creep + " at: " + err.stack)
				//Game.creeps[creep].suicide()
				Game.creeps[creep].task = {}
			}
		}

		// 6) Spawn Run

		// 7) Room run

		// 8) Stats
		if ((Game.time % 5) == 0 && Game.cpu.bucket > 100) {
			var spawnBusy = {};
			for (var spawnName in Game.spawns) {
				if (Game.spawns[spawnName].spawning) {
					spawnBusy[Game.spawns[spawnName].name] = Game.spawns[spawnName].spawning.needTime - Game.spawns[spawnName].spawning.remainingTime;
				} else {
					spawnBusy[Game.spawns[spawnName].name] = 0;
				}
			}
			stats.addStat('spawn-busy', {}, spawnBusy)

			var countHostiles = 0;
			for (var roomName in Game.rooms) {
				var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
				if (hostiles.length > 0) {
					countHostiles = countHostiles + hostiles.length
				}
			}

			//check for hostiles in any room
			stats.addSimpleStat('hostiles', countHostiles);
			stats.addSimpleStat('creep-population', Object.keys(Game.creeps).length);

			stats.commit();
		}
	});
}