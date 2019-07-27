/* eslint-disable no-undef */
DELAYFLOWROOMCHECK = 313;
DELAYMARKETAUTOSELL = 7;
DELAYMARKETBUY = 3;
DELAYFLAGCOLORS = 31;
DELAYRESOURCEBALANCING = 9;
DELAYROOMSCANNING = 23;
DELAYFLAGFINDING = 20;
DELAYRESOURCEFINDING = 3;
DELAYPANICFLAG = 5;
DELAYSPAWNING = 13;
DELAYLINK = 2;
DELAYPRODUCTION = 7;
DELAYLAB = 10;
DELAYRCL8INSTALLATION = 100;
DELAYDROPPEDENERGY = 3;
RESOURCE_SPACE = "space";
TERMINAL_PACKETSIZE = 5000; //Size of packets in resource balancing system
AUTOSELL_PACKETSIZE = 5000;
BUY_PACKETSIZE = 5000;
TERMINALMARKETSTORE = 50000;
RBS_PACKETSIZE = 5000;
CPU_THRESHOLD = 500;
WALLMAX = 10000000;
MINSURPLUSENERGY = 50000; //multiplied by RCL to get storage energy stresholds
LOG_TERMINAL = true;
LOG_MARKET = true;
LOG_SPAWN = false;
LOG_EXPIRE = true;
LOG_PANICFLAG = true;
LOG_INFO = true;
ROOMARRAY_REFRESH = false;

playerUsername = "biosoup";
roomSign = "Not fully automated, yet!"
allies = [];
myRooms = {};

/**
 * Emoji constants! (Because github integration mangles them in a non-nice way)
 */

EM_ZZZ = "\ud83d\udca4"; // "💤"
EM_COOKIE = "\ud83c\udf6a"; // "🍪"
EM_TEA = "\ud83c\udf75"; // "🍵"
EM_COFFEE = "\u2615"; // "☕"
EM_LIGHTNING = "\u26a1"; // "⚡"
EM_BUILD = "\u2692"; // "⚒"
EM_HAMMER = "\ud83d\udd28"; // "🔨"
EM_BOMB = "\ud83d\udca3"; // "💣"
EM_PACKAGE = "\ud83d\udce6"; // "📦"
EM_TRUCK = "\ud83d\ude9a"; // "🚚"
EM_EXCLAMATION = "\u2757"; // "❗"
EM_PIN = "\ud83d\udccd"; // "📍"
EM_WRENCH = "\ud83d\udd27"; // "🔧"
EM_FLEX = "\ud83d\udcaa"; // "💪"
EM_FLAG = "\ud83d\udea9"; // "🚩"
EM_KILL = "\u2620\ufe0f"; // "☠️"
EM_SWORDS = "\u2694"; // "⚔"
EM_ARROW = "\u2650"; // "♐"
EM_SYRINGE = "\ud83d\udc89"; // "💉"
EM_SWIMMING = "\ud83c\udfca"; // "🏊"
EM_SINGING = "\u266b\u266a\u266b"; // "♫♪♫"

