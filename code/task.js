"use strict";

/*
Possible types of a task:
	Empire
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

	Colony
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

/*  *** Types of Task ***

Emprire
- spawn: what, where, for where, size, body type, group
- creep: send, what, where
- market: send, what, where, how much
- labs: make, what, where, how much
- terminal/storage: send, what, where, how much
- CPU: level of utilization, CPU limit
- colony: do, what, where, by whom
- room: do, what, where (safemode?)

Colony
- spawn: what, for where
- room: build, what, (from where to where)
- market: send, what
- labs: make, what
- terminal/storage: send, what
- boost: role, with what, how much


*/


class task {

	/**
	 * Init the class
	 * @return {task}
	 */
	static init() {
		if (task._init !== true) {
			task._init = true;
			//smth to do when task is first added
		}
	}

	/**
	 *Creates an instance of task.
	 * @param {string} uid                      uniqui id of a task
	 * @param {string} [empire=Game.shard.name] empire is a shard/server name
	 * @param {string} colony                   colony is group of rooms around spawn room
	 * @param {string} room                     target room for a task
	 * @param {string} type                     type of a task (spawn, creep, market, labs, storage, CPU, colony, room, boost)
	 * @param {object} [options={}]             options {} for a given task
	 * @param {number} prio                     priority of a task
	 * @param {number} [expiration=0]           Game.time expiration
	 * @memberof task
	 */
	constructor(uid, empire = Game.shard.name, colony, roomName, type, options = {}, prio, expiration = 0) {
		task.init();
		this._uid = uid;
		this.update(empire, colony, roomName, type, options, prio, expiration);
	}

	get empire() {
		return this._empire;
	}
	set empire(v) {
		this._empire = v;
	}

	get colony() {
		return this._colony;
	}
	set colony(v) {
		this._colony = v;
	}

	get type() {
		return this._type;
	}
	set type(v) {
		this._type = v;
	}

	get options() {
		return this._targetId;
	}
	set options(v) {
		this._targetId = v;
	}

	get pos() {
		return this.target.pos;
	}

	get roomName() {
		return this._roomName;
	}
	set roomName(v) {
		this._roomName = v;
	}

	get prio() {
		if (this._prio === undefined) {
			//default - medium priority
			this.prio = 100;
		}
		return this._prio;
	}
	set prio(v) {
		this._prio = v;
	}

	get expiration() {
		return this._expiration;
	}
	set expiration(v) {
		this._expiration = v;
	}

	/**
	 * Generates a unique uid of the task.
	 * @return {String}
	 */
	get uid() {
		//this.room.logError("Use deprecated Method!");
		if (this._uid === undefined) {
			this.uid = this.type + "_" + this.empire + "_" + this.colony + "_" + this.roomName + "_" + this.prio + "_" + this.expiration + "_" + _.random(999999);
		}
		return this._uid;
	}
	set uid(v) {
		this._uid = v;
	}

	// ########### task methods ############################################

	valid() {
		if (this.expiration === 0 || this.expiration > Game.time) return true;
		else return false;
	}

	/**
	 * Checks if the Task is the same.
	 * @param {task} task
	 * @return {Boolean}
	 */
	equals(empire, colony, roomName, type, options, prio, expiration) {
		if (this.empire === empire &&
			this.colony === colony &&
			this.roomName === roomName &&
			this.type === type &&
			this.options === options &&
			this.expiration === expiration &&
			((prio === undefined) ? true : this.prio === prio)) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Updates the task by new values like qty
	 * @param {task} task
	 */
	update(empire, colony, roomName, type, options, prio, expiration) {
		this.empire = empire;
		this.colony = colony;
		this.roomName = roomName;
		this.type = type;
		this.options = options;
		this.expiration = expiration;
		this.prio = prio;
	}

	/**
	 * Delete this task from room's task collection
	 * FIXME: it should not be on a room level
	 */
	delete() {
		this.room.getTasks().del(this);
	}

}

module.exports = task;