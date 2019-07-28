/**
 * global.js - Configuration Constants
 */
'use strict';
var AsciiTable = require('tools.ascii-table')

/* eslint-disable no-magic-numbers, no-undef */

global.WHOAMI = (_.find(Game.structures) || _.find(Game.creeps)).owner.username;

global.MAX_ROOM_LEVEL = 8; // Because this should really be a constant.
global.MAX_OWNED_ROOMS = Infinity; // Lower this if we can't afford more.

global.CONST_COST = 0.2;
global.HARD_UNIT_CAP = Game.cpu.limit / CONST_COST; // Anything above this value is guaranteed to eat bucket.
global.SOFT_UNIT_CAP = 60; // Arbritary limit, as we're already eating bucket.
global.HARD_CONST_CAP = Game.cpu.tickLimit / CONST_COST; // Hard cap on number of const actions per tick.

// General energy-per-tick (EPT) goal to aim for
global.SOURCE_GOAL_OWNED = SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME;
global.SOURCE_GOAL_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / ENERGY_REGEN_TIME;
global.SOURCE_GOAL_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / ENERGY_REGEN_TIME;
// Optimal number of parts per source (but 1 to 3 more can lower cpu at a minor increase in creep cost)
global.SOURCE_HARVEST_PARTS = SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
// Number of carry parts needed per step (approriated from knightshade)
global.SOURCE_CARRY_PARTS_PER_DISTANCE_OWNED = SOURCE_GOAL_OWNED / CARRY_CAPACITY;
global.SOURCE_CARRY_PARTS_PER_DISTANCE_NEUTRAL = SOURCE_GOAL_NEUTRAL / CARRY_CAPACITY;
global.SOURCE_CARRY_PARTS_PER_DISTANCE_KEEPER = SOURCE_GOAL_KEEPER / CARRY_CAPACITY;
// Frequency of attacks
global.MINIMUM_INVADER = 75000;
global.SOURCE_RAID_FREQ_OWNED = MINIMUM_INVADER / (SOURCE_GOAL_OWNED * 2);
global.SOURCE_RAID_FREQ_NEUTRAL = MINIMUM_INVADER / (SOURCE_GOAL_NEUTRAL * 2);
global.SOURCE_RAID_FREQ_KEEPER = MINIMUM_INVADER / (SOURCE_GOAL_KEEPER * 3);

global.TOWER_OPERATIONS = TOWER_CAPACITY / TOWER_ENERGY_COST;

global.POWER_BANK_MIN_ATTACK = Math.ceil(POWER_BANK_HITS / ATTACK_POWER / POWER_BANK_DECAY);
global.POWER_BANK_MAX_RETURN_DAMAGE = POWER_BANK_HITS * POWER_BANK_HIT_BACK;
global.POWER_BANK_SINGLE_SPAWN = Math.ceil(POWER_BANK_HITS / ATTACK_POWER / CREEP_LIFE_TIME);

global.UPGRADER_PARTS_GOAL = Math.ceil(CONTROLLER_MAX_UPGRADE_PER_TICK / UPGRADE_CONTROLLER_POWER);
global.TICKS_TO_EMPTY_BUCKET = Math.ceil(10000 / (Game.cpu.tickLimit - Game.cpu.limit));

global.BODYPART_MAX_HITS = 100;
global.UNIT_COST = (body) => _.sum(body, p => BODYPART_COST[p.type || p]);
global.UNIT_BUILD_TIME = (body) => CREEP_SPAWN_TIME * body.length;
global.RENEW_COST = (body) => Math.ceil(SPAWN_RENEW_RATIO * UNIT_COST(body) / CREEP_SPAWN_TIME / body.length);
global.RENEW_TICKS = (body) => Math.floor(SPAWN_RENEW_RATIO * CREEP_LIFE_TIME / CREEP_SPAWN_TIME / body.length); // Can't renew claim

global.DUAL_SOURCE_MINER_SIZE = (steps, cap = SOURCE_ENERGY_CAPACITY) => Math.ceil((cap * 2) / HARVEST_POWER / (ENERGY_REGEN_TIME - steps * 2));
global.CARRY_PARTS = (capacity, steps) => Math.ceil(capacity / ENERGY_REGEN_TIME * 2 * steps / CARRY_CAPACITY);
global.DISMANTLE_RETURN = (workParts) => DISMANTLE_COST * DISMANTLE_POWER * workParts;

global.GCL_LEVEL = (i) => ((i ** GCL_POW) - ((i - 1) ** GCL_POW)) * GCL_MULTIPLY;

global.ENERGY_CAPACITY_AT_LEVEL = (x) => (CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][x] * SPAWN_ENERGY_START) + CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][x] * EXTENSION_ENERGY_CAPACITY[x];

global.TICKS_TILL_DEAD = (level, currentTimer) => _.sum(_.slice(_.values(CONTROLLER_DOWNGRADE), 0, level - 1)) + currentTimer;

/**
 * Upkeep costs in energy/tick
 */
global.RAMPART_UPKEEP = RAMPART_DECAY_AMOUNT / REPAIR_POWER / RAMPART_DECAY_TIME;
global.ROAD_UPKEEP = ROAD_DECAY_AMOUNT / REPAIR_POWER / ROAD_DECAY_TIME;
global.ROAD_UPKEEP_SWAMP = (ROAD_DECAY_AMOUNT * CONSTRUCTION_COST_ROAD_SWAMP_RATIO) / REPAIR_POWER / ROAD_DECAY_TIME;
global.ROAD_UPKEEP_TUNNEL = (ROAD_DECAY_AMOUNT * CONSTRUCTION_COST_ROAD_WALL_RATIO) / REPAIR_POWER / ROAD_DECAY_TIME;
global.CONTAINER_UPKEEP = CONTAINER_DECAY / REPAIR_POWER / CONTAINER_DECAY_TIME_OWNED;
global.REMOTE_CONTAINER_UPKEEP = CONTAINER_DECAY / REPAIR_POWER / CONTAINER_DECAY_TIME;

global.DEFAULT_BUILD_JOB_EXPIRE = 12000;
global.DEFAULT_BUILD_JOB_PRIORITY = 0.5;

global.SAFE_MODE_IGNORE_TIMER = CREEP_LIFE_TIME + 500;

global.CONTROLLER_EMERGENCY_THRESHOLD = 3000;
global.MINIMUM_RESERVATION = Math.max(CREEP_LIFE_TIME + 200, Math.ceil(CONTROLLER_RESERVE_MAX / 2));

/**
 * Range constants
 */
