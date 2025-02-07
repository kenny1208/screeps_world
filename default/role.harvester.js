/**
 * Harvester 角色：
 * 1. 根據 creep 名稱中的數字部分決定採集目標房間（單數、雙數分配）。
 * 2. 當能量為空時，前往 targetRoom 採集；當能量滿載時，返回 homeRoom 送能量。
 * 3. 在途中會避開房間邊緣（防止卡住）及檢查敵人狀況。
 * 4. 如果遇到敵人且具備攻擊能力則進行攻擊，否則逃跑到 SafeZone（請先於地圖上設置 SafeZone 旗標）。
 */

var roleHarvester = {
    /** @param {Creep} creep **/
    run: function (creep) {
        // 取得 creep 名稱中的數字部分（假設名稱最後有數字）
        const creepNumber = parseInt(creep.name.match(/\d+$/));

        // 定義 homeRoom 與 targetRoom：
        // 例如：偶數 creep 在 homeRoom 內工作；奇數 creep 必須跨房採集
        const homeRoom = "W3S57";
        const targetRoom = creepNumber % 2 === 0 ? homeRoom : "W3S58";

        // 如果 creep 處於房間邊緣，先移動至內部（這裡檢查上下左右邊緣）
        if (
            creep.pos.x === 0 ||
            creep.pos.x === 49 ||
            creep.pos.y === 0 ||
            creep.pos.y === 49
        ) {
            // 將 creep 移動到稍微內部的位置（這裡選擇 25,25 或依據目前位置做限制）
            creep.moveTo(25, 25, { visualizePathStyle: { stroke: "#ffffff" } });
            return;
        }

        // 跨房移動邏輯：
        // 如果能量為空且不在 targetRoom，則前往 targetRoom 採集
        if (
            creep.store[RESOURCE_ENERGY] === 0 &&
            creep.room.name !== targetRoom
        ) {
            creep.moveTo(new RoomPosition(25, 25, targetRoom), {
                visualizePathStyle: { stroke: "#ffaa00" },
            });
            creep.say("→ Harvest");
            return;
        }
        // 如果能量已滿且不在 homeRoom，則返回 homeRoom送能量
        if (
            creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 &&
            creep.room.name !== homeRoom
        ) {
            creep.moveTo(new RoomPosition(25, 25, homeRoom), {
                visualizePathStyle: { stroke: "#af47f5" },
            });
            creep.say("← Return");
            return;
        }

        // 優先檢查是否有敵人出現
        const hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (hostile) {
            if (creep.getActiveBodyparts(ATTACK) > 0) {
                // 若有近戰攻擊能力，嘗試靠近攻擊
                if (creep.attack(hostile) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile, {
                        visualizePathStyle: { stroke: "#ff0000" },
                    });
                    creep.say("⚔️ Attack!");
                }
            } else if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                // 若有遠程攻擊能力，嘗試遠程攻擊
                if (creep.rangedAttack(hostile) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile, {
                        visualizePathStyle: { stroke: "#ff0000" },
                    });
                    creep.say("🏹 Shoot!");
                }
            } else {
                // 若沒有攻擊能力，則跑向安全區（請先設置 SafeZone 旗標）
                if (Game.flags["SafeZone"]) {
                    creep.moveTo(Game.flags["SafeZone"]);
                }
                creep.say("🏃 Run!");
            }
            return; // 優先處理敵人狀況，其他行為暫停
        }

        // 狀態切換：採集（harvesting）或送能量（delivering）
        if (creep.memory.delivering && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.delivering = false;
            creep.say("🔄 Harvest");
        }
        if (
            !creep.memory.delivering &&
            creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
        ) {
            creep.memory.delivering = true;
            creep.say("🚚 Deliver");
        }

        // 根據當前狀態執行任務
        if (!creep.memory.delivering) {
            // 採集能量：
            // 取得當前房間內所有 Source，如果房間中有多個，依據 creepNumber 決定採哪一個
            const sources = creep.room.find(FIND_SOURCES);
            let source;
            if (sources.length > 1) {
                source = creepNumber % 2 === 0 ? sources[1] : sources[0];
            } else {
                source = sources[0];
            }
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        } else {
            // 送能量：
            // 優先取得記憶中的目標，若不存在或已滿則重新搜尋
            let target = Game.getObjectById(creep.memory.targetId);
            if (
                !target ||
                target.store.getFreeCapacity(RESOURCE_ENERGY) === 0
            ) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            (structure.structureType === STRUCTURE_SPAWN ||
                                structure.structureType ===
                                    STRUCTURE_EXTENSION ||
                                structure.structureType ===
                                    STRUCTURE_STORAGE) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                        );
                    },
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
            } else {
                // 若找不到合適的送能量目標，可考慮其他任務（例如升級 Controller）
                creep.say("No target");
            }
        }
    },
};

module.exports = roleHarvester;
