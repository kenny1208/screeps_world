var roleUpgrader = {
    run: function (creep) {
        // 當 creep 正在升級，但已經耗盡能量時，切換到採集能量模式
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say("🔄 harvest");
        }
        // 當 creep 正在採集能量，且能量滿載時，切換到升級模式
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
            creep.say("⚡ upgrade");
        }

        if (creep.memory.upgrading) {
            // 若處於升級狀態，則嘗試升級房間控制器
            if (
                creep.upgradeController(creep.room.controller) ===
                ERR_NOT_IN_RANGE
            ) {
                creep.moveTo(creep.room.controller, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        } else {
            // 如果處於採集能量狀態，先決定採集哪個來源
            var sources = creep.room.find(FIND_SOURCES);
            // 取得 creep 名稱中的數字部分，利用單雙數決定採集的能源點
            var creepNumber = parseInt(creep.name.match(/\d+$/));
            var source = creepNumber % 2 === 0 ? sources[0] : sources[1];
            source = sources[0];
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        }
    },
};

module.exports = roleUpgrader;