global.CREEP_BUILD_RANGE = 3;
global.CREEP_RANGED_ATTACK_RANGE = 3;
global.CREEP_UPGRADE_RANGE = 3;
global.CREEP_REPAIR_RANGE = 3;
global.CREEP_RANGED_HEAL_RANGE = 3;
global.CREEP_HARVEST_RANGE = 1;
global.CREEP_WITHDRAW_RANGE = 1;
global.MINIMUM_SAFE_FLEE_DISTANCE = 4; // Because ranged actions as usually 3.

global.FATIGUE_ROAD = 0.5;
global.FATIGUE_BASE = 1;
global.FATIGUE_SWAMP = 5;

global.NUKE_EFFECT_RANGE = 2;

global.PATHFINDER_MAX_ROOMS = 64;

global.BUCKET_MAX = 10000;
global.BUCKET_LIMITER = true; // Default to enabled during resets.
global.BUCKET_LIMITER_LOWER = 4000;
global.BUCKET_LIMITER_UPPER = 6000;

/** Critical infrastructure is auto-ramparted periodically or on creation */
global.CRITICAL_INFRASTRUCTURE = [STRUCTURE_LINK, STRUCTURE_STORAGE, STRUCTURE_SPAWN, STRUCTURE_TERMINAL, STRUCTURE_NUKER, STRUCTURE_OBSERVER, STRUCTURE_TOWER, STRUCTURE_POWER_SPAWN, STRUCTURE_LAB, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN];

/** primary flag types */
//TODO: adjust
global.FLAG_MILITARY = COLOR_RED; // Military
global.FLAG_MINING = COLOR_YELLOW; // Economy

/** military flags */
global.STRATEGY_ATTACK = COLOR_RED;
global.STRATEGY_DISMANTLE = COLOR_PURPLE; // Similar to PLAN_DEMOLISH, but no carry. Just take shit apart.
global.STRATEGY_SCOUT = COLOR_BLUE; // Assign a scout to this location (memory: auto disable?)
global.STRATEGY_STEAL = COLOR_CYAN; // (MOVE,CARRY) drains resources
global.STRATEGY_DEFEND = COLOR_GREEN; // Maintain a guard post. (melee or ranged though?)
global.STRATEGY_RESPOND = COLOR_YELLOW; // Summons specialized guards to respond to threats.
global.STRATEGY_RESERVE = COLOR_ORANGE;
global.STRATEGY_G = COLOR_BROWN;
global.STRATEGY_H = COLOR_GREY; // put a reserver here to hold the room.
global.STRATEGY_I = COLOR_WHITE;

/** economy flags */ // SITE_SK?
global.SITE_DUAL_MINER = COLOR_RED;
global.SITE_STATUS_UNKNOWN = COLOR_PURPLE;
global.SITE_SKMINE = COLOR_BLUE; // ? requests guards?
global.SITE_PICKUP = COLOR_CYAN; // in use, desginated pickup site for haulers
global.SITE_LOCAL = COLOR_YELLOW;
global.SITE_MINERAL = COLOR_ORANGE; // in use, builds extractors
global.SITE_LAB = COLOR_BROWN;
global.SITE_REMOTE = COLOR_GREY;
global.SITE_IDLE = COLOR_WHITE; // in use, idle sites are ignored

Object.defineProperty(global, 'CPU_LIMITER', {
	get: function () {
		// @todo: adjust limit based on remaining bucket, and log function
		return Game.cpu.getUsed() > Game.cpu.limit - 1;
	},
	configurable: true
});

global.BODYPART_THREAT = {
	[HEAL]: 150,
	[ATTACK]: 100,
	[RANGED_ATTACK]: 50,
	[WORK]: 10,
	[CLAIM]: 10,
	[CARRY]: 5,
	[MOVE]: 2,
	[TOUGH]: 1
};

/**
 * Will probably be evaluated as max (priority / distance).
 */
global.STRUCTURE_THREAT = {
	[STRUCTURE_SPAWN]: 1.0,
	[STRUCTURE_TOWER]: 0.95, // These _must_ die.
	[STRUCTURE_EXTENSION]: 0.75,
	[STRUCTURE_STORAGE]: 0.75, // May be adjusted for contents
	[STRUCTURE_TERMINAL]: 0.75,
	[STRUCTURE_LINK]: 0.10,
	[STRUCTURE_WALL]: 0.5,
	[STRUCTURE_OBSERVER]: 0,
	[STRUCTURE_EXTRACTOR]: 0,
	[STRUCTURE_ROAD]: 0, // These aren't threats
	[STRUCTURE_RAMPART]: 0, // will be dealth with if in the way.
	[STRUCTURE_WALL]: 0,
	[STRUCTURE_CONTAINER]: 0,
};

/**
 * Relationship is max (priority  || 1) / distance
 * So if we want something to _always_ take priority,
 * it must be > 50 * priority of the next lowesst.
 */
global.STRUCTURE_BUILD_PRIORITY = {
	[STRUCTURE_SPAWN]: 1.00,
	[STRUCTURE_TOWER]: 0.9,
	[STRUCTURE_LINK]: 0.70,
	[STRUCTURE_EXTENSION]: 0.65,
	[STRUCTURE_STORAGE]: 0.5,
	[STRUCTURE_OBSERVER]: 0.5,
	[STRUCTURE_TERMINAL]: 0.5, // Should build before extractor
	[STRUCTURE_EXTRACTOR]: 0.4,
	[STRUCTURE_CONTAINER]: 0.35,
	[STRUCTURE_WALL]: 0.25,
	[STRUCTURE_RAMPART]: 0.25,
	[STRUCTURE_ROAD]: 0.25,
	[STRUCTURE_NUKER]: 0.20, // Not important to infrastructure
	[STRUCTURE_POWER_SPAWN]: 0.10,
	[STRUCTURE_LAB]: 0.10
};

/**
 * Directional lookup table
 * @example: let [dx,dy] = DIR_TABLE[dir];
 */
global.DIR_TABLE = {
	[TOP]: [0, -1],
	[TOP_RIGHT]: [1, -1],
	[RIGHT]: [1, 0],
	[BOTTOM_RIGHT]: [1, 1],
	[BOTTOM]: [0, 1],
	[BOTTOM_LEFT]: [-1, 1],
	[LEFT]: [-1, 0],
	[TOP_LEFT]: [-1, -1]
};

// Unicode options
// https://en.wikipedia.org/wiki/List_of_Unicode_characters
global.UNICODE_ARROWS = {
	[TOP]: "\u2191",
	[TOP_RIGHT]: "\u2197",
	[RIGHT]: "\u2192",
	[BOTTOM_RIGHT]: "\u2198",
	[BOTTOM]: "\u2193",
	[BOTTOM_LEFT]: "\u2199",
	[LEFT]: "\u2190",
	[TOP_LEFT]: "\u2196",
	"ARROW_BARS": "\u21B9",
	"THREE_RIGHT": "\u21F6",
};
global.UNICODE = {
	MU: '\u03BC', // Greek letter mu. Mathematical average.
};
// Number forms:
// \u2160 - \u216F

