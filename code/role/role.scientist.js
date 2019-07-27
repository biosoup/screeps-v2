var Tasks = require("../tools/creep-tasks");

module.exports = {
	newTask: function (creep) {
		if (creep.ticksToLive < 50 && _.sum(creep.carry) == 0) {
			creep.say("dying", true)
			creep.suicide()
		} else {
			if (creep.room.memory.labOrder != undefined && creep.room.memory.innerLabs != undefined) {
				// Ongoing labOrder with defined innerLabs
				var labOrder = creep.room.memory.labOrder.split(":");
				var amount = labOrder[0];
				var innerLabs = creep.room.memory.innerLabs;
				var status = labOrder[3];
				if (innerLabs.length != 2) {
					return "Not enough inner labs found!";
				}
				creep.say(status, true)
				switch (status) {
					case "prepare":
						var labs = [];
						var labsReady = 0;
						labs.push(Game.getObjectById(innerLabs[0].labID));
						labs.push(Game.getObjectById(innerLabs[1].labID));
						for (var lb in labs) {
							//Checking inner labs
							var currentInnerLab = labs[lb];
							if (!_.isEmpty(innerLabs[lb].resource) && !_.isEmpty(currentInnerLab)) {
								if (currentInnerLab.mineralType != innerLabs[lb].resource || (currentInnerLab.mineralType == innerLabs[lb].resource && (currentInnerLab.mineralAmount < currentInnerLab.mineralCapacity && currentInnerLab.mineralAmount < amount))) {
									//Lab has to be prepared
									if (currentInnerLab.mineralType == undefined || currentInnerLab.mineralType == innerLabs[lb].resource) {
										//Lab needs minerals
										if (creep.storeAllBut(innerLabs[lb].resource) == true) {
											creep.say("Lab needs minerals")
											if (_.sum(creep.carry) == 0) {
												//Get minerals from storage
												var creepPackage = amount - currentInnerLab.mineralAmount;
												if (creepPackage > creep.carryCapacity) {
													creepPackage = creep.carryCapacity;
												}
												if (creep.room.storage.store[innerLabs[lb].resource] < creepPackage) {
													//not enough resources in storage
													delete creep.room.memory.labOrder;
												} else {
													//console.log(creep.room.storage+" "+ innerLabs[lb].resource+" "+ creepPackage)
													creep.task = Tasks.withdraw(creep.room.storage, innerLabs[lb].resource, creepPackage)
												}
											} else {
												creep.task = Tasks.transfer(currentInnerLab, innerLabs[lb].resource)
											}
										}
									} else {
										//Lab has to be emptied -> get rid of stuff in creep
										if (creep.storeAllBut() == true) {
											//Get minerals from storage
											creep.task = Tasks.withdraw(currentInnerLab, currentInnerLab.mineralType)
										}
									}
									break;
								}
								if (currentInnerLab.mineralType == innerLabs[lb].resource && (currentInnerLab.mineralAmount == currentInnerLab.mineralCapacity || currentInnerLab.mineralAmount >= amount)) {
									labsReady++;
								}
							}
						}
						if (labsReady == 2) {
							creep.say("Waiting", true)
							creep.memory.sleep = 5;
						}
						break;

					case "done":
						//Empty all labs to storage
						var emptylabs = 0;
						var lab;
						for (var c in creep.room.memory.roomArray.labs) {
							lab = Game.getObjectById(creep.room.memory.roomArray.labs[c]);
							if ((creep.room.memory.boostLabs == undefined || creep.room.memory.boostLabs.indexOf(lab.id) == -1) && lab.mineralAmount > 0 && lab.id != innerLabs[0].labID && lab.id != innerLabs[1].labID) {
								if (_.sum(creep.carry) < creep.carryCapacity) {
									creep.task = Tasks.withdraw(lab, lab.mineralType)
								} else {
									creep.storeAllBut();
								}
							} else if ((creep.room.memory.boostLabs == undefined || creep.room.memory.boostLabs.indexOf(lab.id) == -1) && lab.energy > 0) {
								if (_.sum(creep.carry) < creep.carryCapacity) {
									creep.task = Tasks.withdraw(lab, RESOURCE_ENERGY)
								} else {
									creep.storeAllBut();
								}
							} else {
								emptylabs++;
							}
						}
						if (emptylabs == creep.room.memory.roomArray.labs.length && lab != undefined) {
							if (amount <= lab.mineralCapacity) {
								if (creep.storeAllBut() == true) {
									delete creep.room.memory.labOrder;
								}
							} else {
								// Restart process to do more of the same
								amount -= lab.mineralCapacity;
								labOrder[0] = amount;
								labOrder[3] = "prepare";
								creep.room.memory.labOrder = labOrder.join(":");
							}
						}
						break;
					case "running":
					default:
						let mineralsContainers = creep.room.find(FIND_STRUCTURES, {
							filter: (s) => s.structureType == STRUCTURE_CONTAINER && (_.sum(s.store) > s.store[RESOURCE_ENERGY] || (_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY == 0]))
						});
						if (mineralsContainers.length == 0) {
							delete creep.memory.targetBuffer;
							delete creep.memory.resourceBuffer;
							//creep.roleEnergyTransporter()
						} else {
							//get minerals from container
							if (creep.memory.tidyFull == undefined && _.sum(creep.carry) < creep.carryCapacity) {
								//creep not full
								for (let e in mineralsContainers[0].store) {
									if (e != "energy" && creep.withdraw(mineralsContainers[0], e) == ERR_NOT_IN_RANGE) {
										creep.travelTo(mineralsContainers[0]);
									}
								}
							} else {
								//creep full
								creep.memory.tidyFull = true;
								creep.storeAllBut();
								if (_.sum(creep.carry) == 0) {
									delete creep.memory.tidyFull;
								}
							}
						}
						break;
				}
			} else {
				//Empty all labs to storage
				var emptylabs = 0;
				var lab;
				for (var c in creep.room.memory.roomArray.labs) {
					lab = Game.getObjectById(creep.room.memory.roomArray.labs[c]);
					if (lab.mineralAmount > 0) {
						if (creep.storeAllBut() == true) {
							creep.task = Tasks.withdraw(lab, lab.mineralType)
						}
					} else {
						emptylabs++;
					}
				}
				if (emptylabs == creep.room.memory.roomArray.labs.length) {
					delete creep.memory.targetBuffer;
					delete creep.memory.resourceBuffer;
					creep.say("nothing to do", true)
				}
			}
		}
	}
};