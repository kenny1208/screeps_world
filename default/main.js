var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");
var roleBuilder = require("role.builder");
var roleHauler = require("role.hauler");

module.exports.loop = function () {
    var towers = Game.rooms["W3S57"].find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER },
    });
    for (let tower of towers) {
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            tower.attack(target);
        }
    }

    // 清理 Memory 中已死亡的 creep，並輸出死亡訊息
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            console.log("Creep died: " + name);
            delete Memory.creeps[name];
        }
    }

    var spawn = Game.spawns["Spawn1"];

    // 根據各角色在 Game.creeps 中的數量來判斷是否需要生成新 creep
    var hauler = _.filter(
        Game.creeps,
        (creep) => creep.memory.role === "hauler"
    );
    var harvesters = _.filter(
        Game.creeps,
        (creep) => creep.memory.role === "harvester"
    );
    var upgraders = _.filter(
        Game.creeps,
        (creep) => creep.memory.role === "upgrader"
    );
    var builders = _.filter(
        Game.creeps,
        (creep) => creep.memory.role === "builder"
    );

    if (!spawn.spawning) {
        if (harvesters.length < 15) {
            // 生成 harvester
            var newName = "Harvester" + Game.time;
            let result = spawn.spawnCreep(
                [WORK, WORK, CARRY, MOVE, MOVE, RANGED_ATTACK],
                newName,
                {
                    memory: { role: "harvester" },
                }
            );
            if (result === OK)
                console.log("Spawning new harvester: " + newName);
        } else if (hauler.length < 3) {
            // 生成 hauler
            var newName = "Hauler" + Game.time;
            let result = spawn.spawnCreep(
                [CARRY, CARRY, CARRY, MOVE, MOVE],
                newName,
                {
                    memory: { role: "hauler" },
                }
            );
            if (result === OK) console.log("Spawning new hauler: " + newName);
        } else if (upgraders.length < 10) {
            // 接著生成 upgrader
            var newName = "Upgrader" + Game.time;
            let result = spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {
                memory: { role: "upgrader" },
            });
            if (result === OK) console.log("Spawning new upgrader: " + newName);
        } else if (builders.length < 6) {
            // 最後生成 builder
            var newName = "Builder" + Game.time;
            let result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
                memory: { role: "builder" },
            });
            if (result === OK) console.log("Spawning new builder: " + newName);
        }
    }

    // 執行各個角色的行為
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.memory.role === "hauler") {
            roleHauler.run(creep);
        } else if (creep.memory.role === "harvester") {
            roleHarvester.run(creep);
        } else if (creep.memory.role === "upgrader") {
            roleUpgrader.run(creep);
        } else if (creep.memory.role === "builder") {
            roleBuilder.run(creep);
        }
    }
};