global.DIAGONALS = [TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT, TOP_LEFT];
global.HORIZONTALS = [TOP, BOTTOM, LEFT, RIGHT];

global.REVERSE_DIR = {
	[TOP]: BOTTOM,
	[TOP_RIGHT]: BOTTOM_LEFT,
	[RIGHT]: LEFT,
	[BOTTOM_RIGHT]: TOP_LEFT,
	[BOTTOM]: TOP,
	[BOTTOM_LEFT]: TOP_RIGHT,
	[LEFT]: RIGHT,
	[TOP_LEFT]: BOTTOM_RIGHT
};

/**
 * Stolen from dragoonreas github
 * https://github.com/dragoonreas/Screeps/blob/9a1c6dbccad327d481a774f20b8152ecce117a0b/scripts/globals.js
 */
global.ICONS = {
	[STRUCTURE_CONTROLLER]: "\uD83C\uDFF0",
	[STRUCTURE_SPAWN]: "\uD83C\uDFE5",
	[STRUCTURE_EXTENSION]: "\uD83C\uDFEA",
	[STRUCTURE_CONTAINER]: "\uD83D\uDCE4",
	[STRUCTURE_STORAGE]: "\uD83C\uDFE6",
	[STRUCTURE_RAMPART]: "\uD83D\uDEA7",
	[STRUCTURE_WALL]: "\u26F0",
	[STRUCTURE_TOWER]: "\uD83D\uDD2B",
	[STRUCTURE_ROAD]: "\uD83D\uDEE3",
	[STRUCTURE_LINK]: "\uD83D\uDCEE",
	[STRUCTURE_EXTRACTOR]: "\uD83C\uDFED",
	[STRUCTURE_LAB]: "\u2697",
	[STRUCTURE_TERMINAL]: "\uD83C\uDFEC",
	[STRUCTURE_OBSERVER]: "\uD83D\uDCE1",
	[STRUCTURE_POWER_SPAWN]: "\uD83C\uDFDB",
	[STRUCTURE_NUKER]: "\u2622",
	[STRUCTURE_KEEPER_LAIR]: "" // TODO: Add icon for keeper lair
		,
	[STRUCTURE_PORTAL]: "" // TODO: Add icon for portal
		,
	[STRUCTURE_POWER_BANK]: "" // TODO: Add icon for power bank
		,
	source: "" // TODO: Add icon for source
		,
	constructionSite: "\uD83C\uDFD7",
	resource: "\uD83D\uDEE2",
	creep: "" // TODO: Add icon for creep
		,
	moveTo: "\u27A1",
	attack: "\uD83D\uDDE1" // NOTE: Same as attackController
		,
	build: "\uD83D\uDD28",
	repair: "\uD83D\uDD27",
	dismantle: "\u2692",
	harvest: "\u26CF",
	pickup: "\u2B07" // NOTE: Same as withdraw
		,
	withdraw: "\u2B07" // NOTE: Same as pickup
		,
	transfer: "\u2B06" // NOTE: Same as upgradeController
		,
	upgradeController: "\u2B06" // NOTE: Same as transfer
		,
	claimController: "\uD83D\uDDDD",
	reserveController: "\uD83D\uDD12",
	attackController: "\uD83D\uDDE1" // NOTE: Same as attack
		,
	recycle: "\u267B",
	wait0: "\uD83D\uDD5B" // 12:00
		,
	wait1: "\uD83D\uDD67" // 12:30
		,
	wait2: "\uD83D\uDD50" // 01:00
		,
	wait3: "\uD83D\uDD5C" // 01:30
		,
	wait4: "\uD83D\uDD51" // 02:00
		,
	wait5: "\uD83D\uDD5D" // 02:30
		,
	wait6: "\uD83D\uDD52" // 03:00
		,
	wait7: "\uD83D\uDD5E" // 03:30
		,
	wait8: "\uD83D\uDD53" // 04:00
		,
	wait9: "\uD83D\uDD5F" // 04:30
		,
	wait10: "\uD83D\uDD54" // 05:00
		,
	wait11: "\uD83D\uDD60" // 05:30
		,
	wait12: "\uD83D\uDD55" // 06:00
		,
	wait13: "\uD83D\uDD61" // 06:30
		,
	wait14: "\uD83D\uDD56" // 07:00
		,
	wait15: "\uD83D\uDD62" // 07:30
		,
	wait16: "\uD83D\uDD57" // 08:00
		,
	wait17: "\uD83D\uDD63" // 08:30
		,
	wait18: "\uD83D\uDD58" // 09:00
		,
	wait19: "\uD83D\uDD64" // 09:30
		,
	wait20: "\uD83D\uDD59" // 10:00
		,
	wait21: "\uD83D\uDD65" // 10:30
		,
	wait22: "\uD83D\uDD5A" // 11:00
		,
	wait23: "\uD83D\uDD66" // 11:30
		,
	testPassed: "\uD83C\uDF89" // for when scout reaches its goal location
		,
	testFinished: "\uD83C\uDFC1" // for when scout has finished its test run
};

// Appropriated from engineeryo
global.RES_COLORS = {
	[RESOURCE_HYDROGEN]: '#989898',
	[RESOURCE_OXYGEN]: '#989898',
	[RESOURCE_UTRIUM]: '#48C5E5',
	[RESOURCE_LEMERGIUM]: '#24D490',
	[RESOURCE_KEANIUM]: '#9269EC',
	[RESOURCE_ZYNTHIUM]: '#D9B478',
	[RESOURCE_CATALYST]: '#F26D6F',
	[RESOURCE_ENERGY]: '#FEE476',
	[RESOURCE_POWER]: '#F1243A',

	[RESOURCE_HYDROXIDE]: '#B4B4B4',
	[RESOURCE_ZYNTHIUM_KEANITE]: '#B4B4B4',
	[RESOURCE_UTRIUM_LEMERGITE]: '#B4B4B4',
	[RESOURCE_GHODIUM]: '#FFFFFF',

	UH: '#50D7F9',
	UO: '#50D7F9',
	KH: '#A071FF',
	KO: '#A071FF',
	LH: '#00F4A2',
	LO: '#00F4A2',
	ZH: '#FDD388',
	ZO: '#FDD388',
	GH: '#FFFFFF',
	GO: '#FFFFFF',

	UH2O: '#50D7F9',
	UHO2: '#50D7F9',
	KH2O: '#A071FF',
	KHO2: '#A071FF',
	LH2O: '#00F4A2',
	LHO2: '#00F4A2',
	ZH2O: '#FDD388',
	ZHO2: '#FDD388',
	GH2O: '#FFFFFF',
	GHO2: '#FFFFFF',

	XUH2O: '#50D7F9',
	XUHO2: '#50D7F9',
	XKH2O: '#A071FF',
	XKHO2: '#A071FF',
	XLH2O: '#00F4A2',
	XLHO2: '#00F4A2',
	XZH2O: '#FDD388',
	XZHO2: '#FDD388',
	XGH2O: '#FFFFFF',
	XGHO2: '#FFFFFF'
};

