var roleHarvester = require('role.harvester');
var roleUpgrader  = require('role.upgrader');
var roleBuilder   = require('role.builder');

module.exports.loop = function () {
    // 1. 清理 Memory 中已死亡的 creep，並輸出死亡訊息
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            console.log('Creep died: ' + name);
            delete Memory.creeps[name];
        }
    }

    var spawn = Game.spawns['Spawn1'];

    // 2. 根據各角色在 Game.creeps 中的數量來判斷是否需要生成新 creep
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
    var upgraders  = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
    var builders   = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
    if (!spawn.spawning) {
        if (harvesters.length < 8) {
        // 優先生成 harvester
            var newName = 'Harvester' + Game.time;
            let result = spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, { memory: { role: 'harvester' } });
            if (result === OK) console.log('Spawning new harvester: ' + newName);
        } else if (upgraders.length < 18) {
            // 接著生成 upgrader
            var newName = 'Upgrader' + Game.time;
            let result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: 'upgrader' } });
            if (result === OK) console.log('Spawning new upgrader: ' + newName);
        } else if (builders.length < 4) {
            // 最後生成 builder
            var newName = 'Builder' + Game.time;
            let result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: 'builder' } });
            if (result === OK) console.log('Spawning new builder: ' + newName);
        }
    }

    // 3. 執行各個角色的行為
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.memory.role === 'harvester') {
            roleHarvester.run(creep);
        } else if (creep.memory.role === 'upgrader') {
            roleUpgrader.run(creep);
        } else if (creep.memory.role === 'builder') {
            roleBuilder.run(creep);
        }
    }
};
