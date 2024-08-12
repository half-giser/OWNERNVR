const { Translate } = useLangStore()

export const tableRowStatus = {
    loading: 'loading',
    saveSuccess: 'saveSuccess',
    saveFailed: 'saveFailed',
}

export const tableRowStatusToolTip = {
    '': '',
    loading: Translate('IDCS_DEVC_REQUESTING_DATA'),
    saveSuccess: Translate('IDCS_SAVE_DATA_SUCCESS'),
    saveFailed: Translate('IDCS_SAVE_DATA_FAIL'),
} as Record<string, string>

export const dateFormatTip: Record<string, string> = {
    'yyyy-MM-dd': Translate('IDCS_DATE_FORMAT_YMD'),
    'MM-dd-yyyy': Translate('IDCS_DATE_FORMAT_MDY'),
    'dd-MM-yyyy': Translate('IDCS_DATE_FORMAT_DMY'),
    'yyyy/MM/dd': Translate('IDCS_DATE_FORMAT_YMD'),
    'MM/dd/yyyy': Translate('IDCS_DATE_FORMAT_MDY'),
    'dd/MM/yyyy': Translate('IDCS_DATE_FORMAT_DMY'),
    'year-month-day': Translate('IDCS_DATE_FORMAT_YMD'),
    'month-day-year': Translate('IDCS_DATE_FORMAT_MDY'),
    'day-month-year': Translate('IDCS_DATE_FORMAT_DMY'),
}

export const dateFormatOptions: Record<string, string>[] = [
    { value: 'year-month-day', text: Translate('IDCS_DATE_FORMAT_YMD') },
    { value: 'month-day-year', text: Translate('IDCS_DATE_FORMAT_MDY') },
    { value: 'day-month-year', text: Translate('IDCS_DATE_FORMAT_DMY') },
]

export const timeFormatTip: Record<string, string> = {
    '24': Translate('IDCS_TIME_FORMAT_24'),
    '12': Translate('IDCS_TIME_FORMAT_12'),
}
