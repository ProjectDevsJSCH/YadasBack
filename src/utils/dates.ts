import * as moment from 'moment';

export function dateToMoment(date, format = 'YYYY-MM-DD') {
    return moment(date, format);
}
