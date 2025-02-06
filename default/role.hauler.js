var roleHauler = {
    run: function (creep) {
        // �ˬd Hauler �O�_�n�}�l�h�B
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

        // �p�G Storage ���S����q�A�� Hauler �ܦ� Harvester
        var storage = creep.room.storage;
        if (!creep.memory.delivering) {
            if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                // ���`���p�G�q Storage ����q
                if (
                    creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(storage, {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    });
                }
            } else {
                // Storage �S��q�A�� Hauler �ܦ� Harvester
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
        // Hauler �h�B��q�� Spawn�BExtensions�BTower
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