global.DELAYFLOWROOMCHECK = 313;
global.DELAYMARKETAUTOSELL = 7;
global.DELAYMARKETBUY = 3;
global.DELAYFLAGCOLORS = 31;
global.DELAYRESOURCEBALANCING = 9;
global.DELAYROOMSCANNING = 23;
global.DELAYFLAGFINDING = 20;
global.DELAYRESOURCEFINDING = 3;
global.DELAYPANICFLAG = 5;
global.DELAYSPAWNING = 13;
global.DELAYLINK = 2;
global.DELAYPRODUCTION = 7;
global.DELAYLAB = 10;
global.DELAYRCL8INSTALLATION = 100;
global.DELAYDROPPEDENERGY = 3;
global.RESOURCE_SPACE = "space";
global.TERMINAL_PACKETSIZE = 5000; //Size of packets in resource balancing system
global.AUTOSELL_PACKETSIZE = 5000;
global.BUY_PACKETSIZE = 5000;
global.TERMINALMARKETSTORE = 50000;
global.RBS_PACKETSIZE = 5000;
global.CPU_THRESHOLD = 500;
global.WALLMAX = 10000000;
global.MINSURPLUSENERGY = 50000; //multiplied by RCL to get storage energy stresholds
global.LOG_TERMINAL = false;
global.LOG_MARKET = true;
global.LOG_SPAWN = false;
global.LOG_EXPIRE = true;
global.LOG_PANICFLAG = true;
global.LOG_INFO = true;
global.ROOMARRAY_REFRESH = false;

/**
 * Emoji constants! (Because github integration mangles them in a non-nice way)
 */

global.EM_ZZZ = "\ud83d\udca4"; // "💤"
global.EM_COOKIE = "\ud83c\udf6a"; // "🍪"
global.EM_TEA = "\ud83c\udf75"; // "🍵"
global.EM_COFFEE = "\u2615"; // "☕"
global.EM_LIGHTNING = "\u26a1"; // "⚡"
global.EM_BUILD = "\u2692"; // "⚒"
global.EM_HAMMER = "\ud83d\udd28"; // "🔨"
global.EM_BOMB = "\ud83d\udca3"; // "💣"
global.EM_PACKAGE = "\ud83d\udce6"; // "📦"
global.EM_TRUCK = "\ud83d\ude9a"; // "🚚"
global.EM_EXCLAMATION = "\u2757"; // "❗"
global.EM_PIN = "\ud83d\udccd"; // "📍"
global.EM_WRENCH = "\ud83d\udd27"; // "🔧"
global.EM_FLEX = "\ud83d\udcaa"; // "💪"
global.EM_FLAG = "\ud83d\udea9"; // "🚩"
global.EM_KILL = "\u2620\ufe0f"; // "☠️"
global.EM_SWORDS = "\u2694"; // "⚔"
global.EM_ARROW = "\u2650"; // "♐"
global.EM_SYRINGE = "\ud83d\udc89"; // "💉"
global.EM_SWIMMING = "\ud83c\udfca"; // "🏊"
global.EM_SINGING = "\u266b\u266a\u266b"; // "♫♪♫"

/**
 * Global functions
 * @todo stick in actual cache?
 */
global.DEFINE_CACHED_GETTER = function (proto, propertyName, fn, enumerable = false) {
	Object.defineProperty(proto, propertyName, {
		get: function () {
			if (this === proto || this == null)
				return null;
			var result = fn.call(this, this);
			Object.defineProperty(this, propertyName, {
				value: result,
				configurable: true,
				enumerable: false
			});
			return result;
		},
		configurable: true,
		enumerable: enumerable
	});
};

global.DEFINE_GETTER = function (proto, propertyName, fn, enumerable = false) {
	Object.defineProperty(proto, propertyName, {
		get: function () {
			return fn.call(this, this);
		},
		configurable: true,
		enumerable: enumerable
	});
};

global.DEFINE_BACKED_PROPERTY = function (proto, propertyName, store, opts = {}) {
	const {
		enumerable = false, key = propertyName
	} = opts;
	Object.defineProperty(proto, propertyName, {
		get: function () {
			return this[store][key];
		},
		set: function (v) {
			return (this[store][key] = v);
		},
		configurable: true,
		enumerable: enumerable
	});
};

global.DEFINE_MEMORY_BACKED_PROPERTY = function (proto, propertyName, opts = {}) {
	/* const {enumerable = false, key = propertyName} = opts;
	Object.defineProperty(proto, propertyName, {
		get: function () {
			return this.memory[key];
		},
		set: function (v) {
			return (this.memory[key] = v);
		},
		configurable: true,
		enumerable: enumerable
	}); */
	DEFINE_BACKED_PROPERTY(proto, propertyName, 'memory', opts);
};

global.DEFINE_CACHE_BACKED_PROPERTY = function (proto, propertyName, opts = {}) {
	DEFINE_BACKED_PROPERTY(proto, propertyName, 'cache', opts);
};

global.STACK_TRACE = function () {
	return new Error("Stack Trace").stack;
};

/* global.HSV_COLORS = [];
for(var i=0; i<100; i++)
	HSV_COLORS[i] = Util.getColorBasedOnPercentage(i);
*/

global.profile = function (ticks = 30, filter = null) {
	Game.profiler.profile(ticks, filter);
};

// ncshupheo's wall score
global.wcmc = (hits) => Math.floor(254 * Math.sqrt(Math.sqrt(hits / WALL_HITS_MAX)) + 1);

global.goid = (x) => Game.getObjectById(x); // get object by id
global.exg = (x) => ex(goid(x));

global.wroom = function (roomName, fn) { // with room
	const ob = _.find(Game.structures, (s) => s.structureType === STRUCTURE_OBSERVER && Game.map.getRoomLinearDistance(s.pos.roomName, roomName) <= OBSERVER_RANGE && s.exec(roomName, fn) === OK);
	if (!ob)
		return "No observer in range";
	return ob;
};

/**
 *
 */
