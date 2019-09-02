//empire management code

let tasks = require('tasks');
let task = require('task');


/**
 * TODO:
 * - notify/grafana when spawning recovery harvester
 */

class mngEmpire {
	/**
	 * Init the class
	 * @return {tasks}
	 */
	static init() {
		if (mngEmpire._init !== true) {
			mngEmpire._init = true;
		}
	}
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 * @this {tasks}
	 */
	constructor() {
		mngEmpire.init();
		mngEmpire.taskList = new tasks;
		this.name = Game.shard.name
	}

	get taskList() {
		return this._taskList;
	}
	set taskList(v) {
		this._taskList = v;
	}

	get name() {
		return this._name;
	}
	set name(v) {
		this._name = v;
	}

	/**
	 * Get memory
	 * @return {Object}
	 */
	get memory() {
		if (Memory.empire === undefined) Memory.empire = {};
		return Memory.empire;
	}

	addTask(task) {
		this.taskList.add(task);
	}

	/**
	 * Empire
	- creeps
		- scout
		- send creeps
			- defend
			- build
			- energy
			- guards
		- attack
		- harass
		- demolish
		- colonize
	- market
		- empire levels
		- sell orders
		- buy orders
	- labs
		- mineral levels
		- production targets
		- boosts
	- storage balancing
		- resource flow prioritization
		- emergency flow
	- CPU/Bucket
		- CPU optimization
			(eg. slow down some rooms, leave room for new rooms/attack/defense)
	 */

	/*
        Functions:
        - gather empire status
            - gather colony status
            - gather room inteligence
        - figure out priorities
        - generate empire tasks
        - set empire targets/goals
        - empire wide creep spawning
            - get all empire requests
            - prioritization
            - find the best colony for it
            - put it in colony spawn que
        - gather empire stats
            - from colonies
            - from remotes/interests
            - from creeps
        - publish those stats
        */

	run() {
		this.garbageCollection()
		//logic for each task needed done in the empire

		//Fill myRooms
		var myroomlist = _.values(Game.rooms).filter(r => _.get(r, ['controller', 'owner', 'username'], undefined) === playerUsername);
		for (let m in myroomlist) {
			global.myRooms[myroomlist[m].name] = myroomlist[m];
		}
		
		
		//console.log("Empire: " + this.name)
	}

	garbageCollection() {
		if (Game.time % 1 == 0) {
			//check for differences between reality and memory
			//TODO: intel into different memory part
			if (Memory.creeps)
				_.difference(Object.keys(Memory.creeps), Object.keys(Game.creeps)).forEach(function (key) {
					delete Memory.creeps[key]
				});
			if (Memory.flags)
				_.difference(Object.keys(Memory.flags), Object.keys(Game.flags)).forEach(function (key) {
					delete Memory.flags[key]
				});
			if (Memory.rooms)
				_.difference(Object.keys(Memory.rooms), Object.keys(Game.rooms)).forEach(function (key) {
					delete Memory.rooms[key]
				});
			if (Memory.spawns)
				_.difference(Object.keys(Memory.spawns), Object.keys(Game.spawns)).forEach(function (key) {
					delete Memory.spawns[key]
				});
			if (Memory.structures)
				_.difference(Object.keys(Memory.structures), Object.keys(Game.structures)).forEach(function (key) {
					delete Memory.structures[key]
				});
		}
	}
}

module.exports = mngEmpire;