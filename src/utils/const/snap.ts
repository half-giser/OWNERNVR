/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 20:03:07
 * @Description: 抓拍相关常量
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-29 11:33:46
 */
export const GENDER_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_MALE',
    2: 'IDCS_FEMALE',
}

export const AGE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_INFANT',
    2: 'IDCS_JUVENILE',
    3: 'IDCS_YOUTH',
    4: 'IDCS_MIDLIFE',
    5: 'IDCS_ELDERLY',
}

export const ORIENT_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_FRONT_FACE',
    2: 'IDCS_BACK_FACE',
    3: 'IDCS_SIDE_FACE',
}

export const HAT_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_YES',
    2: 'IDCS_NO',
}

export const GLASS_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_YES',
    2: 'IDCS_NO',
}

export const MASK_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_YES',
    2: 'IDCS_NO',
}

export const BACKPACK_TYPE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_YES',
    2: 'IDCS_NO',
}

// const BACKPACK_SHOULDERBAG_MAP: Record<number, string> = {
//     0: '--',
//     1: '有单肩包',
//     2: '没有单肩包',
// }

export const UPPER_TYPE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_UPPER_BODY_LONG_SLEEVE',
    2: 'IDCS_UPPER_BODY_SHORT_SLEEVE',
}

export const LOWER_TYPE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_LOWER_BODY_SHORTS',
    2: 'IDCS_LOWER_BODY_TROUSERS',
}

export const UPPER_TRANS_TYPE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_COLOR_SHORT_SLEEVE',
    2: 'IDCS_COLOR_LONG_SLEEVE',
}

export const LOWER_TRANS_TYPE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_COLOR_SHORT_TROUSER',
    2: 'IDCS_COLOR_LONG_TROUSER',
}

export const COLOR_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_RED',
    2: 'IDCS_ORANGE',
    3: 'IDCS_YELLOW',
    4: 'IDCS_GREEN',
    5: 'IDCS_BLUE',
    6: 'IDCS_CYAN',
    7: 'IDCS_PURPLE',
    8: 'IDCS_BLACK',
    9: 'IDCS_WHITE',
    10: 'IDCS_SILVER',
    11: 'IDCS_GRAY',
    12: 'IDCS_GOLD',
    13: 'IDCS_BROWN',
}

export const SKIRT_TYPE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_YES',
    2: 'IDCS_NO',
}

export const CAR_TYPE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_SEDAN',
    2: 'IDCS_SUV',
    3: 'IDCS_MPV',
    4: 'IDCS_SPORTS_CAR',
    5: 'IDCS_VAN',
    6: 'IDCS_BIG_BUS',
    7: 'IDCS_SCHOOL_BUS',
    8: 'IDCS_BUS',
    9: 'IDCS_LIGHT_BUS',
    10: 'IDCS_PICKUP',
    11: 'IDCS_TRUCK',
    12: 'IDCS_SPECIAL_VEHICLE',
}

export const NON_MOTOR_MAP: Record<number, string> = {
    0: '--', // 未知
    1: 'IDCS_BICYCLE',
    2: 'IDCS_BATTERY_CAR',
    3: 'IDCS_DETECTION_MOTORCYCLE',
    // 3: 'IDCS_NON_VEHICLE',
    4: 'IDCS_TRICYCLE',
}