mineralDescriptions = {};
mineralDescriptions.H = {
	tier: 0,
	component1: false,
	component2: false
};
mineralDescriptions.O = {
	tier: 0,
	component1: false,
	component2: false
};
mineralDescriptions.U = {
	tier: 0,
	component1: false,
	component2: false
};
mineralDescriptions.K = {
	tier: 0,
	component1: false,
	component2: false
};
mineralDescriptions.L = {
	tier: 0,
	component1: false,
	component2: false
};
mineralDescriptions.Z = {
	tier: 0,
	component1: false,
	component2: false
};
mineralDescriptions.G = {
	tier: 2,
	component1: "ZK",
	component2: "UL"
};
mineralDescriptions.X = {
	tier: 0,
	component1: false,
	component2: false
};
mineralDescriptions.OH = {
	tier: 1,
	component1: "O",
	component2: "H"
};
mineralDescriptions.UH = {
	tier: 1,
	component1: "U",
	component2: "H",
	bodyPart: ATTACK
};
mineralDescriptions.UO = {
	tier: 1,
	component1: "U",
	component2: "O",
	bodyPart: WORK
};
mineralDescriptions.UL = {
	tier: 1,
	component1: "U",
	component2: "L"
};
mineralDescriptions.KH = {
	tier: 1,
	component1: "K",
	component2: "H",
	bodyPart: CARRY
};
mineralDescriptions.KO = {
	tier: 1,
	component1: "K",
	component2: "O",
	bodyPart: RANGED_ATTACK
};
mineralDescriptions.LH = {
	tier: 1,
	component1: "L",
	component2: "H",
	bodyPart: WORK
};
mineralDescriptions.LO = {
	tier: 1,
	component1: "L",
	component2: "O",
	bodyPart: HEAL
};
mineralDescriptions.ZH = {
	tier: 1,
	component1: "Z",
	component2: "H",
	bodyPart: WORK
};
mineralDescriptions.ZO = {
	tier: 1,
	component1: "Z",
	component2: "O",
	bodyPart: MOVE
};
mineralDescriptions.ZK = {
	tier: 1,
	component1: "Z",
	component2: "K"
};
mineralDescriptions.GH = {
	tier: 1,
	component1: "G",
	component2: "H",
	bodyPart: WORK
};
mineralDescriptions.GO = {
	tier: 1,
	component1: "G",
	component2: "O",
	bodyPart: TOUGH
};
mineralDescriptions.UH2O = {
	tier: 2,
	component1: "UH",
	component2: "OH",
	bodyPart: ATTACK
};
mineralDescriptions.UHO2 = {
	tier: 2,
	component1: "UO",
	component2: "OH",
	bodyPart: WORK
};
mineralDescriptions.KH2O = {
	tier: 2,
	component1: "KH",
	component2: "OH",
	bodyPart: CARRY
};
mineralDescriptions.KHO2 = {
	tier: 2,
	component1: "KO",
	component2: "OH",
	bodyPart: RANGED_ATTACK
};
mineralDescriptions.LH2O = {
	tier: 2,
	component1: "LH",
	component2: "OH",
	bodyPart: WORK
};
mineralDescriptions.LHO2 = {
	tier: 2,
	component1: "LO",
	component2: "OH",
	bodyPart: HEAL
};
mineralDescriptions.ZH2O = {
	tier: 2,
	component1: "ZH",
	component2: "OH",
	bodyPart: WORK
};
mineralDescriptions.ZHO2 = {
	tier: 2,
	component1: "ZO",
	component2: "OH",
	bodyPart: MOVE
};
mineralDescriptions.GH2O = {
	tier: 2,
	component1: "GH",
	component2: "OH",
	bodyPart: WORK
};
mineralDescriptions.GHO2 = {
	tier: 2,
	component1: "GO",
	component2: "OH",
	bodyPart: TOUGH
};
mineralDescriptions.XUH2O = {
	tier: 3,
	component1: "X",
	component2: "UH2O",
	bodyPart: ATTACK
};
mineralDescriptions.XUHO2 = {
	tier: 3,
	component1: "X",
	component2: "UHO2",
	bodyPart: WORK
};
mineralDescriptions.XKH2O = {
	tier: 3,
	component1: "X",
	component2: "KH2O",
	bodyPart: CARRY
};
mineralDescriptions.XKHO2 = {
	tier: 3,
	component1: "X",
	component2: "KHO2",
	bodyPart: RANGED_ATTACK
};
mineralDescriptions.XLH2O = {
	tier: 3,
	component1: "X",
	component2: "LH2O",
	bodyPart: WORK
};
mineralDescriptions.XLHO2 = {
	tier: 3,
	component1: "X",
	component2: "LHO2",
	bodyPart: HEAL
};
mineralDescriptions.XZH2O = {
	tier: 3,
	component1: "X",
	component2: "ZH2O",
	bodyPart: WORK
};
mineralDescriptions.XZHO2 = {
	tier: 3,
	component1: "X",
	component2: "ZHO2",
	bodyPart: MOVE
};
mineralDescriptions.XGH2O = {
	tier: 3,
	component1: "X",
	component2: "GH2O",
	bodyPart: WORK
};
mineralDescriptions.XGHO2 = {
	tier: 3,
	component1: "X",
	component2: "GHO2",
	bodyPart: TOUGH
};


