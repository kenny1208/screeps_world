var roleHarvester = {
    run: function (creep) {
        // 1️⃣ 取得 creep 名稱中的數字部分
        var creepNumber = parseInt(creep.name.match(/\d+$/));

        // 2️⃣ 根據單雙數決定目標房間
        var targetRoom = creepNumber % 2 === 0 ? "W3S57" : "W3S58";

        // 3️⃣ 如果不在目標房間，先移動過去
        if (creep.room.name !== targetRoom) {
            creep.moveTo(new RoomPosition(25, 25, targetRoom), {
                visualizePathStyle: { stroke: "#ffaa00" },
            });
            creep.say("🚶 Moving");
            return;
        }

        // 4️⃣ 找到最近的敵人
        var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

        if (hostile) {
            if (creep.getActiveBodyparts(ATTACK) > 0) {
                // 如果 Harvester 有 `ATTACK`，就近戰攻擊
                if (creep.attack(hostile) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile, {
                        visualizePathStyle: { stroke: "#ff0000" },
                    });
                    creep.say("⚔️ Attack!");
                }
            } else if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                // 如果 Harvester 有 `RANGED_ATTACK`，就遠程攻擊
                if (creep.rangedAttack(hostile) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile, {
                        visualizePathStyle: { stroke: "#ff0000" },
                    });
                    creep.say("🏹 Shoot!");
                }
            } else {
                // 如果 Harvester 沒有攻擊能力，就逃跑
                creep.say("🏃 Run!");
                creep.moveTo(Game.flags["SafeZone"]); // 逃到安全地點（請在地圖上設置 `SafeZone` 旗標）
            }
            return; // 當有敵人時，優先執行戰鬥，不做其他行動
        }

        // 5️⃣ 確定採集哪個 Source
        var sources = creep.room.find(FIND_SOURCES);
        var source = creepNumber % 2 === 0 ? sources[1] : sources[0];

        // 6️⃣ 狀態切換邏輯
        if (creep.memory.delivering && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.delivering = false;
            creep.say("🔄 harvest");
        }
        if (!creep.memory.delivering && creep.store.getFreeCapacity() === 0) {
            creep.memory.delivering = true;
            creep.say("🚚 deliver");
        }

        // 7️⃣ 如果 Creep 需要採礦
        if (!creep.memory.delivering) {
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        }
        // 8️⃣ 如果 Creep 要送能量
        else {
            var target = Game.getObjectById(creep.memory.targetId);
            if (
                !target ||
                target.store.getFreeCapacity(RESOURCE_ENERGY) === 0
            ) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) =>
                        (structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_STORAGE) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
                });

                if (target) {
                    creep.memory.targetId = target.id;
                }
            }

            if (target) {
                if (
                    creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
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
