import * as data from './data';
import * as Promise from 'promise';

export function appendColumn(a: string[], b: string[]){
    return a.concat(b);
}

function ratio(x: number, y: number){
    if (y == 0)
        return '0.00%';
    return Math.round(x / y * 10000) / 100 + '%';
}

export function getStatistics(row: string[], achievements: string[][], records: string[][]){

    return new Promise<string[]>(resolve => {
        Promise.all([data.getLevelCalculator(),
                    data.getWenCalculator(),
                    data.getWuCalculator()])
            .then(res => {
                let [calcLevel, calcWen, calcWu] = res;

                function getStatsFor(row: string[]){
                    let exp = parseInt(row[3]);
                    let wen = parseInt(row[4]);
                    let wu  = parseInt(row[5]);

                    const win: {[key: string]: number} = {};
                    const total: {[key: string]: number} = {};
                    win.君主 = win.司祝 = win.异端 = win.黑幕 = 0;
                    total.君主 = total.司祝 = total.异端 = total.黑幕 = 0;

                    let allwin = 0;
                    let alltotal = 0;
                    let offline = 0;

                    let max_names = '无';
                    let max = 0;

                    for(const item of records){
                        const char = item[1];
                        total[char] = (total[char] || 0) + 1;

                        if (total[char] >= 3) {
                            if (total[char] > max) {
                                max = total[char];
                                max_names = char;
                            } else if (total[char] === max) {
                                max_names += '，' + char;
                            }
                        }

                        const role = item[3];
                        const result = item[6];

                        alltotal += 1;
                        total[role] += 1;
                        if (result === '胜利') {
                            allwin += 1;
                            win[role] += 1;
                        } else if (result === '逃跑') {
                            offline += 1;
                        }
                    }

                    return [calcLevel(exp) + '',
                            calcWen(wen) + '',
                            calcWu(wu) + '',
                            alltotal + '', ratio(win.黑幕 + win.司祝 + win.异端 + win.君主, alltotal),
                            ratio(offline, alltotal),
                            total.君主 + '', ratio(win.君主, total.君主),
                            total.司祝 + '', ratio(win.司祝, total.司祝),
                            total.异端 + '', ratio(win.异端, total.异端),
                            total.黑幕 + '', ratio(win.黑幕, total.黑幕),
                            max_names
                           ];
                }

                resolve(getStatsFor(row));
            });
    })
}
