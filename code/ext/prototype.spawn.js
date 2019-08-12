StructureSpawn.prototype.getBodyInfo =
    function(roleName, energy) {
        var bodyInfo = {};
        bodyInfo.role = roleName;

        let rcl = this.room.controller.level;
        if (buildingPlans[roleName] == undefined) {
            console.log("No building plans for " + roleName + " found!");
        } else if (buildingPlans[roleName][rcl - 1].minEnergy > energy && rcl > 1) {
            if (buildingPlans[roleName][rcl - 2].minEnergy > energy) {
                return buildingPlans[roleName][0].body;
            } else {
                return buildingPlans[roleName][rcl - 2].body;
            }
        } else {
            return buildingPlans[roleName][rcl - 1].body;
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function(energy, roleName, home = this.room, target, sourceId) {
        let targetName = ""
        let body = this.getBodyInfo(roleName, this.room.energyCapacityAvailable);

        if (target != undefined) {
            targetName = target
        }

        if (roleName == "miniharvester") {
            roleName = "harvester";
        }

        let name = roleName + "-" + home + "-" + targetName + "-" + Game.time;

        var testIfCanSpawn = this.spawnCreep(body, name, {
            dryRun: true
        });
        //console.log(testIfCanSpawn)

        if (body != null && testIfCanSpawn == OK) {
            return this.createCreep(body, name, {
                role: roleName,
                sourceId: sourceId,
                home: home,
                target: target
            });
        } else {
            if (energy > this.room.energyCapacityAvailable || testIfCanSpawn != -6) {
                console.log(this.name + " result: " + testIfCanSpawn + " body: " + body + " energyValiable: " + this.room.energyAvailable + "/" + this.room.energyCapacityAvailable + "<br> " +
                    energy, roleName, home = this.room, target, sourceId)
            }
        }
    };