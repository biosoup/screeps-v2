"use strict"
const stats = require('tools.stats');

// economy statistics

/*
What we need:
- collect tick stats into memory
    memory:economy:tick:data
- dispose of old stats
- compute averages

*/


module.exports = {
    run: function() {
        // run whole stats collection

        if (Memory.economy === undefined) Memory.economy = {};
        if (Memory.economy.stats === undefined) Memory.economy.stats = {};
        for (let room in Game.rooms) {
            this.collectRooms(room)
        }
    },

    collectRooms: function(roomName) {
        let room = Game.rooms[roomName]
        let payload = {}
        payload.time = Game.time
        payload.roomName = room.name

        //collect input stats for a room
        let sources = room.find(FIND_SOURCES)
        if (sources) {
            //sources data
            let sourceRemaining = 0
            let sourceCapacity = 0
            let sourceRegen = 0
            for (let s in sources) {
                sourceRemaining += sources[s].energy
                sourceCapacity += sources[s].energyCapacity
                if (sources[s].ticksToRegeneration) {
                    sourceRegen += sources[s].ticksToRegeneration
                }
            }
            payload.sourceRemaining = sourceRemaining
            payload.sourceCapacity = sourceCapacity
            payload.sourceRegen = sourceRegen
        }

        if (room.containers) {
            //containers data
            let containerEnergy = 0
            let containerOther = 0
            for (let c in room.containers) {
                containerEnergy += room.containers[c].store[RESOURCE_ENERGY]
                containerOther += _.sum(room.containers[c].store) - room.containers[c].store[RESOURCE_ENERGY]
            }
            payload.containerEnergy = containerEnergy
            payload.containerOther = containerOther
        }

        if (room.storage) {
            //storage data
            payload.storageEnergy = room.storage.store[RESOURCE_ENERGY]
            payload.storageOther = _.sum(room.storage.store) - room.storage.store[RESOURCE_ENERGY]
        }

        if (room.terminal) {
            //terminal data
            payload.terminalEnergy = room.terminal.store[RESOURCE_ENERGY]
            payload.terminalOther = _.sum(room.terminal.store) - room.terminal.store[RESOURCE_ENERGY]
        }

        if (room.links) {
            //links data
            let linksEnergy = 0
            for (let l in room.links) {
                linksEnergy += room.links[l].energy
            }
            payload.linksEnergy = linksEnergy
        }

        let lorries = room.find(FIND_MY_CREEPS, {
            filter: (c) => c.memory.role == 'longDistanceLorry'
        })
        if (lorries) {
            //energy in transit
            let energyInTransit = 0
            for (let c in lorries) {
                energyInTransit += _.sum(lorries[c].carry)
            }
            payload.energyInTransit = energyInTransit
        }

        //write them into memory

        //console.log(JSON.stringify(payload))

        return payload
    },

    deleteOld: function() {
        //delete old data
    }
};