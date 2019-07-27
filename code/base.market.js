/* 

TODO: Move to correct places in other files
- leave only market stuff

*/

module.exports = {
	resourceLimits: function (r) {
		//Set default resource limits:
		if (Game.rooms[r].memory.resourceLimits == undefined && Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername) {
			var roomLimits = {};
			var limit;
			for (var res in RESOURCES_ALL) {
				roomLimits[RESOURCES_ALL[res]] = {};
				if (Game.rooms[r].memory.roomArray != undefined && Game.rooms[r].memory.roomArray.minerals != undefined && Game.getObjectById(Game.rooms[r].memory.roomArray.minerals[0]).mineralType == RESOURCES_ALL[res]) {
					//Room mineral
					limit = {
						minTerminal: 20000,
						maxStorage: 30000,
						minMarket: 50000,
						minProduction: 900000
					};
				} else if (RESOURCES_ALL[res] == RESOURCE_ENERGY) {
					//Energy
					limit = {
						minTerminal: 50000,
						maxStorage: 500000,
						minMarket: 900000,
						minProduction: 1000000
					};
				} else if (RESOURCES_ALL[res] == RESOURCE_GHODIUM) {
					//G
					limit = {
						minTerminal: 5000,
						maxStorage: 20000,
						minMarket: 900000,
						minProduction: 5000
					};
				} else {
					// Rest
					limit = {
						minTerminal: 500,
						maxStorage: 20000,
						minMarket: 900000,
						minProduction: 1000
					};
				}
				roomLimits[RESOURCES_ALL[res]] = limit;
			}
			Game.rooms[r].memory.resourceLimits = roomLimits;
		}
	},

	marketCode: function () {
		// Single Market Buy Orders
		if (Game.time % DELAYMARKETBUY == 0 && Game.cpu.bucket > CPU_THRESHOLD && Memory.buyOrder != undefined) {
			let info = Memory.buyOrder.split(":"); //Format: [AMOUNT]:[ORDERID]
			var left = info[0];
			var order = Game.market.getOrderById(info[1]);
			if (order != null) {
				if (left > BUY_PACKETSIZE) {
					left = BUY_PACKETSIZE;
				}
				if (left > order.amount) {
					left = order.amount;
				}

				var bestRoom;
				if (Memory.buyRoom != undefined) {
					bestRoom = Game.rooms[Memory.buyRoom];
				} else {
					var bestCost = 999999;
					for (var r in myRooms) {
						var cost = Game.market.calcTransactionCost(left, order.roomName, myRooms[r].name);
						if (myRooms[r].terminal != undefined && myRooms[r].terminal.cooldown == 0 && myRooms[r].terminal.owner.username == playerUsername) {
							if (bestCost > cost) {
								bestRoom = myRooms[r];
								bestCost = cost;
							}
						}
					}
					if (bestRoom == undefined || bestRoom.name == undefined) {
						console.log("No best room with enough energy found!");
					} else {
						Memory.buyRoom = bestRoom.name;
					}
				}
				if (!_.isEmpty(bestRoom)) {
					if (!_.isEmpty(bestRoom.name) && bestRoom.terminal.cooldown == 0) {
						var returnCode = Game.market.deal(order.id, left, bestRoom.name);
						if (returnCode == OK) {
							info[0] -= left;
							if (LOG_MARKET == true) {
								console.log("<font color=#fe2ec8 type='highlight'>" + left + " " + order.resourceType + " bought in room " + bestRoom.name + " for " + (left * order.price) + " credits.</font>");
								delete Memory.buyRoom;
							}
							if (info[0] > 0) {
								Memory.buyOrder = info.join(":");
							} else {
								delete Memory.buyOrder;
								delete Memory.buyRoom;
								console.log("<font color=#fe2ec8 type='highlight'>Buy order accomplished.</font>");
							}
						}
					} else {
						console.log("No room with enough energy found!");
					}
				}
			} else {
				delete Memory.buyOrder;
				delete Memory.buyRoom;
				if (LOG_MARKET == true) {
					console.log("<font color=#fe2ec8 type='highlight'>Buy order cancelled since it disappeared from market.</font>");
				}
			}
		}
		// Market Auto Selling Code
		if (Game.time % DELAYMARKETAUTOSELL == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
			//Remove expired market orders
			let expiredOrders = _.filter(Game.market.orders, {
				remainingAmount: 0
			});
			if (expiredOrders.length > 0) {
				for (let o in expiredOrders) {
					Game.market.cancelOrder(expiredOrders[o].id);
				}
			}

			//Look for surplus materials
			var surplusMinerals;

			for (var r in myRooms) {
				if (Game.rooms[r] != undefined && Game.rooms[r].terminal != undefined && Game.rooms[r].terminal.cooldown == 0 && Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[RESOURCE_ENERGY] > 100000 && Game.rooms[r].name != Memory.buyRoom && Game.rooms[r].memory.terminalTransfer == undefined) {
					for (var resource in Game.rooms[r].memory.resourceLimits) {
						if (Game.rooms[r].memory.resourceLimits[resource] != undefined && Game.rooms[r].storage.store[resource] > (Game.rooms[r].memory.resourceLimits[resource].minMarket)) {
							if (Game.rooms[r].storage.store[resource] > Game.rooms[r].memory.resourceLimits[resource].minMarket + 100) {
								surplusMinerals = Game.rooms[r].storage.store[resource] - Game.rooms[r].memory.resourceLimits[resource].minMarket;
								if (surplusMinerals >= AUTOSELL_PACKETSIZE) {
									surplusMinerals = AUTOSELL_PACKETSIZE;
									var orders = [];
									orders = Game.market.getAllOrders({
										type: ORDER_BUY,
										resourceType: resource
									});
									orders = _.sortBy(orders, "price");
									for (var o = 0; o < orders.length; o++) {
										//if (orders[o].price > 0.01) {
										var orderResource = orders[o].resourceType;
										var orderRoomName = orders[o].roomName;
										var orderAmount;
										if (surplusMinerals > orders[o].amount) {
											orderAmount = orders[o].amount;
										} else {
											orderAmount = surplusMinerals;
										}
										var orderCosts = global.terminalTransfer(orderResource, orderAmount, orderRoomName, "cost");
										if (orderAmount >= 500 && orderCosts <= Game.rooms[r].storage.store[RESOURCE_ENERGY] - 10000) {
											Game.rooms[r].memory.terminalTransfer = orders[o].id + ":" + orderAmount + ":" + orderResource + ":MarketOrder";
										}
										/* } else {
											console.log("too cheap deal: "+orders[o].resourceType+" "+orders[o].roomName)
										} */
									}
								}
							}
						}
					}
				}
			}
		}
	},

	resourceBalance: function () {
		if (Game.time % DELAYRESOURCEBALANCING == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
			// Inter-room resource balancing
			if (!_.isEmpty(myRooms)) {
				for (let r in myRooms) {
					if (Game.rooms[r].terminal != undefined && Game.rooms[r].terminal.cooldown == 0 && Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername &&
						Game.rooms[r].storage.store[RESOURCE_ENERGY] > 5000 && Game.rooms[r].memory.terminalTransfer == undefined) {
						var combinedResources = [];
						if (_.sum(Game.rooms[r].terminal.store) < Game.rooms[r].terminal.storeCapacity * 0.75) {
							for (let e in Game.rooms[r].storage.store) {
								if (combinedResources.indexOf(e) == -1) {
									combinedResources.push(e);
								}
							}
						}
						for (let e in Game.rooms[r].terminal.store) {
							if (combinedResources.indexOf(e) == -1) {
								combinedResources.push(e);
							}
						}
						var checkedResources = [];
						if (_.sum(Game.rooms[r].terminal.store) < Game.rooms[r].terminal.storeCapacity * 0.75) {
							combinedResources = _.sortBy(combinedResources, function (res) {
								return checkTerminalLimits(Game.rooms[r], res);
							});
							combinedResources = combinedResources.reverse();
						} else {
							combinedResources = _.sortBy(combinedResources, function (res) {
								return checkStorageLimits(Game.rooms[r], res);
							});
							combinedResources = combinedResources.reverse();
						}

						for (let n in combinedResources) {
							//Iterate through resources in terminal and/or storage
							if (checkedResources.indexOf(combinedResources[n]) == -1) {
								var storageDelta = checkStorageLimits(Game.rooms[r], combinedResources[n]);
								var packetSize = RBS_PACKETSIZE;
								if (combinedResources[n] == RESOURCE_ENERGY) {
									packetSize = RBS_PACKETSIZE * 2;
								}

								if (Game.rooms[r].memory.terminalTransfer == undefined && (_.sum(Game.rooms[r].terminal.store) >= Game.rooms[r].terminal.storeCapacity * 0.70 ||
										(storageDelta >= (Game.rooms[r].memory.resourceLimits[combinedResources[n]].maxStorage * 0.1) && packetSize <= Game.rooms[r].storage.store[combinedResources[n]] && storageDelta <= Game.rooms[r].storage.store[combinedResources[n]]))) {
									// Resource can be shared with other rooms if their maxStorage is not reached yet
									checkedResources.push(n);
									let recipientRooms = [];
									let fullRooms = [];
									for (var ru in myRooms) {
										if (Game.rooms[ru].name != Game.rooms[r].name && Game.rooms[ru].storage != undefined && Game.rooms[ru].terminal != undefined && Game.rooms[ru].storage.owner.username == playerUsername) {
											if (_.sum(Game.rooms[ru].terminal.store) < Game.rooms[ru].terminal.storeCapacity * 0.75 && checkStorageLimits(Game.rooms[ru], combinedResources[n]) < 0) {
												recipientRooms.push(Game.rooms[ru]);
											} else if (_.sum(Game.rooms[ru].terminal.store) < Game.rooms[ru].terminal.storeCapacity * 0.75) {
												fullRooms.push(Game.rooms[ru]);
											}
										}
									}
									recipientRooms = _.sortBy(recipientRooms, function (room) {
										return checkStorageLimits(room, combinedResources[n]);
									});
									fullRooms = _.sortBy(fullRooms, function (room) {
										return checkStorageLimits(room, combinedResources[n]);
									});

									if (recipientRooms.length > 0) {
										let recipientDelta = checkStorageLimits(recipientRooms[0], combinedResources[n]);
										if (recipientDelta < 0) {
											// Recipient room need the resource
											let transferAmount;
											if (storageDelta + recipientDelta >= 0) {
												transferAmount = Math.abs(recipientDelta);
											} else {
												transferAmount = storageDelta;
											}

											if (transferAmount < 100) {
												transferAmount = 100;
											}

											if (transferAmount > packetSize) {
												transferAmount = packetSize;
											}

											terminalTransferX(combinedResources[n], transferAmount, Game.rooms[r].name, recipientRooms[0].name, true);
											break;
										}
									} else if (fullRooms.length > 0) {
										// Room is over storage limit --> look for rooms with less of the resource
										for (let p in fullRooms) {
											if (fullRooms[p].storage != undefined && (fullRooms[p].storage.store[combinedResources[n]] == undefined || checkStorageLimits(Game.rooms[r], combinedResources[n]) > checkStorageLimits(fullRooms[p], combinedResources[n]) + packetSize)) {
												//room with less minerals found
												terminalTransferX(combinedResources[n], packetSize / 2, Game.rooms[r].name, fullRooms[p].name, true);
												break;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},

	terminalCode: function (r) {
		// Terminal code
		if (Game.cpu.bucket > CPU_THRESHOLD && Game.rooms[r].memory.terminalTransfer != undefined && Game.rooms[r].terminal != undefined && Game.rooms[r].terminal.owner.username == playerUsername) {
			var terminal = Game.rooms[r].terminal;
			if (terminal != undefined && terminal.cooldown == 0 && terminal.owner.username == playerUsername && Game.rooms[r].memory.terminalTransfer != undefined) {
				//Terminal exists
				var targetRoom;
				var amount;
				var resource;
				var comment;
				var energyCost;
				var info = Game.rooms[r].memory.terminalTransfer;
				info = info.split(":");
				targetRoom = info[0];
				amount = parseInt(info[1]);
				resource = info[2];
				comment = info[3];

				if (amount >= 100) {
					energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, targetRoom);
					Game.rooms[r].memory.terminalEnergyCost = energyCost;
					if (comment != "MarketOrder") {
						var energyTransferAmount = parseInt(energyCost) + parseInt(amount);
						var stdEnergyCost = Game.market.calcTransactionCost(TERMINAL_PACKETSIZE, terminal.room.name, targetRoom);
						if ((resource != RESOURCE_ENERGY && amount >= TERMINAL_PACKETSIZE && terminal.store[resource] >= TERMINAL_PACKETSIZE && (terminal.store[RESOURCE_ENERGY]) >= stdEnergyCost) ||
							(resource == RESOURCE_ENERGY && amount >= TERMINAL_PACKETSIZE && terminal.store[resource] >= TERMINAL_PACKETSIZE && (terminal.store[RESOURCE_ENERGY]) - TERMINAL_PACKETSIZE >= stdEnergyCost)) {
							if (terminal.send(resource, TERMINAL_PACKETSIZE, targetRoom, comment) == OK) {
								info[1] -= TERMINAL_PACKETSIZE;
								Game.rooms[r].memory.terminalTransfer = info.join(":");
								if (LOG_TERMINAL == true) {
									console.log("<font color=#009bff type='highlight'>" + Game.rooms[r].name + ": " + TERMINAL_PACKETSIZE + "/" + amount + " " + resource + " has been transferred to room " + targetRoom + " using " + stdEnergyCost + " energy: " + comment + "</font>");
								}
							} else {
								console.log("<font color=#ff0000 type='highlight'>Terminal transfer error (" + Game.rooms[r].name + "): " + terminal.send(resource, 500, targetRoom, comment) + "</font>");
							}
						} else if ((resource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] >= energyTransferAmount) ||
							(resource != RESOURCE_ENERGY && terminal.store[resource] >= amount && terminal.store[RESOURCE_ENERGY] >= energyCost)) {
							// Amount to be transferred reached and enough energy available -> GO!
							if (terminal.send(resource, amount, targetRoom, comment) == OK) {
								delete Game.rooms[r].memory.terminalTransfer;
								delete Game.rooms[r].memory.terminalEnergyCost;
								if (LOG_TERMINAL == true) {
									console.log("<font color=#009bff type='highlight'>" + amount + " " + resource + " has been transferred to room " + targetRoom + " from " + Game.rooms[r].name + " using " + energyCost + " energy: " + comment + "</font>");
								}
							} else {
								if (amount < 100) {
									delete Game.rooms[r].memory.terminalTransfer;
								} else {
									console.log("<font color=#ff0000 type='highlight'>Terminal transfer error (" + Game.rooms[r].name + "): " + terminal.send(resource, amount, targetRoom, comment) + "</font>");
								}
							}
						}
					} else {
						// Market Order
						var orderID = targetRoom;
						let order = Game.market.getOrderById(orderID);
						if (order != null) {
							if (amount > AUTOSELL_PACKETSIZE) {
								amount = AUTOSELL_PACKETSIZE;
							}
							energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, order.roomName);
							Game.rooms[r].memory.terminalEnergyCost = energyCost;
							if (Game.rooms[r].terminal.store[resource] >= amount) {
								if (resource == RESOURCE_ENERGY && Game.rooms[r].terminal.store[RESOURCE_ENERGY] >= amount + energyCost ||
									resource != RESOURCE_ENERGY && Game.rooms[r].terminal.store[RESOURCE_ENERGY] >= energyCost) {
									//Do the deal!
									if (parseInt(info[1]) <= AUTOSELL_PACKETSIZE && Game.market.deal(orderID, amount, Game.rooms[r].name) == OK) {
										if (LOG_MARKET == true) {
											console.log("<font color=#33ffff type='highlight'>" + Game.rooms[r].name + ": " + amount + " " + resource + " has been autosold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
										}
										delete Game.rooms[r].memory.terminalTransfer;
									} else if (Game.market.deal(orderID, amount, Game.rooms[r].name) == OK) {
										if (LOG_MARKET == true) {
											console.log("<font color=#33ffff type='highlight'>" + Game.rooms[r].name + ": " + amount + " " + resource + " has been sold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
										}
										info[1] -= amount;
										Game.rooms[r].memory.terminalTransfer = info.join(":");
									}
								}
							}
						} else {
							delete Game.rooms[r].memory.terminalTransfer;
						}
					}
				} else {
					delete Game.rooms[r].memory.terminalTransfer;
				}
			}
		}
	},
	productionCode: function (r) {
		// Production Code
		if (Game.cpu.bucket > CPU_THRESHOLD && Game.time % DELAYPRODUCTION == 0 && Game.rooms[r].memory.innerLabs != undefined && Game.rooms[r].memory.innerLabs[0] != "[LAB_ID]" && Game.rooms[r].memory.innerLabs[1] != "[LAB_ID]" &&
			Game.rooms[r].memory.labOrder == undefined && Game.rooms[r].memory.labTarget == undefined && !_.isEmpty(Game.rooms[r].storage)) {
			for (let res in RESOURCES_ALL) {
				if (!_.isEmpty(mineralDescriptions[RESOURCES_ALL[res]]) && !_.isEmpty(RESOURCES_ALL[res])) {
					if (RESOURCES_ALL[res] != RESOURCE_ENERGY && RESOURCES_ALL[res] != RESOURCE_POWER && mineralDescriptions[RESOURCES_ALL[res]].tier > 0) {
						var storageLevel;
						if (Game.rooms[r].storage.store[RESOURCES_ALL[res]] == undefined) {
							storageLevel = 0;
						} else {
							storageLevel = Game.rooms[r].storage.store[RESOURCES_ALL[res]];
						}
						//console.log((storageLevel) +" "+ Game.rooms[r].memory.resourceLimits[RESOURCES_ALL[res]].minProduction +" "+ JSON.stringify(Game.rooms[r].memory.resourceLimits[RESOURCES_ALL[res]]))

						if ((storageLevel) < Game.rooms[r].memory.resourceLimits[RESOURCES_ALL[res]].minProduction) {
							//Try to produce resource
							let resource = RESOURCES_ALL[res];

							let delta = Math.ceil((Game.rooms[r].memory.resourceLimits[resource].minProduction - storageLevel) / 10) * 10;

							if (delta >= Game.rooms[r].memory.resourceLimits[resource].minProduction * 0.2 || delta >= 3000) {
								let genuineDelta = delta;
								var productionTarget = whatIsLackingFor(Game.rooms[r], delta, resource);
								let minProductionPacketSize = 100;

								if (!_.isEmpty(Game.rooms[r].storage.store[mineralDescriptions[productionTarget]])) {
									while (mineralDescriptions[productionTarget.resource].tier > 0 && Game.rooms[r].memory.labTarget == undefined && Game.cpu.getUsed() < 250) {
										if (productionTarget.amount == 0) {
											productionTarget.amount = genuineDelta;
										}
										if (Game.rooms[r].storage.store[mineralDescriptions[productionTarget.resource].component1] >= minProductionPacketSize &&
											Game.rooms[r].storage.store[mineralDescriptions[productionTarget.resource].component2] >= minProductionPacketSize) {
											//All components ready, start production
											let reactionAmount = Math.min(Game.rooms[r].storage.store[mineralDescriptions[productionTarget.resource].component1], Game.rooms[r].storage.store[mineralDescriptions[productionTarget.resource].component2]);
											if (reactionAmount > genuineDelta) {
												reactionAmount = genuineDelta;
											}
											Game.rooms[r].memory.labTarget = reactionAmount + ":" + productionTarget.resource;
											if (LOG_INFO == true) {
												console.log("<font color=#ffca33 type='highlight'>Room " + Game.rooms[r].name + " started auto production of " + reactionAmount + " " + productionTarget.resource + ".</font>");
											}
										} else if (Game.rooms[r].storage.store[mineralDescriptions[productionTarget].component1] < minProductionPacketSize) {
											resource = mineralDescriptions[productionTarget].component1;
										} else if (Game.rooms[r].storage.store[mineralDescriptions[productionTarget].component2] < minProductionPacketSize) {
											resource = mineralDescriptions[productionTarget].component2;
										}
										productionTarget = whatIsLackingFor(Game.rooms[r], genuineDelta, resource);
									}

									if (mineralDescriptions[productionTarget.resource].tier == 0) {
										//Tier 0 resource missing
										Game.rooms[r].memory.lastMissingComponent = productionTarget.resource;
									}
								}
							}
						}
					}
				}
			}
		}
	},

	labCode: function (r) {
		// Lab code
		//Set orders from target
		if (Game.time % DELAYPRODUCTION == 0 && Game.cpu.bucket > CPU_THRESHOLD && Game.rooms[r].memory.labTarget != undefined && Game.rooms[r].memory.labOrder == undefined) {
			// Lab Queueing Code
			var labString = Game.rooms[r].memory.labTarget.split(":");
			var origAmount = labString[0];
			var origResource = labString[1];
			if (mineralDescriptions[labString[1]].tier == 0) {
				delete Game.rooms[r].memory.labTarget;
			} else {
				while (mineralDescriptions[labString[1]] != undefined && mineralDescriptions[labString[1]].tier > 0) {
					var labTarget = global.whatIsLackingFor(Game.rooms[r], labString[0], labString[1]);
					var missingComponent1 = mineralDescriptions[labTarget.resource].component1;
					var missingComponent2 = mineralDescriptions[labTarget.resource].component2;
					if (Game.rooms[r].storage.store[missingComponent1] != undefined && Game.rooms[r].storage.store[missingComponent2] != undefined &&
						Game.rooms[r].storage.store[missingComponent1] >= labTarget.amount && Game.rooms[r].storage.store[missingComponent2] >= labTarget.amount) {
						//All component available
						if (labTarget.amount == 0) {
							labTarget.amount = origAmount;
						}
						//set a LAB order
						Game.rooms[r].memory.labOrder = labTarget.amount + ":" + missingComponent1 + ":" + missingComponent2 + ":prepare";
						if (missingComponent1 == mineralDescriptions[origResource].component1 && missingComponent2 == mineralDescriptions[origResource].component2) {
							// Last production order given
							delete Game.rooms[r].memory.labTarget;
						}
						break;
					} else {
						//Components missing
						if (Game.rooms[r].storage.store[missingComponent1] == undefined || Game.rooms[r].storage.store[missingComponent1] < labTarget.amount) {
							//Component 1 missing
							if (Game.rooms[r].storage.store[missingComponent1] == undefined) {
								labString[0] = labTarget.amount;
							} else {
								labString[0] = labTarget.amount - Game.rooms[r].storage.store[missingComponent1];
							}
							labString[1] = missingComponent1;
						} else {
							//Component 2 missing
							if (Game.rooms[r].storage.store[missingComponent2] == undefined) {
								labString[0] = labTarget.amount;
							} else {
								labString[0] = labTarget.amount - Game.rooms[r].storage.store[missingComponent2];
							}
							labString[1] = missingComponent2;
						}
					}
				}
			}

		}

		// Lab Production Code
		if (Game.time % DELAYLAB == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
			if (Game.rooms[r].memory.innerLabs == undefined) {
				// Prepare link roles
				var emptyArray = {};
				var innerLabs = [];
				emptyArray["labID"] = "[LAB_ID]";
				emptyArray["resource"] = "[RESOURCE]";
				innerLabs.push(emptyArray);
				innerLabs.push(emptyArray);
				Game.rooms[r].memory.innerLabs = innerLabs;
			}
			if (Game.rooms[r].memory.labOrder != undefined) { //FORMAT: 500:H:Z:[prepare/running/done]
				var innerLabs = [];
				if (Game.rooms[r].memory.innerLabs == undefined) {
					// Prepare link roles
					var emptyArray = {};
					emptyArray["labID"] = "[LAB_ID]";
					emptyArray["resource"] = "[RESOURCE]";
					innerLabs.push(emptyArray);
					Game.rooms[r].memory.innerLabs = innerLabs;
				} else if (Game.rooms[r].memory.innerLabs[0].labID != "[LAB_ID]" && Game.rooms[r].memory.innerLabs[1].labID != "[LAB_ID]") {
					innerLabs = Game.rooms[r].memory.innerLabs;
					var labOrder = Game.rooms[r].memory.labOrder.split(":");
					if (innerLabs.length == 2) {
						//There are two innerLabs defined
						if (innerLabs[0].resource != labOrder[1] || innerLabs[1].resource != labOrder[2]) {
							//Set inner lab resource to ingredients
							innerLabs[0].resource = labOrder[1];
							innerLabs[1].resource = labOrder[2];
							Game.rooms[r].memory.innerLabs = innerLabs;
						}
						var rawAmount = labOrder[0];
						if (rawAmount > Game.getObjectById(innerLabs[0].labID).mineralCapacity) {
							rawAmount = Game.getObjectById(innerLabs[0].labID).mineralCapacity;
						}
						if (labOrder[3] == "prepare" && Game.getObjectById(innerLabs[0].labID).mineralType == innerLabs[0].resource && Game.getObjectById(innerLabs[0].labID).mineralAmount >= rawAmount &&
							Game.getObjectById(innerLabs[1].labID).mineralType == innerLabs[1].resource && Game.getObjectById(innerLabs[1].labID).mineralAmount >= rawAmount) {
							labOrder[3] = "running";
							Game.rooms[r].memory.labOrder = labOrder.join(":");
						}
						if (labOrder[3] == "running") {
							// Reaction can be started
							for (var lab in Game.rooms[r].memory.roomArray.labs) {
								if ((Game.rooms[r].memory.boostLabs == undefined || Game.rooms[r].memory.boostLabs.indexOf(Game.rooms[r].memory.roomArray.labs[lab]) == -1) && Game.rooms[r].memory.roomArray.labs[lab] != innerLabs[0].labID && Game.rooms[r].memory.roomArray.labs[lab] != innerLabs[1].labID) {
									if (Game.getObjectById(innerLabs[0].labID).mineralAmount > 4 && Game.getObjectById(innerLabs[1].labID).mineralAmount > 4) {
										//Still enough material to do a reaction
										var currentLab = Game.getObjectById(Game.rooms[r].memory.roomArray.labs[lab]);
										if (currentLab.cooldown == 0) {
											currentLab.runReaction(Game.getObjectById(innerLabs[0].labID), Game.getObjectById(innerLabs[1].labID));
										}
									} else {
										labOrder[3] = "done";
										Game.rooms[r].memory.labOrder = labOrder.join(":");
									}
								}
							}
						}
					}
				} else {
					console.log("Inner links not defined in room " + Game.rooms[r].name);
				}
			}
		}
	}
};