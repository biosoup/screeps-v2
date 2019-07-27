StructureTower.prototype.defend = function (hostiles) {
	//check for invaders
	var invaders = _.filter(hostiles, (h) => h.owner == "Invader")

	var lowHealthTarget = _.min(hostiles, "hits")
	var distancetoTarget = this.pos.getRangeTo(lowHealthTarget)

	if (!_.isEmpty(invaders)) {
		if (invaders.length > 0) {
			var target = this.pos.findClosestByRange(invaders)
			this.attack(target);
			return
		}
	}

	//get needed distance for siege defence
	var effectiveRange = this.getDistanceForTower()
	// tower attack
	if (distancetoTarget >= effectiveRange && lowHealthTarget.hits < lowHealthTarget.hitsMax) {
		this.attack(lowHealthTarget);
	} else if (distancetoTarget < effectiveRange) {
		this.attack(lowHealthTarget);
	} else {
		this.healCreeps()
	}

};

StructureTower.prototype.healCreeps = function () {
	var injuredCreep = this.room.find(FIND_CREEPS, {
		filter: f => f.hits < f.hitsMax
	})
	if (!_.isEmpty(injuredCreep)) {
		var closestInjured = this.pos.findClosestByRange(injuredCreep)
		this.heal(closestInjured);
		return true;
	} else {
		return false;
	}
};

StructureTower.prototype.getDistanceForTower = function () {
	//find the most distant wall/rampart + 1
	var structures = this.room.find(FIND_STRUCTURES, {
		filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART
	})
	if (!_.isEmpty(structures)) {
		var maxDistance = 0
		for (var s in structures) {
			var distance = this.pos.getRangeTo(structures[s])
			if (distance > maxDistance) {
				maxDistance = distance;
			}
		}
		//var maxDistance = _.max(structures, this.pos.getRangeTo)
		return maxDistance + 1
	} else {
		//no walls
		return 20
	}
}

StructureTower.prototype.repairStructures = function () {
	var target = {};

	//priority repair
	if (this.energy > 200) {
		//Find the closest damaged Structure
		var target = this.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) =>
				s.hits < 500 &&
				s.structureType != STRUCTURE_CONTROLLER
		});
		if (!_.isEmpty(target)) {
			this.repair(target);
		}
	}

	//we have enough energy in the tower, keep the rest as reserver for invaders
	if (this.energy > 700) {
		//Find the closest damaged Structure
		var targets = this.room.find(FIND_STRUCTURES, {
			filter: (s) =>
				((s.hits / s.hitsMax) < 1) &&
				s.structureType != STRUCTURE_CONTROLLER &&
				s.structureType != STRUCTURE_EXTENSION &&
				s.structureType != STRUCTURE_TOWER &&
				s.structureType != STRUCTURE_WALL &&
				s.structureType != STRUCTURE_RAMPART &&
				s.structureType != STRUCTURE_EXTRACTOR &&
				s.structureType != STRUCTURE_SPAWN &&
				s.structureType != STRUCTURE_CONTAINER
		});

		if (targets.length > 0) {
			target = _.first(_.sortByOrder(targets, ["hits"], ["asc"]));
		}

		//new code
		//target = _.min(targets, "hits")

		if (target) {
			var result = this.repair(target);
			//console.log(target + " " + target.hits + " " + this.room.name + " " + result)
		}
	}
};