var Tasks = require("tools.creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function(creep) {
        // get source
        var source = Game.getObjectById(creep.memory.sourceId);
        if (!_.isEmpty(source)) {
            // find container next to source
            var container = _.first(source.pos.findInRange(creep.room.containers, 1));

            //creep has container
            if (!_.isEmpty(container)) {
                // if creep is on top of the container
                if (creep.pos.isEqualTo(container.pos)) {
                    if (container.hits < container.hitsMax && creep.carry.energy > 0) {
                        creep.task = Tasks.repair(container)
                        creep.say(EM_WRENCH, true)
                        return
                    } else if (creep.carry.energy == creep.carryCapacity) {
                        //look for a link
                        var link = _.first(source.pos.findInRange(creep.room.links, 2))
                        if (!_.isEmpty(link)) {
                            //TODO: check for controller/core links energy levels
                            if (link.energy < link.energyCapacity) {
                                //there is a space in the link
                                creep.task = Tasks.transfer(link);
                                creep.say(EM_LIGHTNING, true)
                                return;
                            } else if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                                // harvest source
                                creep.task = Tasks.harvest(source);
                                return;
                            }
                        } else {
                            if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                                // harvest source
                                creep.task = Tasks.harvest(source);
                                return;
                            } else {
                                // creep is full, do something usefull
                                var extensions = _.first(creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                                    filter: f => f.structureType == STRUCTURE_EXTENSION && f.energy < f.energyCapacity
                                }))
                                if (!_.isEmpty(extensions)) {
                                    creep.transfer(extensions)
                                }

                                var linkCs = _.first(creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 2))
                                if (!_.isEmpty(linkCs)) {
                                    creep.task = Tasks.build(linkCs)
                                    return
                                }
                            }
                        }
                    } else if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                        //container has free space -> harvest source
                        creep.task = Tasks.harvest(source);
                        return;
                    } else {
                        if (creep.carry.energy < creep.carryCapacity) {
                            // harvest source
                            creep.task = Tasks.harvest(source);
                            return
                        } else {
                            //no free space
                            creep.say(EM_EXCLAMATION + "" + EM_PACKAGE, true)
                        }
                    }
                } else {
                    // if creep is not on top of the container
                    creep.travelTo(container);
                    return;
                }
            } else {
                creep.say("missing container")
                if (creep.carry.energy < creep.carryCapacity) {
                    creep.task = Tasks.harvest(source);
                    return
                } else {
                    //no container, check for link
                    var link = _.first(source.pos.findInRange(creep.room.links, 2))
                    if (!_.isEmpty(link)) {
                        if (link.energy < link.energyCapacity) {
                            //there is a space in the link
                            creep.task = Tasks.transfer(link);
                            creep.say(EM_LIGHTNING, true)
                            return
                        }
                    } else {
                        //find container construction sites
                        var buildSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                            filter: f => f.structureType == STRUCTURE_CONTAINER
                        });
                        if (!_.isEmpty(buildSite)) {
                            creep.task = Tasks.build(buildSite);
                            creep.say(EM_BUILD, true)
                            return
                        } else {
                            //no link and no container, place container
                            creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                        }
                    }
                }
            }
        } else {
            creep.say("missing source")
            //console.log(creep + " " + source)
            //creep.task = Tasks.goTo(source)
            creep.suicide()
            return
        }
    }
};