buildingPlans = {
	miniharvester: [{
			//Level 1 (max 300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		}
	],
	longDistanceBuilder: [{
			//Level 1 (max 300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 550,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 550,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1100,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1100,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1100,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1100,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1100,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		}
	],

	longDistanceHarvester: [{
			//Level 1 (max 300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 500,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 750,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1100,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1650,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 2050,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 2050,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 2050,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	harvester: [{
			//Level 1 (max 300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 400,
			body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 700,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1550,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1550,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1550,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1550,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	miner: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [MOVE, WORK, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 550,
			body: [MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 750,
			body: [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		}
	],

	upgrader: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [MOVE, WORK, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 500,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1300,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1750,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 2200,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 3900,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 2650,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	repairer: [{
			//Level 1 (max 300)
			minEnergy: 200,
			body: [MOVE, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 550,
			body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1150,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1550,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1900,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1900,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1900,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	builder: [{
			//Level 1 (max 300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 550,
			body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 650,
			body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		}
	],

	wallRepairer: [{
			//Level 1 (max 300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 550,
			body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1150,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1550,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1900,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1900,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1900,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	claimer: [{
			//Level 1 (max 300)
			minEnergy: 650,
			body: [CLAIM, MOVE]
		},
		{
			//Level 2 (max 550)
			minEnergy: 650,
			body: [CLAIM, MOVE]
		},
		{
			//Level 3 (max 800)
			minEnergy: 650,
			body: [CLAIM, MOVE]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1300,
			body: [CLAIM, CLAIM, MOVE, MOVE]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1300,
			body: [CLAIM, CLAIM, MOVE, MOVE]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1300,
			body: [CLAIM, CLAIM, MOVE, MOVE]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1300,
			body: [CLAIM, CLAIM, MOVE, MOVE]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1300,
			body: [CLAIM, CLAIM, MOVE, MOVE]
		}
	],

	bigClaimer: [{
			//Level 1 (max 300)
			minEnergy: 3250,
			body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 2 (max 550)
			minEnergy: 3250,
			body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 3 (max 800)
			minEnergy: 3250,
			body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 3250,
			body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 3250,
			body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 3250,
			body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 6500,
			body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 9750,
			body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		}
	],

	guard: [{
			//Level 1 (max 300)
			minEnergy: 260,
			body: [MOVE, MOVE, ATTACK, ATTACK]
		},
		{
			//Level 2 (max 550)
			minEnergy: 520,
			body: [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK]
		},
		{
			//Level 3 (max 800)
			minEnergy: 780,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1080,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1380,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1950,
			body: [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1950,
			body: [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1950,
			body: [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL]
		}
	],

	mineralHarvester: [{
			//Level 1 (max 300)
			minEnergy: 2000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 2000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 2000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 2000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 2000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 2000,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 3300,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 3300,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	runner: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 450,
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 750,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1200,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 2250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 2500,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 2500,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	scientist: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 450,
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	demolisher: [{
			//Level 1 (max 300)
			minEnergy: 250,
			body: [MOVE, MOVE, WORK, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 500,
			body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 650,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1150,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1400,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1850,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 2700,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 2700,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	longDistanceMiner: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [WORK, WORK, CARRY, MOVE]
		},
		{
			//Level 2 (max 550)
			minEnergy: 550,
			body: [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]
		},
		{
			//Level 3 (max 800)
			minEnergy: 700,
			body: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 850,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
		}
	],

	SKHarvester: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [WORK, WORK, CARRY, MOVE]
		},
		{
			//Level 2 (max 550)
			minEnergy: 550,
			body: [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]
		},
		{
			//Level 3 (max 800)
			minEnergy: 700,
			body: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1200,
			body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1550,
			body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1550,
			body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1550,
			body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1550,
			body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		}
	],

	longDistanceLorry: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 450,
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 750,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1200,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 2250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 2500,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 2500,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	transporter: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 500,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 600,
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 600,
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1800,
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 2100,
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 2550,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 2550,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	SKHauler: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [WORK, CARRY, CARRY, MOVE, MOVE]
		},
		{
			//Level 2 (max 550)
			minEnergy: 500,
			body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
		},
		{
			//Level 3 (max 800)
			minEnergy: 650,
			body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1100,
			body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 1750,
			body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 1750,
			body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1750,
			body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1750,
			body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
		}
	],

	attacker: [{
			//Level 1 (max 300)
			minEnergy: 260,
			body: [MOVE, MOVE, ATTACK, ATTACK]
		},
		{
			//Level 2 (max 550)
			minEnergy: 390,
			body: [MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK]
		},
		{
			//Level 3 (max 800)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1300,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
		},
		{
			//Level 5 (max 1750)
			minEnergy: 1350,
			body: [TOUGH, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 2270,
			body: [TOUGH, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 3040,
			body: [TOUGH, TOUGH, TOUGH, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE, ATTACK, MOVE, MOVE, MOVE]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 3040,
			body: [TOUGH, TOUGH, TOUGH, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE, ATTACK, MOVE, MOVE, MOVE]
		}
	],

	archer: [{
			//Level 1 (max 300)
			minEnergy: 260,
			body: [MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK]
		},
		{
			//Level 2 (max 550)
			minEnergy: 390,
			body: [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
		},
		{
			//Level 3 (max 800)
			minEnergy: 800,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1300,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
		},
		{
			//Level 5 (max 1750)
			minEnergy: 1350,
			body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 2270,
			body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 3040,
			body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 3040,
			body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
		}
	],

	healer: [{
			//Level 1 (max 300)
			minEnergy: 300,
			body: [MOVE, HEAL]
		},
		{
			//Level 2 (max 550)
			minEnergy: 300,
			body: [MOVE, HEAL]
		},
		{
			//Level 3 (max 800)
			minEnergy: 600,
			body: [MOVE, MOVE, HEAL, HEAL]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1300,
			body: [MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL]
		},
		{
			//Level 5 (max 1750)
			minEnergy: 1500,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL]
		},
		{
			//Level 6 (max 2100)
			minEnergy: 2270,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 5400,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 7500,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
		}
	],



	einarr: [{
			//Level 1 (max 300)
			minEnergy: 260,
			body: [MOVE, MOVE, ATTACK, ATTACK]
		},
		{
			//Level 2 (max 550)
			minEnergy: 490,
			body: [TOUGH, MOVE, MOVE, MOVE, ATTACK, HEAL]
		},
		{
			//Level 3 (max 800)
			minEnergy: 790,
			body: [TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, HEAL, HEAL]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1290,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL]
		},
		{
			//Level 5 (max 1750)
			minEnergy: 1480,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL]
		},
		{
			//Level 6 (max 2100)
			minEnergy: 1910,
			body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 5220,
			body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 5220,
			body: [TOUGH, HEAL, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, MOVE]
		}
	],
	herocreep: [{
			//Level 1 (max 300)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 2 (max 550)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 3 (max 800)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 5 (max 1750)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 6 (max 2100)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 1250,
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
		}
	],

	scout: [{
			//Level 1 (max 300)
			minEnergy: 60,
			body: [TOUGH, MOVE]
		},
		{
			//Level 2 (max 550)
			minEnergy: 60,
			body: [TOUGH, MOVE]
		},
		{
			//Level 3 (max 800)
			minEnergy: 60,
			body: [TOUGH, MOVE]
		},
		{
			//Level 4 (max 1300)
			minEnergy: 160,
			body: [TOUGH, MOVE, MOVE, CARRY]
		},
		{
			//Level 5 (max 1800)
			minEnergy: 160,
			body: [TOUGH, MOVE, MOVE, CARRY]
		},
		{
			//Level 6 (max 2300)
			minEnergy: 160,
			body: [TOUGH, MOVE, MOVE, CARRY]
		},
		{
			//Level 7 (max 5600)
			minEnergy: 160,
			body: [TOUGH, MOVE, MOVE, CARRY]
		},
		{
			//Level 8 (max 12900)
			minEnergy: 160,
			body: [TOUGH, MOVE, MOVE, CARRY]
		}
	]
};