global.releaseRoom = function (roomName, confirm = false) {
	if (confirm !== true)
		return "Confirmation required";
	_(Game.flags).filter('pos.roomName', roomName).invoke('remove').commit();
	_(Game.structures).filter('pos.roomName', roomName).invoke('destroy').commit();
	_(Game.creeps).filter('pos.roomName', roomName).invoke('suicide').commit();
};

global.resetRoom = function (roomName) {
	var room = Game.rooms[roomName];
	room.find(FIND_FLAGS).forEach(f => f.remove());
	room.find(FIND_STRUCTURES).forEach(s => s.destroy());
	room.find(FIND_MY_CREEPS).forEach(c => c.suicide());
	Memory.rooms[roomName] = undefined;
};

global.memLargestKey = function () {
	return _.max(Object.keys(Memory), k => JSON.stringify(Memory[k]).length);
};

global.largestKey = function (a) {
	return _.max(Object.keys(a), k => JSON.stringify(a[k]).length);
};

global.memStats = function () {
	// return ex(_.transform(Memory, (r,n,k) => r[k] = JSON.stringify(Memory[k]).length, {} ));
	return ex(_.mapValues(Memory, (v) => JSON.stringify(v).length));
};

/**
 * Loops over only functions on the prototype and
 * passes them to a callback function.
 */
global.forEachFn = function forEachFn(proto, cb) {
	var names = Object.getOwnPropertyNames(proto);
	var name, j, desc;
	for (j = 0; j < names.length; j++) {
		name = names[j];
		desc = Object.getOwnPropertyDescriptor(proto, name);
		if (desc.get !== undefined || desc.set !== undefined)
			continue;
		cb(name, proto);
	}
};

/** Set height of console, author Spedwards */
global.setConsoleLines = function (lines) {
	console.log(`<script>document.querySelector('.editor-panel').style.height = "${Math.ceil(lines * 22.5714) + 30}px";</script>`);
};

global.countCreeps = function () {
	var totalCount = 0
	for (var roomName in Game.rooms) {
		if (!_.isEmpty(Game.rooms[roomName].spawns)) {
			var creeps = _.filter(Game.creeps, (c) => c.memory.home == Game.rooms[roomName].name)
			var creepsPerSpawn = creeps.length / (Game.rooms[roomName].spawns).length

			//sum of parts
			var parts = _.sum(creeps, h => _.sum(h.body, part => part.type != ""))

			totalCount = totalCount + creeps.length
			console.log(roomName + " Has " + creeps.length + " creeps alive with " + parts + " (avgSize: " + (creepsPerSpawn).toFixed(2) + ") parts from " + (Game.rooms[roomName].spawns).length +
				" spawns. Parts left for spawning: " + ((500 * (Game.rooms[roomName].spawns).length) - parts))
		}
	}
	return totalCount;
}


global.listCreeps = function (displayRole) {
	var returnstring = "<table><tr><th>Role  </th>";
	var roleTable = [];
	var total = [];

	myRooms = Game.rooms

	// ISSUES - my creeps do not have "homeroom" set up

	//Prepare header row
	for (var r in myRooms) {
		if (myRooms[r].controller.level > 0) {
			returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
			let roomCreeps = _.filter(Game.creeps, function (c) {
				return c.memory.home == myRooms[r].name;
			});
			for (let c in roomCreeps) {
				if (roleTable.indexOf(roomCreeps[c].memory.role) == -1) {
					roleTable.push(roomCreeps[c].memory.role);
				}
			}
		}
	}
	returnstring = returnstring.concat("</tr>");
	roleTable.sort();
	for (let role in roleTable) {
		if (arguments.length == 0 || displayRole == roleTable[role]) {
			returnstring = returnstring.concat("<tr></tr><td>" + roleTable[role] + "  </td>");
			let c = -1;
			for (var r in myRooms) {
				if (myRooms[r].controller.level > 0) {
					c++;
					let amount;
					let roleCreeps = _.filter(Game.creeps, function (c) {
						return (c.memory.role == roleTable[role] && c.memory.home == myRooms[r].name);
					});
					amount = roleCreeps.length;
					returnstring = returnstring.concat("<td>" + prettyInt(amount) + "  </td>");
					if (total[c] == undefined) {
						total[c] = amount;
					} else {
						total[c] += amount;
					}
				}
			}
			returnstring = returnstring.concat("</tr>");
		}
	}
	returnstring = returnstring.concat("<tr></tr><td>Total  </td>");
	for (let c in total) {
		returnstring = returnstring.concat("<td>" + prettyInt(total[c]) + " </td>");
	}
	returnstring = returnstring.concat("</tr></table>");
	return returnstring;
};

/**
 * Unicode escape function.
 * Sauced from: https://gist.github.com/mathiasbynens/1243213
 */
global.unicodeEscape = function (str) {
	return str.replace(/[\s\S]/g, function (character) {
		var escape = character.charCodeAt().toString(16),
			longhand = escape.length > 2;
		return '\\' + (longhand ? 'u' : 'x') + ('0000' + escape).slice(longhand ? -4 : -2);
	});
};

global.activeTerminals = function () {
	let entries = 0;
	let returnString = "";
	for (r in myRooms) {
		if (myRooms[r].memory.terminalTransfer != undefined) {
			entries++;
			var info = myRooms[r].memory.terminalTransfer.split(":");
			let targetRoom = info[0];
			let amount = parseInt(info[1]);
			let resource = info[2];
			let comment = info[3];
			if (comment == "MarketOrder") {
				returnString = returnString.concat(myRooms[r].name + ": " + "Sending " + amount + " " + resource + " to room " + targetRoom + "<br>");
			} else {
				returnString = returnString.concat(myRooms[r].name + ": " + "Sending " + amount + " " + resource + " to room " + targetRoom + "<br>");
			}
		}
	}

	if (entries == 0) {
		returnString = "No active terminals.";
	}

	return returnString;
};

global.activeLabs = function () {
	let entries = 0;
	let returnString = "";
	for (r in myRooms) {
		if (myRooms[r].memory.labOrder != undefined) {
			entries++;
			var info = myRooms[r].memory.labOrder.split(":");
			let amount = parseInt(info[0]);
			let resource1 = info[1];
			let resource2 = info[2];
			returnString = returnString.concat(myRooms[r].name + ": " + "Reaction -> [ " + amount + " " + resource1 + " + " + resource2 + " ]<br>");
		}
	}

	if (entries == 0) {
		returnString = "No active labs.";
	}

	return returnString;
};


