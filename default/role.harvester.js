var roleHarvester = {
    run: function (creep) {
        // 1. 定義能量來源
        var sources = creep.room.find(FIND_SOURCES);

        // 取得 creep 名稱中的數字部分，並根據單雙數決定採集哪個來源
        var creepNumber = parseInt(creep.name.match(/\d+$/));
        var source = creepNumber % 2 === 0 ? sources[0] : sources[1];
        var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

        if (hostile) {
            if (creep.harvest(hostile) === ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
            return;
        }

        // 2. 狀態切換邏輯
        if (creep.memory.delivering && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.delivering = false;
            creep.say("🔄 harvest");
        }
        if (
            !creep.memory.delivering &&
            creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
        ) {
            creep.memory.delivering = true;
            creep.say("🚚 deliver");
        }

        // 3. 根據當前狀態執行動作
        if (creep.memory.delivering) {
            // 先尋找有空間的 Extensions
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) =>
                    structure.structureType === STRUCTURE_EXTENSION &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            });

            // 如果 Extensions 已滿，再尋找 Spawn & Tower
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) =>
                        (structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER ||
                            structure.structureType === STRUCTURE_STORAGE) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
                });
            }

            // 如果找到目標，嘗試傳送能量；若不在傳送範圍則移動過去
            if (target) {
                if (
                    creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(target, {
                        visualizePathStyle: { stroke: "#8971f5" },
                    });
                }
            }
        } else {
            // 採集能量模式：採集指定的能源來源
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        }
    },
};

module.exports = roleHarvester;
