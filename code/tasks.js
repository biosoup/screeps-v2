"use strict";

let task = require('task');

class tasks {

	/**
	 * Init the class
	 * @return {tasks}
	 */
	static init() {
		if (tasks._init !== true) {
			tasks._init = true;
		}
	}

	/**
	 * Creates an instance of tasks.
	 *
	 * @constructor
	 * @this {tasks}
	 */
	constructor(empire) {
		tasks.init();
		this.empire = empire;
	}

	get empire() {
		return this._empire;
	}
	set empire(empire) {
		this._empire = empire;
	}

	get memory() {
		if (this._memory === undefined) {
			this._memory = Memory.tasks[this._empire];
			if (this._memory === undefined)
				this._memory = this.memory = {
					list: [],
					collection: {}
				};
		}
		return this._memory;
	}

	set memory(v) {
		Memory.empire.tasks = v;
	}

	get list() {
		return this.memory.list;
	}
	set list(list) {
		this.memory.list = list;
	}

	get collection() {
		if (this._collection === undefined) {
			this._collection = this.memory.collection;
			for (var i in this._collection) this._collection[i].__proto__ = task.prototype;
		}
		return this._collection;
	}
	set collection(collection) {
		this.memory.collection = collection;
	}

	getList() {
		return this.list;
	}

	add(task) {
		var myTask = this.collection[task.uid];
		if (myTask === undefined) {
			if (this.collection[task.uid] !== undefined) {
				console.log('task ' + task.uid + ' already exists!');
			} else {
				this.collection[task.uid] = task;
			}
		} else if (!myTask.equals(task)) {
			myTask.update(task);
		}
	}

	/**
	 * deletes a task
	 * @param {task, String} the task object or the task uid
	 */
	del(task) {
		let taskCode;
		if (typeof task === 'string') taskCode = task;
		else if (task instanceof task) taskCode = task.uid;
		else console.log("Task invalid.");
		if (this.collection[taskCode] instanceof task) {
			delete this.collection[taskCode];
			let i = this.list.indexOf(taskCode);
			if (i >= 0) this.list.splice(i, 1);
		} else {
			console.log("Task " + task + " " + taskCode + " does not exist.");
		}
	}

	/**
	 * Sort tasks by priority, for a given type
	 * @param {string} [type="all"]
	 * @memberof tasks
	 */
	sort(type = "all") {
		this.list = [];
		for (var i in this.collection) {
			if (this.collection[i].type == type || type == "all") {
				this.list.push(i);
			}
		}
		var tasks = this;
		this.list.sort(
			function (taskCodeA, taskCodeB) {
				var a = 0,
					b = 0;
				var taskA = tasks.collection[taskCodeA];
				var taskB = tasks.collection[taskCodeB];
				if (taskA instanceof task) a = taskA.prio;
				else {
					console.log("wrong task " + taskCodeA);
					tasks.list.splice(tasks.list.indexOf(taskCodeA), 1);
				}
				if (taskB instanceof task) b = taskB.prio;
				else {
					console.log("wrong task " + taskCodeB);
					tasks.list.splice(tasks.list.indexOf(taskCodeB), 1);
				}
				return b - a;
			}
		);
	}

	getCount() {
		return this.count = Object.keys(this.collection).length;
	}

}

module.exports = tasks;