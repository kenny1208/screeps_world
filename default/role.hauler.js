var roleHauler = {
    run: function (creep) {
        // 檢查 Hauler 是否要開始搬運
        if (creep.memory.delivering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.delivering = false;
            creep.say("take");
        }
        if (
            !creep.memory.delivering &&
            creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0
        ) {
            creep.memory.delivering = true;
            creep.say("deliver");
        }

        // 如果 Storage 內沒有能量，讓 Hauler 變成 Harvester
        var storage = creep.room.storage;
        if (!creep.memory.delivering) {
            if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                // 正常情況：從 Storage 取能量
                if (
                    creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(storage, {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    });
                }
            } else {
                // Storage 沒能量，讓 Hauler 變成 Harvester
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source) {
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {
                            visualizePathStyle: { stroke: "#ffaa00" },
                        });
                    }
                }
            }
        }
        // Hauler 搬運能量到 Spawn、Extensions、Tower
        else {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) =>
                    (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            });

            if (target) {
                if (
                    creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(target, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }
    },
};

module.exports = roleHauler;