global.buy = function (orderID, amount) {
	if (arguments.length == 0) {
		return "buy (orderID, amount)";
	}
	var order = Game.market.getOrderById(orderID);

	if (order == null) {
		return "Invalid order ID!"
	}

	if (order.remainingAmount < amount) {
		return "Order does not contain enough material!"
	}

	if (Game.market.credits < order.price * amount) {
		return "Not enough credits!"
	}

	if (!_.isEmpty(Memory.buyOrder)) {
		return "Active buy order found: " + Memory.buyOrder;
	}

	Memory.buyOrder = amount + ":" + order.id;
	return "Buy queue created!";
};

global.sell = function (orderID, amount, roomName) {
	if (arguments.length == 0) {
		return "sell (orderID, amount, roomName)";
	}
	let order = Game.market.getOrderById(orderID);

	if (order == null) {
		return "Invalid order ID!"
	}
	if (Game.rooms[roomName].memory.terminalTransfer == undefined) {
		Game.rooms[roomName].memory.terminalTransfer = order.id + ":" + amount + ":" + order.resourceType + ":MarketOrder";
		return "Selling transfer scheduled.";
	} else {
		return "Ongoing terminal transfer found. Try later.";
	}
};

global.sellBulk = function (amount, resource) {
	// Sell as much as possible as fast as possible, no matter the energy costs or price
	if (arguments.length == 0) {
		return "sellBulk (amount, resource)";
	}
	let amountBuffer = amount;
	let orders = Game.market.getAllOrders({
		type: ORDER_BUY,
		resourceType: resource
	});
	if (orders.length > 0) {


		orders = _.sortBy(orders, "price");
		orders = _.sortBy(orders, "amount");
		orders.reverse();

		let orderIndex = 0;
		for (let r in myRooms) {
			if (orders[orderIndex] != undefined && myRooms[r].terminal != undefined && myRooms[r].memory.terminalTransfer == undefined) {
				let sellAmount;
				if (orders[orderIndex].amount > amount) {
					sellAmount = amount;
				} else {
					sellAmount = orders[orderIndex].amount;
				}

				if (sellAmount <= 0) {
					break;
				} else {
					sell(orders[orderIndex].id, sellAmount, r);
				}
				amount -= sellAmount;
				orderIndex++;
			}
		}
	}
	if (amount < 0) {
		amount = 0;
	}
	return (amountBuffer - amount) + " units queued for sale.";
};

global.sellHigh = function (amount, resource) {
	// Sell as much as possible as expensive as possible, no matter the energy costs
	if (arguments.length == 0) {
		return "sellHigh (amount, resource)";
	}
	let amountBuffer = amount;
	let orders = Game.market.getAllOrders({
		type: ORDER_BUY,
		resourceType: resource
	});
	if (orders.length > 0) {

		orders = _.sortBy(orders, "amount");
		orders = _.sortBy(orders, "price");
		orders.reverse();

		let orderIndex = 0;
		for (let r in myRooms) {
			if (myRooms[r].terminal != undefined && myRooms[r].memory.terminalTransfer == undefined) {
				let sellAmount;
				if (orders[orderIndex].amount > amount) {
					sellAmount = amount;
				} else {
					sellAmount = orders[orderIndex].amount;
				}

				if (sellAmount <= 0) {
					break;
				} else {
					sell(orders[orderIndex].id, sellAmount, r);
				}
				amount -= sellAmount;
				orderIndex++;
			}
		}
	}
	if (amount < 0) {
		amount = 0;
	}
	return (amountBuffer - amount) + " units queued for sale.";
};

global.buyLow = function (amount, resource, priceLimit) {
	// buy as much as need below price limit
	if (arguments.length == 0) {
		return "buyLow (amount, resource, priceLimit)";
	}
	let amountBuffer = amount;
	let orders = Game.market.getAllOrders({
		type: ORDER_SELL,
		resourceType: resource
	});
	if (orders.length > 0) {
		orders = _.filter(orders, (f) => f.price <= priceLimit && f.remainingAmount > 0)
		orders = _.sortBy(orders, "amount");
		orders = _.sortBy(orders, "price");

		//this.console.log(this.JSON.stringify(orders))
		if (!_.isEmpty(orders)) {
			let orderIndex = 0;
			for (let r in myRooms) {
				if (myRooms[r].terminal != undefined && myRooms[r].memory.terminalTransfer == undefined) {
					let buyAmount;
					if (orders[orderIndex].amount > amount) {
						buyAmount = amount;
					} else {
						buyAmount = orders[orderIndex].amount;
					}

					if (buyAmount <= 0) {
						break;
					} else {
						buy(orders[orderIndex].id, buyAmount);

						amount -= buyAmount;
						return (amountBuffer - amount) + " units queued for buy." + orders[orderIndex].id + " " + buyAmount + " " + orders[orderIndex].price;
					}

					orderIndex++;
				}
			}
		}
	} else {
		return "No valid sell orders on the market!"
	}
	if (amount < 0) {
		amount = 0;
	}
	return (amountBuffer - amount) + " units queued for buy.";
};

global.sellOrder = function (amount, resource, roomName, price) {
	if (arguments.length == 0) {
		return "sellOrder (amount, resource, roomName, price)";
	}

	if (Game.rooms[roomName].storage != undefined && Game.rooms[roomName].storage.store[resource] >= amount) {
		if (Game.market.createOrder(ORDER_SELL, resource, price, amount, roomName) == OK) {
			return "Sell order created!";
		}
	} else {
		return "Room " + roomName + " is not able to sell this resource.";
	}
};

global.buyOrder = function (amount, resource, roomName, price) {
	if (arguments.length == 0) {
		return "buyOrder (amount, resource, roomName, price)";
	}
	if (Game.market.createOrder(ORDER_BUY, resource, price, amount, roomName) == OK) {
		return "Buy order created!";
	}
};

global.countConstructionSites = function () {
	//shard wide check for number of construction sites
	var count = 0
	for (var roomName in Game.rooms) {
		var cs = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES)
		count = count + cs.length
	}
	return count
}

