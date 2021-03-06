import { readFileSync } from 'fs';
import { ItemDefinition } from '@runejs/cache-parser';
import { logger } from '@runejs/logger/dist/logger';
import { join } from 'path';
import { serverDir } from '../../game-server';
import { JSON_SCHEMA, safeLoad } from 'js-yaml';

export enum EquipmentSlot {
    HEAD = 0,
    BACK = 1,
    NECK = 2,
    MAIN_HAND = 3,
    TORSO = 4,
    OFF_HAND = 5,
    LEGS = 7,
    GLOVES = 9,
    BOOTS = 10,
    RING = 12,
    QUIVER = 13
}

export const equipmentSlotIndex = (slot: EquipmentSlot): number => {
    return parseInt(EquipmentSlot[slot], 10);
};

export enum HelmetType {
    HAT = 'HAT',
    FULL_HELMET = 'FULL_HELMET'
}

export enum TorsoType {
    VEST = 'VEST',
    FULL = 'FULL'
}

export enum WeaponType {
    TWO_HANDED = 'TWO_HANDED',
    ONE_HANDED = 'ONE_HANDED'
}

export interface EquipmentBonuses {
    offencive?: {
        speed?: number;
        stab: number;
        slash: number;
        crush: number;
        magic: number;
        ranged: number;
    },
    defencive?: {
        stab: number;
        slash: number;
        crush: number;
        magic: number;
        ranged: number;
    },
    skill?: {
        strength: number;
        prayer: number;
    }
}

export interface ItemDetails {
    id: number;
    desc?: string;
    canTrade: boolean;
    questItem?: boolean;
    weight?: number;
    alchemy?: {
        high?: number;
        low?: number;
    };
    equipment?: {
        slot?: EquipmentSlot;
        helmetType?: HelmetType;
        torsoType?: TorsoType;
        weaponType?: WeaponType;
        bonuses?: EquipmentBonuses;
    };
}

export interface ItemData extends ItemDefinition, ItemDetails {
}

export function parseItemData(itemDefinitions: Map<number, ItemDefinition>): Map<number, ItemData> {
    try {
        logger.info('Parsing additional item data...');

        const itemDetailsList = safeLoad(readFileSync(join(serverDir, 'data/config/item-data.yaml'), 'utf8'), { schema: JSON_SCHEMA }) as ItemDetails[];

        if(!itemDetailsList || itemDetailsList.length === 0) {
            throw 'Unable to read item data.';
        }

        const itemDataMap: Map<number, ItemData> = new Map<number, ItemData>();
        itemDefinitions.forEach(itemDefinition => {
            let itemDetails = itemDetailsList.find(i => i.id === itemDefinition.id);

            if(!itemDetails) {
                itemDetails = {
                    id: itemDefinition.id,
                    canTrade: false
                };
            }

            const itemData: ItemData = { ...itemDefinition, ...itemDetails };
            itemDataMap.set(itemData.id, itemData);
        });

        logger.info(`Additional info found for ${itemDetailsList.length} items.`);

        return itemDataMap;
    } catch(error) {
        logger.error('Error parsing game item data: ' + error);
        return null;
    }
}
