//empire management code

let tasks = require('tasks');
let task = require('task');
var market = require('base.market');


/**
 * TODO:
 * - notify/grafana when spawning recovery harvester
 */

class mngColony {
	/**
	 * Init the class
	 * @return {tasks}
	 */
	static init() {
		if (mngColony._init !== true) {
			mngColony._init = true;
		}
	}
	/**
	 * Creates an instance.
	 *
	 * @constructor
	 * @this {tasks}
	 */
	constructor(empire, homeRoom) {
		mngColony.init();
		mngColony.taskList = empire.taskList
		this.homeRoom = homeRoom
	}

	get taskList() {
		return this._taskList;
	}
	set taskList(v) {
		this._taskList = v;
	}

	get homeRoom() {
		return this._homeRoom;
	}
	set homeRoom(v) {
		this._homeRoom = v;
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
	 * Colony
	- creep
		- spawn a creep
	- room
		- room focus ?
		- build blueprint ?
		- build defences
		- build road
		- add safemode
	- surroundings
		- add remote harvest room
		- add remote minign room
		- abandon room
	- assigned empire tasks to a colony

	Room
	- is the end point for all tasks, so all above
	 */

	/*
        Functions:
- gather colony data
    - layout
    - rooms terrain
    - put all into segments
        - one segment for each colony?
- figure out current colony status
    - level
    - what is happening
    - what needs to happen
- figure current status
    - main room
    - remote rooms
    - interest rooms
- figure current tasks
    - run logic based on them
- run colony logic
    - flag logic
    - spawning
        - colony que
        - empire requests
        - prioritization
        - spawn assigment
        - creep memory preparation
    - link logic
    - storage logic
    - terminal logic
    - market logic
    - labs logic
- gather colony stats and send them to empire
- create room visuals
        */

	run() {
		//logic for each task needed done in the empire

		//console.log("Colony: " + this.homeRoom)

		Game.rooms[this.homeRoom].creepSpawnRun(Game.rooms[this.homeRoom]);


		// find all towers
		var towers = Game.rooms[this.homeRoom].towers
		var hostileValues = Game.rooms[this.homeRoom].checkForHostiles(this.homeRoom);
		try {
			if (!_.isEmpty(towers)) {
				//find hostiles in the room
				if (!_.isEmpty(hostileValues)) {
					if (hostileValues.numHostiles > 0) {
						if (Game.rooms[this.homeRoom].controller.safeMode == undefined) {
							var hostiles = Game.rooms[this.homeRoom].find(FIND_HOSTILE_CREEPS)
							//only attack when safe mode is not active
							for (var tower of towers) {
								tower.defend(hostiles);
							}
						}
					}
				} else {
					for (var tower of towers) {
						tower.healCreeps()
						tower.repairStructures();
					}
				}
			}
		} catch (err) {
			console.log("TOWER ERR: " + tower + " " + err.stack)
		}

		//add room visuals
		if (Game.cpu.bucket > CPU_THRESHOLD) {
			try {
				Game.rooms[this.homeRoom].basicVisuals()
				Game.rooms[this.homeRoom].roomEconomy()
			} catch (err) {
				console.log("VISUALS ERR: " + tower + " " + err.stack)
			}
		}

		// refresh every 10 ticks if we have no master spawn on our own room
		if ((Game.time % 10) == 0 && _.isEmpty(Game.rooms[this.homeRoom].memory.masterSpawn) &&
			Game.cpu.bucket > CPU_THRESHOLD &&
			Game.rooms[this.homeRoom].controller != undefined &&
			Game.rooms[this.homeRoom].controller.owner != undefined &&
			Game.rooms[this.homeRoom].controller.owner.username == playerUsername) {

			Game.rooms[this.homeRoom].refreshData(this.homeRoom)
		}

		//refresh blueprints after RCL upgrade
		if ((Game.time % 10) == 0 && Game.rooms[this.homeRoom].controller.level > Game.rooms[this.homeRoom].memory.RCL && Game.cpu.bucket > CPU_THRESHOLD) {
			var response = Game.rooms[this.homeRoom].baseRCLBuild()
			console.log(this.homeRoom + " RCL upgrade! " + response)
		}
		Game.rooms[this.homeRoom].memory.RCL = Game.rooms[this.homeRoom].controller.level;

		// refresh room data 
		if ((Game.time % DELAYFLOWROOMCHECK) == 0 &&
			Game.cpu.bucket > CPU_THRESHOLD &&
			Game.rooms[this.homeRoom].controller != undefined &&
			Game.rooms[this.homeRoom].controller.owner != undefined &&
			Game.rooms[this.homeRoom].controller.owner.username == playerUsername || ROOMARRAY_REFRESH == true) {

			//refresh room data
			Game.rooms[this.homeRoom].refreshData(this.homeRoom)
			//refreshed room buildings
			Game.rooms[this.homeRoom].baseRCLBuild()

			if ((Game.time % DELAYLINK) == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
				//run link balancing
				Game.rooms[this.homeRoom].linksRun(this.homeRoom)

				//refresh refresh remote containers
				Game.rooms[this.homeRoom].refreshContainerSources(this.homeRoom)
			}


		}

		if (Game.cpu.bucket > CPU_THRESHOLD * 2 && Game.rooms[this.homeRoom].controller.my) {
			try {
				// default resource limits
				market.resourceLimits(this.homeRoom);
				// balance resources
				market.resourceBalance();
				// terminal transfers
				market.terminalCode(this.homeRoom);

				market.productionCode(this.homeRoom);

				market.labCode(this.homeRoom);
			} catch (err) {
				console.log("ROOM FNC ERR: " + this.homeRoom + " " + err.stack)
			}
		}

		if (Game.cpu.bucket > CPU_THRESHOLD * 2) {
			//run market code
			try {
				market.marketCode();
			} catch (err) {
				console.log("ROOM FNC ERR: " + this.homeRoom + " " + err.stack)
			}

		}
	}
}

module.exports = mngColony;