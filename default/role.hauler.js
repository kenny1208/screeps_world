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

        // �p�G Hauler �٨S���A�u���������餺����q
        if (!creep.memory.delivering) {
            var tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (t) => t.store[RESOURCE_ENERGY] > 0,
            });

            if (tombstone) {
                // �p�G�����餺����q�A���h��
                if (
                    creep.withdraw(tombstone, RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(tombstone, {
                        visualizePathStyle: { stroke: "#fa3f32" },
                    });
                }
            } else {
                // �p�G�S�����q�A�q Storage ����q
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
                    // �p�G Storage �]�S��q�A�� Hauler �ܦ� Harvester
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
                        visualizePathStyle: { stroke: "#fa3f32" },
                    });
                }
            }
        }
    },
};

module.exports = roleHauler;