global.terminalTransfer = function (transferResource, transferAmount, targetRoomName, transferFlag) {
	// transfer resources to remote room from whatever room(s) is cheapest
	var roomCandidates = [];
	var tempArray = [];
	var resourceTotal = 0;

	if (arguments.length == 0) {
		return "terminalTransfer (transferResource, transferAmount, targetRoomName, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W16S47\", false)";
	}

	if (transferAmount < 100) {
		return "Minimal amount for terminal transfers are 100 units.";
	}

	for (var r in myRooms) {
		if (Game.rooms[r].terminal != undefined && Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
			//Fill candidate array with rooms
			var roomResourceTotal = 0;
			var roomArray = [];

			// Add resource in storage
			if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[transferResource] != undefined) {
				roomResourceTotal += Game.rooms[r].storage.store[transferResource];
			}

			// Add resource in containers
			tempArray = Game.rooms[r].memory.roomArrayContainers;
			var container;
			for (var s in tempArray) {
				container = Game.getObjectById(tempArray[s]);
				if (container != undefined) {
					if (container.store[transferResource] != undefined) {
						roomResourceTotal += container.store[transferResource];
					}
				}
			}

			if (transferResource == RESOURCE_ENERGY) {
				// Add resource in links
				tempArray = Game.rooms[r].memory.roomArrayLinks;
				for (var s in tempArray) {
					container = Game.getObjectById(tempArray[s]);
					if (container != undefined) {
						roomResourceTotal += Game.getObjectById(tempArray[s]).energy;
					}
				}
			}

			if (roomResourceTotal > 0 && Game.rooms[r].name != targetRoomName) {
				roomArray["name"] = Game.rooms[r].name;
				roomArray["volume"] = roomResourceTotal;

				if (roomResourceTotal > transferAmount) {
					roomArray["totalCost"] = Game.market.calcTransactionCost(transferAmount, Game.rooms[r].name, targetRoomName);
				} else {
					roomArray["totalCost"] = Game.market.calcTransactionCost(roomResourceTotal, Game.rooms[r].name, targetRoomName);
				}
				roomArray["cost"] = Game.market.calcTransactionCost(100, roomArray.name, targetRoomName);

				if (transferFlag == false) {
					console.log(roomArray.name + ": " + roomResourceTotal + " of " + transferResource + " (energy factor: " + roomArray.cost + ")");
				}

				roomCandidates.push(roomArray);
				resourceTotal += roomResourceTotal;
			}
		}
	}

	var totalVolume = 0;
	var totalCost = 0;

	if (roomCandidates.length == 0) {
		return "No rooms with " + transferResource + " found.";
	} else if (resourceTotal < transferAmount) {
		return "Not enough " + transferResource + " found.";
	} else {
		// There are rooms holding enough of the transfer resource
		var candidatesByCost = _.sortBy(roomCandidates, "cost");

		for (var c in candidatesByCost) {
			if (Game.rooms[candidatesByCost[c].name].memory.terminalTransfer == undefined) {
				if (candidatesByCost[c].volume > transferAmount) {
					if (transferFlag == false) {
						console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
					} else if (transferFlag == true) {
						Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer";
						//console.log(transferAmount + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoomName + " for " + candidatesByCost[c].totalCost + " energy.");
					}
					totalVolume += transferAmount;
					totalCost += candidatesByCost[c].totalCost;
					break;
				} else {
					if (transferFlag == false) {
						console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoomName + ":" + candidatesByCost[c].volume + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
					} else if (transferFlag == true) {
						Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoomName + ":" + candidatesByCost[c].volume + ":" + transferResource + ":TerminalTransfer";
						//console.log(candidatesByCost[c].volume + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoomName + " for " + candidatesByCost[c].totalCost + " energy.");
					}
					totalVolume += candidatesByCost[c].volume;
					totalCost += candidatesByCost[c].totalCost;
					transferAmount -= candidatesByCost[c].volume;
				}
			}
		}

		if (transferFlag == "cost") {
			return totalCost;
		}
		return "OK";
	}
};

global.terminalTransferX = function (transferResource, transferAmount, sourceRoomName, targetRoomName, transferFlag) {
	// transfer resources to from source to target
	var roomCandidates = [];
	var sourceRoom = Game.rooms[sourceRoomName];

	if (arguments.length == 0) {
		return "terminalTransferX (transferResource, transferAmount, sourceRoomName, targetRoomName, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W18S49\", \"W16S47\", false)";
	}

	if (transferAmount < 100) {
		return "Minimal amount for terminal transfers are 100 units.";
	}

	if (sourceRoom.memory.terminalTransfer != undefined) {
		return "There is already an ongoing terminal transfer in room " + sourceRoomName + ".";
	}

	var totalCost = 0;
	if (sourceRoom.storage == undefined || sourceRoom.terminal == undefined || (sourceRoom.storage.store[transferResource] + sourceRoom.terminal.store[transferResource]) < transferAmount) {
		return "Error scheduling terminal transfer job.";
	} else {
		if (transferFlag == false) {
			console.log("Terminal Transfer Preview for room " + sourceRoom.name + " // " + targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + Game.market.calcTransactionCost(transferAmount, sourceRoomName, targetRoomName));
		} else if (transferFlag == true) {
			sourceRoom.memory.terminalTransfer = targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer";
			//console.log(transferAmount + " " + transferResource + " scheduled from room " + sourceRoomName + " to room " + targetRoomName + " for " + Game.market.calcTransactionCost(transferAmount, sourceRoomName, targetRoomName) + " energy.");
		} else {
			return "Transfer Flag missing.";
		}

		if (transferFlag == "cost") {
			return totalCost;
		}
		return "OK";
	}
};

global.listStorages = function (displayResource) {
	/* var table = AsciiTable.factory({
		title: 'listStorages()',
		heading: ['id', 'name'],
		rows: [
			[1, 'Bob'],
			[2, 'Steve']
		]
	}) */
	var tableObject = {}
	tableObject.title = 'listStorages()'
	var tableRooms = []
	tableRooms.push("Rooms")

	var resourceTable = [];
	var total = [];

	//Prepare header row
	for (var r in myRooms) {
		if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
			tableRooms.push(Game.rooms[r].name)
			for (var res in myRooms[r].storage.store) {
				if (resourceTable.indexOf(res) == -1) {
					resourceTable.push(res);
				}
			}
		}
	}
	tableObject.heading = tableRooms;
	tableObject.rows = []
	var tableResources = []

	resourceTable = _.sortBy(resourceTable, function (res) {
		return res.length;
	});
	for (res in resourceTable) {
		if (arguments.length == 0 || displayResource == resourceTable[res]) {
			let c = -1;
			tableResources.push(resourceTable[res])

			for (var r in myRooms) {
				if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
					c++;
					var amount;
					var code;
					if (Game.rooms[r].storage.store[resourceTable[res]] == undefined) {
						amount = 0;
					} else {
						amount = Game.rooms[r].storage.store[resourceTable[res]];
					}
					if (amount < Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage) {
						code = "!"
					} else if (amount > Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage) {
						code = "$"
					} else {
						code = ""
					}
					tableResources.push(prettyInt(amount) + " " + code)

					if (total[c] == undefined) {
						total[c] = amount;
					} else {
						total[c] += amount;
					}
				}
			}
			tableObject.rows.push(tableResources);
			tableResources = []
		}
	}

	var tableTotal = []
	tableTotal.push("Total")
	for (let c in total) {
		tableTotal.push(prettyInt(total[c]))
	}

	tableObject.rows.push(tableTotal)
	var table = AsciiTable.factory(tableObject)

	return table.toString()
};

