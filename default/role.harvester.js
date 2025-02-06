var roleHarvester = {
    run: function (creep) {
        // 1. 定義能量來源
        var sources = creep.room.find(FIND_SOURCES);

        // 取得 creep 名稱中的數字部分，並根據單雙數決定採集哪個來源
        var creepNumber = parseInt(creep.name.match(/\d+$/));
        var source = creepNumber % 2 === 0 ? sources[0] : sources[1];
        source = sources[1];
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

        //  根據當前狀態執行動作
        if (!creep.memory.delivering) {
            //  挖礦邏輯
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        } else {
            // 先檢查記憶中的目標是否還需要能量
            var target = Game.getObjectById(creep.memory.targetId);
            if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                // 重新尋找新目標（**只在當前目標滿了時執行**）
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) =>
                        (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_STORAGE) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
                });

                if (target) {
                    creep.memory.targetId = target.id; // 記住新的目標
                }
            }

            // 傳送能量到固定目標
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

module.exports = roleHarvester;
