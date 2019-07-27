/** main.js */
'use strict';

/* global DEFER_REQUIRE */

const MemHack = require('./tools/MemHack');
MemHack.register()

const profiler = require('./tools/screeps-profiler');
const stats = require('./tools/stats');
// eslint-disable-next-line no-unused-vars
const Traveler = require('./tools/Traveler');

//Management modules
let mngEmpire = require('mngEmpire');

// Deffered modules though we can load when we have cpu for it
DEFER_REQUIRE('global');
DEFER_REQUIRE('./tools/tools.prototype.Room.structures');
DEFER_REQUIRE("./tools/tools.creep-tasks");


module.exports.loop = function () {
	profiler.wrap(function () {
		MemHack.pretick()
		stats.reset()

		// 1) empire run
		mngEmpire.garbageCollection()

		// 2) colony tasks

		// 3) room tasks

		// 4) Defense

		// 5) Creep Run

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