global.prettyInt = function (int) {
	var string = int.toString();
	var numbers = string.length;
	var rest = numbers % 3;
	var returnString = "";
	if (rest > 0) {
		returnString = string.substr(0, rest);
		if (numbers > 3) {
			returnString += "'";
		}
	}
	numbers -= rest;

	while (numbers > 0) {
		returnString += string.substr(rest, 3);
		if (numbers > 3) {
			returnString += "'";
		}
		rest += 3;
		numbers -= 3;
	}
	return returnString;
};

global.listLimits = function (limitType, displayResource) {
	if (arguments.length == 0) {
		return "listLimits (limitTyoe, [displayResource]) - Known limit types: \"market\", \"storage\", \"production\", \"terminal\"";
	}
	var returnstring = "<table><tr><th>Resource  </th>";
	var resourceTable = [];
	if (limitType == "market") {
		limitType = "minMarket"
	} else if (limitType == "production") {
		limitType = "minProduction"
	} else if (limitType == "terminal") {
		limitType = "minTerminal"
	} else if (limitType == "storage") {
		limitType = "maxStorage"
	} else {
		return "Invalid limit type."
	}

	//Prepare header row
	for (var r in myRooms) {
		if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
			returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
			for (var res in myRooms[r].memory.resourceLimits) {
				if (resourceTable.indexOf(res) == -1) {
					resourceTable.push(res);
				}
			}
		}
	}
	returnstring = returnstring.concat("</tr>");
	resourceTable = _.sortBy(resourceTable, function (res) {
		return res.length;
	});
	for (res in resourceTable) {
		if (arguments.length == 1 || displayResource == resourceTable[res]) {
			var tempstring = "<tr><td>" + resourceTable[res] + "  </td>";
			var tempsum = 0;
			for (var r in myRooms) {
				if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
					tempstring = tempstring.concat("<td>" + prettyInt(Game.rooms[r].memory.resourceLimits[resourceTable[res]][limitType]) + "  </td>");
					tempsum += Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage;
				}
			}
			if (tempsum > 0) {
				returnstring = returnstring.concat(tempstring + "</tr>");
			}
		}
	}
	returnstring = returnstring.concat("</table>");
	return returnstring;
};

global.setLimit = function (roomName, type, resource, limit) {
	if (arguments.length == 0) {
		return "setLimit (roomName, limitType, resource, limit) - Known limit types: \"market\", \"storage\", \"production\", \"terminal\"";
	}
	var roomNames = [];
	var resources = [];

	if (roomName == "*") {
		for (var t in myRooms) {
			roomNames.push(myRooms[t].name);
		}
	} else {
		roomNames.push(roomName);
	}

	if (resource == "*") {
		for (var t in RESOURCES_ALL) {
			resources.push(RESOURCES_ALL[t]);
		}
	} else {
		resources.push(resource);
	}

	for (var i in roomNames) {
		for (let m in resources) {
			switch (type) {
				case "market":
					Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minMarket = limit;
					break;
				case "terminal":
					Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minTerminal = limit;
					break;
				case "storage":
					Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].maxStorage = limit;
					break;
				case "production":
					Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minProduction = limit;
					break;
				case "*":
					Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minMarket = limit;
					Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minTerminal = limit;
					Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].maxStorage = limit;
					Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minProduction = limit;
					break;
				default:
					return "Unknown type";
			}
			console.log("Room " + Game.rooms[roomNames[i]].name + " has set the " + type + " limit for " + resources[m] + " to " + limit + ".");
		}
	}
	return "OK";
};

global.checkTerminalLimits = function (room, resource) {
	// Check if terminal has exactly what it needs. If everything is as it should be true is returned.
	// If material is missing or too much is in terminal, an array will be returned with the following format:
	// delta.type = Type of resource / delta.amount = volume (positive number means surplus material)

	//Check terminal limits
	var uplift = 0;
	var delta = {};
	delta["type"] = resource;
	if (room.memory.resourceLimits == undefined || room.terminal == undefined || room.storage == undefined) {
		delta["amount"] = 0;
		return delta;
	}

	var roomLimits = room.memory.resourceLimits;
	if (roomLimits[resource] != undefined && room.terminal.store[resource] != undefined) {
		delta.amount = room.terminal.store[resource] - roomLimits[resource].minTerminal;
	} else if (room.terminal.store[resource] == undefined) {
		delta.amount = roomLimits[resource].minTerminal;
	} else {
		delta.amount = 0
	}

	//console.log(JSON.stringify(roomLimits)+" "+delta.amount)

	//Check market selling orders to add minerals to terminal
	if (Object.keys(Game.market.orders).length > 0) {
		//Look through orders to determine whether additional material is needed in terminal

		var relevantOrders = _.filter(Game.market.orders, function (order) {
			if (order.resourceType == resource && order.roomName == room.name && order.type == ORDER_SELL) {
				return true
			} else {
				return false
			}
		});

		if (relevantOrders.length > 0) {
			for (let o in relevantOrders) {
				if (relevantOrders[o].remainingAmount > TERMINALMARKETSTORE) {
					uplift += TERMINALMARKETSTORE;
				} else {
					uplift += relevantOrders[o].remainingAmount;
				}
			}
			delta.amount -= uplift;
		}
	}

	//Check single buying orders to add energy to terminal
	if (Memory.buyOrder != undefined && Memory.buyRoom == room.name && resource == RESOURCE_ENERGY) {
		let info = Memory.buyOrder.split(":");
		let order = Game.market.getOrderById(info[1]);
		if (order != null) {
			if (info[0] > 5000) {
				info[0] = 5000;
			}
			if (info[0] > order.amount) {
				info[0] = order.amount;
			}
			let plusEnergy = Game.market.calcTransactionCost(info[0], Memory.buyRoom, order.roomName);
			delta.amount -= plusEnergy;
		}
	}

	return delta;
};

global.checkStorageLimits = function (room, resource) {
	// Check if storage has exactly what it needs. Return delta to maxStorage
	// If everything is as it should be 0 is returned.
	// If material is missing a negative amount will be returned
	// If there is surplus a positive amount will be returned
	var terminalDelta = 0;
	if (room.storage == undefined) {
		return 0;
	}
	terminalDelta = checkTerminalLimits(room, resource);
	if (room.storage.store[resource] != undefined) {
		return (terminalDelta.amount + room.storage.store[resource] - room.memory.resourceLimits[resource].maxStorage)
	} else {
		return (terminalDelta.amount - room.memory.resourceLimits[resource].maxStorage);
	}
};