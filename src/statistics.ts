import * as data from './data';
import * as Promise from 'promise';

export function appendColumn(a: string[], b: string[]){
    return a.concat(b);
}

function ratio(x, y){
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
                    let exp = parseInt(row[9]);
                    let wen = parseInt(row[10]);
                    let wu  = parseInt(row[11]);

                    let offline = parseInt(row[7]);
                    let total = parseInt(row[8]);

                    let zhuwins = parseInt(row[3]);
                    let zhongwins = parseInt(row[4]);
                    let fanwins = parseInt(row[5]);
                    let neiwins = parseInt(row[6]);

                    const usage: {[key: string]: number} = {};
                    let max = '';
                    for(const item of records){
                        const char = item[1];
                        usage[char] = (usage[char] || 0) + 1;
                        if(usage[char] > (usage[max] || 0)) max = char;
                    }
                    console.log(usage, max);

                    return [calcLevel(exp) + '',
                            calcWen(wen) + '',
                            calcWu(wu) + '',
                            ratio(offline, total),
                            ratio(zhuwins + zhongwins + neiwins + fanwins, total),
                            max
                           ];
                }

                resolve(getStatsFor(row));
            });
    })
}
