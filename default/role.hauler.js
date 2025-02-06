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

        // 如果 Hauler 還沒滿，優先收集屍體內的能量
        if (!creep.memory.delivering) {
            var tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (t) => t.store[RESOURCE_ENERGY] > 0,
            });

            if (tombstone) {
                // 如果有屍體內有能量，先去撿
                if (
                    creep.withdraw(tombstone, RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(tombstone, {
                        visualizePathStyle: { stroke: "#fa3f32" },
                    });
                }
            } else {
                // 如果沒屍體能量，從 Storage 取能量
                var storage = creep.room.storage;
                if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                    if (
                        creep.withdraw(storage, RESOURCE_ENERGY) ==
                        ERR_NOT_IN_RANGE
                    ) {
                        creep.moveTo(storage, {
                            visualizePathStyle: { stroke: "#ffaa00" },
                        });
                    }
                } else {
                    // 如果 Storage 也沒能量，讓 Hauler 變成 Harvester
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
                        visualizePathStyle: { stroke: "#fa3f32" },
                    });
                }
            }
        }
    },
};

module.exports = roleHauler;
