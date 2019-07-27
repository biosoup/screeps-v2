//empire management code

let tasks = require('tasks');
let task = require('task');


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
		mngColony.homeRoom = homeRoom
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

		console.log(this._homeRoom)
	}
}

module.exports = mngColony;