/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 20:03:07
 * @Description: 抓拍相关常量
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
    1: 'IDCS_HAT',
    2: 'IDCS_NO_HAT',
}

export const GLASS_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_GLASSES',
    2: 'IDCS_NO_GLASSES',
}

export const MASK_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_MASK',
    2: 'IDCS_NO_MASK',
}

export const BACKPACK_TYPE_MAP: Record<number, string> = {
    0: '--',
    1: 'IDCS_BACKPACK',
    2: 'IDCS_NO_BACKPACK',
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
    0: 'IDCS_UNCONTRAST',
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
    1: 'IDCS_SKIRT',
    2: 'IDCS_NO_WEAR_SKIRT',
}

export const CAR_TYPE_MAP: Record<number, string> = {
    0: 'IDCS_UNCONTRAST',
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

export const PLATE_COLOR_MAP: Record<number, string> = {
    0: 'IDCS_UNCONTRAST', // 未知
    1: 'IDCS_BLUE',
    2: 'IDCS_YELLOW',
    3: 'IDCS_WHITE',
    4: 'IDCS_BLACK',
    5: 'IDCS_GREEN',
    6: 'IDCS_COLOR_GREEN_BLACK',
    7: 'IDCS_RED',
    8: 'IDCS_ORANGE',
    9: 'IDCS_CYAN',
    10: 'IDCS_PURPLE',
    11: 'IDCS_GREY',
}

export const PLATE_COLOR_SELECT_MAP: Record<string, string> = {
    red: 'IDCS_RED',
    orange: 'IDCS_ORANGE',
    yellow: 'IDCS_YELLOW',
    green: 'IDCS_GREEN',
    blue: 'IDCS_BLUE',
    cyan: 'IDCS_CYAN',
    purple: 'IDCS_PURPLE',
    black: 'IDCS_BLACK',
    white: 'IDCS_WHITE',
    silver: 'IDCS_SILVER',
    gray: 'IDCS_GRAY',
    gold: 'IDCS_GOLD',
    brown: 'IDCS_BROWN',
    greenbalck: 'IDCS_COLOR_GREEN_BLACK',
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
        type: 'brand',
        name: 'IDCS_BRAND',
        map: CAR_BRAND_MAP,
    },
    {
        type: 'type',
        name: 'IDCS_TYPE',
        map: CAR_TYPE_MAP,
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

export const DEFAULT_PLATE_VEHICLE_STRUCT_MAPPING: SnapMapping[] = [
    {
        type: 'color',
        name: 'IDCS_COLOR',
        map: COLOR_MAP,
    },
    {
        type: 'brand_type',
        name: 'IDCS_BRAND',
        map: CAR_BRAND_MAP,
    },
    {
        type: 'type',
        name: 'IDCS_TYPE',
        map: CAR_TYPE_MAP,
    },
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
    {
        type: 'group_name',
        name: 'IDCS_ADD_FACE_GROUP',
        map: {},
    },
    {
        type: 'platecolor',
        name: 'IDCS_PLATE_COLOR',
        map: PLATE_COLOR_MAP,
    },
]

export const DEFAULT_NON_VEHICLE_STRUCT_MAPPING: SnapMapping[] = [
    {
        type: 'bike_type',
        name: 'IDCS_TYPE',
        map: NON_MOTOR_MAP,
    },
]

export const VALUE_NAME_MAPPING: Record<string, string> = {
    // 性别
    gender: 'IDCS_SEX',
    male: 'IDCS_MALE',
    female: 'IDCS_FEMALE',
    // 年龄
    ageBracket: 'IDCS_AGE',
    child: 'IDCS_CHILD',
    adult: 'IDCS_ADULT',
    infant: 'IDCS_INFANT',
    juvenile: 'IDCS_JUVENILE',
    youth: 'IDCS_YOUTH',
    midlife: 'IDCS_MIDLIFE',
    elderly: 'IDCS_ELDERLY',
    // 上衣
    upperClothType: 'IDCS_UPPER_BODY_CLOTH_TYPE',
    upperClothColor: 'IDCS_UPPERCOLOR',
    longSleeve: 'IDCS_LONG_CLOTH',
    shortSleeve: 'IDCS_SHORT_CLOTH',
    // 配饰
    mask: 'IDCS_MASK',
    nonMask: 'IDCS_NO_MASK',
    hat: 'IDCS_HAT',
    nonHat: 'IDCS_NO_HAT',
    glasses: 'IDCS_GLASSES',
    glass: 'IDCS_GLASSES',
    nonGlass: 'IDCS_NO_GLASSES',
    backpack: 'IDCS_BACKPACK',
    nonBackpack: 'IDCS_NO_BACKPACK',
    skirt: 'IDCS_SKIRT',
    nonSkirt: 'IDCS_NO_WEAR_SKIRT',
    front: 'IDCS_FRONT_FACE',
    back: 'IDCS_BACK_FACE',
    side: 'IDCS_SIDE_FACE',
    // 汽车颜色
    vehicleColor: 'IDCS_COLOR',
    red: 'IDCS_RED', // 红
    orange: 'IDCS_ORANGE', // 橙
    yellow: 'IDCS_YELLOW', // 黄
    green: 'IDCS_GREEN', // 绿
    blue: 'IDCS_BLUE', // 蓝
    cyan: 'IDCS_CYAN', // 青
    purple: 'IDCS_PURPLE', // 紫
    black: 'IDCS_BLACK', // 黑
    white: 'IDCS_WHITE', // 白
    silver: 'IDCS_SILVER', // 银
    gray: 'IDCS_GRAY', // 灰
    gold: 'IDCS_GOLD', // 金
    brown: 'IDCS_BROWN', // 棕
    // 汽车类型
    vehicleType: 'IDCS_TYPE',
    bus: 'IDCS_BUS',
    lightBus: 'IDCS_LIGHT_BUS',
    mpv: 'IDCS_MPV',
    pickUp: 'IDCS_PICKUP',
    publicBus: 'IDCS_BIG_BUS',
    schoolBus: 'IDCS_SCHOOL_BUS',
    sedan: 'IDCS_SEDAN',
    specialVehicle: 'IDCS_SPECIAL_VEHICLE',
    sportsCar: 'IDCS_SPORTS_CAR',
    suv: 'IDCS_SUV',
    truck: 'IDCS_TRUCK',
    van: 'IDCS_VAN',
    // 汽车品牌
    vehicleBrand: 'IDCS_BRAND',
    all: 'IDCS_FULL', // 全部
    other: 'IDCS_MAINTENSIGN_ITEM_OTHERSYS', // 其他
    acura: 'IDCS_CAR_BRAND_ACURA', // 讴歌
    alfaromeo: 'IDCS_CAR_BRAND_ALFAROMEO', // 阿尔法•罗密欧
    astonmartin: 'IDCS_CAR_BRAND_ASTONMARTIN', // 阿斯顿•马丁
    audi: 'IDCS_CAR_BRAND_AUDI', // 奥迪
    bmw: 'IDCS_CAR_BRAND_BMW', // 宝马
    brabus: 'IDCS_CAR_BRAND_BRABUS', // 巴博斯
    bentley: 'IDCS_CAR_BRAND_BENTLEY', // 宾利
    benz: 'IDCS_CAR_BRAND_BENZ', // 奔驰
    bugatti: 'IDCS_CAR_BRAND_BUGATTI', // 布加迪
    buick: 'IDCS_CAR_BRAND_BUICK', // 别克
    cowin: 'IDCS_CAR_BRAND_COWIN', // 凯翼
    cadillac: 'IDCS_CAR_BRAND_CADILLAC', // 凯迪拉克
    chevrolet: 'IDCS_CAR_BRAND_CHEVROLET', // 雪佛兰
    chrysler: 'IDCS_CAR_BRAND_CHRYSLER', // 克莱斯勒
    citroen: 'IDCS_CAR_BRAND_CITROEN', // 雪铁龙
    denza: 'IDCS_CAR_BRAND_DENZA', // 腾势
    ds: 'IDCS_CAR_BRAND_DS', // ds
    dacia: 'IDCS_CAR_BRAND_DACIA', // dacia
    dodge: 'IDCS_CAR_BRAND_DODGE', // 道奇
    fiat: 'IDCS_CAR_BRAND_FIAT', // 菲亚特
    ferrari: 'IDCS_CAR_BRAND_FERRARI', // 法拉利
    foday: 'IDCS_CAR_BRAND_FODAY', // 福迪
    ford: 'IDCS_CAR_BRAND_FORD', // 福特
    gmc: 'IDCS_CAR_BRAND_GMC', // gmc
    genesis: 'IDCS_CAR_BRAND_GENESIS', // 捷尼赛思
    honda: 'IDCS_CAR_BRAND_HONDA', // 本田
    hyundai: 'IDCS_CAR_BRAND_HYUNDAI', // 现代
    infiniti: 'IDCS_CAR_BRAND_INFINITI', // 英菲尼迪
    jaguar: 'IDCS_CAR_BRAND_JAGUAR', // 捷豹
    jeep: 'IDCS_CAR_BRAND_JEEP', // jeep
    jetta: 'IDCS_CAR_BRAND_JETTA', // 捷达
    kia: 'IDCS_CAR_BRAND_KIA', // 起亚
    lancia: 'IDCS_CAR_BRAND_LANCIA', // 蓝旗亚
    lamborghini: 'IDCS_CAR_BRAND_LAMBORGHINI', // 兰博基尼
    landrover: 'IDCS_CAR_BRAND_LANDROVER', // 路虎
    lexus: 'IDCS_CAR_BRAND_LEXUS', // 雷克萨斯
    lincoln: 'IDCS_CAR_BRAND_LINCOLN', // 林肯
    lotus: 'IDCS_CAR_BRAND_LOTUS', // 路特斯
    mg: 'IDCS_CAR_BRAND_MG', // mg名爵
    mini: 'IDCS_CAR_BRAND_MINI', // mini
    maserati: 'IDCS_CAR_BRAND_MASERATI', // 玛莎拉蒂
    mazda: 'IDCS_CAR_BRAND_MAZDA', // 马自达
    mclaren: 'IDCS_CAR_BRAND_MCLAREN', // 迈凯伦
    mitsubishi: 'IDCS_CAR_BRAND_MITSUBISHI', // 三菱
    nissan: 'IDCS_CAR_BRAND_NISSAN', // 日产
    opel: 'IDCS_CAR_BRAND_OPEL', // 欧宝
    pagani: 'IDCS_CAR_BRAND_PAGANI', // 帕加尼
    peugeot: 'IDCS_CAR_BRAND_PEUGEOT', // 标致
    porsche: 'IDCS_CAR_BRAND_PORSCHE', // 保时捷
    renault: 'IDCS_CAR_BRAND_RENAULT', // 雷诺
    rollsroyce: 'IDCS_CAR_BRAND_ROLLSROYCE', // 劳斯莱斯
    skoda: 'IDCS_CAR_BRAND_SKODA', // 斯柯达
    suzuki: 'IDCS_CAR_BRAND_SUZUKI', // 铃木
    swm: 'IDCS_CAR_BRAND_SWM', // swm斯威
    seat: 'IDCS_CAR_BRAND_SEAT', // 西雅特
    smart: 'IDCS_CAR_BRAND_SMART', // smart
    ssangyong: 'IDCS_CAR_BRAND_SSANGYONG', // 双龙
    subaru: 'IDCS_CAR_BRAND_SUBARU', // 斯巴鲁
    toyota: 'IDCS_CAR_BRAND_TOYOTA', // 丰田
    tesla: 'IDCS_CAR_BRAND_TESLA', // 特斯拉
    volkswagen: 'IDCS_CAR_BRAND_VOLKSWAGEN', // 大众
    volvo: 'IDCS_CAR_BRAND_VOLVO', // 沃尔沃
    // other: 'IDCS_MAINTENSIGN_ITEM_OTHERSYS', // 其他
    // 摩托车类型
    nonMotorizedVehicleType: 'IDCS_TYPE',
    batteryCar: 'IDCS_BATTERY_CAR',
    bicycle: 'IDCS_BICYCLE',
    motor: 'IDCS_DETECTION_MOTORCYCLE',
    tricycle: 'IDCS_TRICYCLE',
    // 车牌颜色
    plateColor: 'IDCS_PLATE_COLOR',
    greenbalck: 'IDCS_COLOR_GREEN_BLACK',
}

const colorSort = ['red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple', 'black', 'white', 'silver', 'gray', 'gold', 'brown']

export const ATTR_SORT_MAP: Record<string, string[]> = {
    gender: ['male', 'female'],
    ageBracket: ['child', 'adult'],
    upperClothType: ['longSleeve', 'shortSleeve'],
    upperClothColor: colorSort,
    vehicleColor: colorSort,
    vehicleBrand: [
        'all',
        'acura',
        'alfaromeo',
        'astonmartin',
        'audi',
        'bmw',
        'brabus',
        'bentley',
        'benz',
        'bugatti',
        'buick',
        'cowin',
        'cadillac',
        'chevrolet',
        'chrysler',
        'citroen',
        'denza',
        'ds',
        'dacia',
        'dodge',
        'fiat',
        'ferrari',
        'foday',
        'ford',
        'gmc',
        'genesis',
        'honda',
        'hyundai',
        'infiniti',
        'jaguar',
        'jeep',
        'jetta',
        'kia',
        'lancia',
        'lamborghini',
        'landrover',
        'lexus',
        'lincoln',
        'lotus',
        'mg',
        'mini',
        'maserati',
        'mazda',
        'mclaren',
        'mitsubishi',
        'nissan',
        'opel',
        'pagani',
        'peugeot',
        'porsche',
        'renault',
        'rollsroyce',
        'skoda',
        'suzuki',
        'swm',
        'seat',
        'smart',
        'ssangyong',
        'subaru',
        'toyota',
        'tesla',
        'volkswagen',
        'volvo',
        'other',
    ],
    vehicleType: ['sedan', 'suv', 'mpv', 'sportsCar', 'van', 'publicBus', 'schoolBus', 'bus', 'lightBus', 'pickUp', 'truck', 'specialVehicle'],
    nonMotorizedVehicleType: ['bicycle', 'batteryCar', 'motor', 'tricycle'],
    plateColor: ['blue', 'yellow', 'white', 'black', 'green', 'greenbalck', 'red', 'orange', 'cyan', 'purple', 'gray'],
}