export const CAR_BRAND_MAP: Record<number | string, string> = {
    0: 'IDCS_UNCONTRAST', // 未知
    3: 'IDCS_CAR_BRAND_ACURA',
    4: 'IDCS_CAR_BRAND_ALFAROMEO',
    5: 'IDCS_CAR_BRAND_ASTONMARTIN',
    6: 'IDCS_CAR_BRAND_AUDI',
    10: 'IDCS_CAR_BRAND_BMW',
    11: 'IDCS_CAR_BRAND_BRABUS',
    15: 'IDCS_CAR_BRAND_BENTLEY',
    16: 'IDCS_CAR_BRAND_BENZ',
    18: 'IDCS_CAR_BRAND_BUGATTI',
    19: 'IDCS_CAR_BRAND_BUICK',
    21: 'IDCS_CAR_BRAND_COWIN',
    22: 'IDCS_CAR_BRAND_CADILLAC',
    24: 'IDCS_CAR_BRAND_CHEVROLET',
    25: 'IDCS_CAR_BRAND_CHRYSLER',
    26: 'IDCS_CAR_BRAND_CITROEN',
    27: 'IDCS_CAR_BRAND_DENZA',
    30: 'IDCS_CAR_BRAND_DS',
    31: 'IDCS_CAR_BRAND_DACIA',
    32: 'IDCS_CAR_BRAND_DODGE',
    36: 'IDCS_CAR_BRAND_FIAT',
    40: 'IDCS_CAR_BRAND_FERRARI',
    41: 'IDCS_CAR_BRAND_FODAY',
    42: 'IDCS_CAR_BRAND_FORD',
    43: 'IDCS_CAR_BRAND_GMC',
    45: 'IDCS_CAR_BRAND_GENESIS',
    53: 'IDCS_CAR_BRAND_HONDA',
    55: 'IDCS_CAR_BRAND_HYUNDAI',
    56: 'IDCS_CAR_BRAND_INFINITI',
    60: 'IDCS_CAR_BRAND_JAGUAR',
    61: 'IDCS_CAR_BRAND_JEEP',
    63: 'IDCS_CAR_BRAND_JETTA',
    66: 'IDCS_CAR_BRAND_KIA',
    68: 'IDCS_CAR_BRAND_LANCIA',
    71: 'IDCS_CAR_BRAND_LAMBORGHINI',
    72: 'IDCS_CAR_BRAND_LANDROVER',
    75: 'IDCS_CAR_BRAND_LEXUS',
    76: 'IDCS_CAR_BRAND_LINCOLN',
    79: 'IDCS_CAR_BRAND_LOTUS',
    82: 'IDCS_CAR_BRAND_MG',
    83: 'IDCS_CAR_BRAND_MINI',
    84: 'IDCS_CAR_BRAND_MASERATI',
    85: 'IDCS_CAR_BRAND_MAZDA',
    86: 'IDCS_CAR_BRAND_MCLAREN',
    87: 'IDCS_CAR_BRAND_MITSUBISHI',
    91: 'IDCS_CAR_BRAND_NISSAN',
    94: 'IDCS_CAR_BRAND_OPEL',
    95: 'IDCS_CAR_BRAND_PAGANI',
    96: 'IDCS_CAR_BRAND_PEUGEOT',
    97: 'IDCS_CAR_BRAND_PORSCHE',
    100: 'IDCS_CAR_BRAND_RENAULT',
    102: 'IDCS_CAR_BRAND_ROLLSROYCE',
    104: 'IDCS_CAR_BRAND_SKODA',
    105: 'IDCS_CAR_BRAND_SUZUKI',
    106: 'IDCS_CAR_BRAND_SWM',
    107: 'IDCS_CAR_BRAND_SEAT',
    108: 'IDCS_CAR_BRAND_SMART',
    110: 'IDCS_CAR_BRAND_SSANGYONG',
    111: 'IDCS_CAR_BRAND_SUBARU',
    112: 'IDCS_CAR_BRAND_TOYOTA',
    114: 'IDCS_CAR_BRAND_TESLA',
    117: 'IDCS_CAR_BRAND_VOLKSWAGEN',
    118: 'IDCS_CAR_BRAND_VOLVO',
    other: 'IDCS_MAINTENSIGN_ITEM_OTHERSYS',
}

export type SnapMapping = {
    type: string
    name: string
    map: Record<number, string>
    pre?: SnapMapping
}

export const DEFAULT_BODY_STRUCT_MAPPING: SnapMapping[] = [
    {
        type: 'gender',
        name: 'IDCS_SEX',
        map: GENDER_MAP,
    },
    {
        type: 'age',
        name: 'IDCS_AGE',
        map: AGE_MAP,
    },
    {
        type: 'mask',
        name: 'IDCS_MASK',
        map: MASK_MAP,
    },
    {
        type: 'hat',
        name: 'IDCS_HAT',
        map: HAT_MAP,
    },
    {
        type: 'galsses',
        name: 'IDCS_GLASSES',
        map: GLASS_MAP,
    },
    {
        type: 'backpack',
        name: 'IDCS_BACKPACK',
        map: BACKPACK_TYPE_MAP,
    },
    {
        type: 'upper_length',
        name: 'IDCS_UPPER_CLOTH',
        map: UPPER_TRANS_TYPE_MAP,
        pre: {
            type: 'upper_color',
            name: 'IDCS_COLOR',
            map: COLOR_MAP,
        },
    },
    {
        type: 'lower_length',
        name: 'IDCS_LOWER_CLOTH',
        map: LOWER_TRANS_TYPE_MAP,
        pre: {
            type: 'lower_color',
            name: 'IDCS_COLOR',
            map: COLOR_MAP,
        },
    },
    // {
    //     type: 'shoulderbag',
    //     name: "IDCS_SHOULDERBAG",
    //     map: BACKPACK_SHOULDERBAG_MAP
    // },
    {
        type: 'skirt',
        name: 'IDCS_SKIRT',
        map: SKIRT_TYPE_MAP,
    },
    {
        type: 'orient',
        name: 'IDCS_DIRECTION',
        map: ORIENT_MAP,
    },
]

export const DEFAULT_VEHICLE_STRUCT_MAPPING: SnapMapping[] = [
    {
        type: 'color',
        name: 'IDCS_COLOR',
        map: COLOR_MAP,
    },
    {
        type: 'type',
        name: 'IDCS_TYPE',
        map: CAR_TYPE_MAP,
    },
    {
        type: 'brand',
        name: 'IDCS_BRAND',
        map: CAR_BRAND_MAP,
    },
    // {
    //     type: 'year',
    //     name: ("IDCS_CAR_YEAR")
    // },
    // {
    //     type: 'model',
    //     name: ("IDCS_MODEL")
    // }
]

export const DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING: SnapMapping[] = [
    {
        type: 'plate',
        name: 'IDCS_LICENSE_PLATE_NUM',
        map: {},
    },
    {
        type: 'owner',
        name: 'IDCS_VEHICLE_OWNER',
        map: {},
    },
    {
        type: 'mobile_phone_number',
        name: 'IDCS_PHONE_NUMBER',
        map: {},
    },
]

export const DEFAULT_NON_VEHICLE_STRUCT_MAPPING: SnapMapping[] = [
    {
        type: 'bike_type',
        name: 'IDCS_TYPE',
        map: NON_MOTOR_MAP,
    },
]
