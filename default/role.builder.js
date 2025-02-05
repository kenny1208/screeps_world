var roleBuilder = {
    run: function (creep) {
        // 狀態切換邏輯：
        // 如果處於建造／修補模式 (creep.memory.building) 但能量耗盡，就切換到採集模式
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say("🔄 harvest");
        }
        // 如果處於採集模式 (即 building 為 false) 且能量收集滿，就切換到建造／修補模式
        if (
            !creep.memory.building &&
            creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
        ) {
            creep.memory.building = true;
            creep.say("⚡ build");
        }

        //  執行各模式下的行為
        if (creep.memory.building) {
            // 當處於建造／修補模式時，先嘗試建造工地
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                // 如果不在工地建造範圍內，就移動到工地附近
                if (creep.build(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            } else {
                // 若沒有建造工地，則開始修補
                var repairTarget = null;
                // 優先找尋需要修補的 Rampart（防禦牆）
                var ramparts = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType === STRUCTURE_RAMPART &&
                            structure.hits < structure.hitsMax
                        );
                    },
                });
                if (ramparts.length > 0) {
                    // 將 Rampart 依照 hits 值由低到高排序，選擇最需要修補的
                    ramparts.sort((a, b) => a.hits - b.hits);
                    repairTarget = ramparts[0];
                } else {
                    // 若沒有 Rampart 需要修補，再找其他需要修補的結構
                    var repairTargets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                structure.hits < structure.hitsMax &&
                                structure.structureType !== STRUCTURE_RAMPART
                            );
                        },
                    });
                    if (repairTargets.length > 0) {
                        repairTargets.sort((a, b) => a.hits - b.hits);
                        repairTarget = repairTargets[0];
                    }
                }
                // 如果找到了需要修補的目標，則嘗試修補
                if (repairTarget) {
                    if (creep.repair(repairTarget) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(repairTarget, {
                            visualizePathStyle: { stroke: "#00ff00" },
                        });
                    }
                }
            }
        } else {
            // 當處於採集能量模式時
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (source) {
                // 若不在採集範圍內，就移動到能量來源附近
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    });
                }
            }
        }
    },
};

module.exports = roleBuilder;
