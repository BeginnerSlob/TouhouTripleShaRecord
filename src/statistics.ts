import * as data from './data';
import * as Promise from 'promise';

export function appendColumn(a: string[], b: string[]){
    return a.concat(b);
}

function ratio(x, y){
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

                    let offline = 0;
                    let total = 0;

                    let zhuwins = 0;
                    let zhongwins = 0;
                    let fanwins = 0;
                    let neiwins = 0;

                    let zhus = 0;
                    let zhongs = 0;
                    let fans = 0;
                    let neis = 0;

                    const usage: {[key: string]: number} = {};
                    let max = 0;
                    let max_names = '';
                    for(const item of records){
                        const char = item[1];
                        total = total + 1;
                        if(item[3] == '君主'){
                            zhus = zhus + 1;
                        }
                        else if(item[3] == '司祝'){
                            zhongs = zhongs + 1;
                        }
                        else if(item[3] == '异端'){
                            fans = fans + 1;
                        }
                        else if(item[3] == '黑幕'){
                            neis = neis + 1;
                        }
                        if(item[6] == '逃跑') {
                            offline = offline + 1;
                        }
                        else if(item[6] = '胜利'){
                            if(item[3] == '君主'){
                                zhuwins = zhuwins + 1;
                            }
                            else if(item[3] == '司祝'){
                                zhongwins = zhongwins + 1;
                            }
                            else if(item[3] == '异端'){
                                fanwins = fanwins + 1;
                            }
                            else if(item[3] == '黑幕'){
                                neiwins = neiwins + 1;
                            }
                        }
                        usage[char] = (usage[char] || 0) + 1;
                        if(usage[char] < 3){
                            continue;
                        }
                        if(usage[char] > max){
                            max = usage[char];
                            max_names = char;
                        }
                        else if(usage[char] == max) {
                            max_names = max_names + '，' + char;
                        }
                    }
                    console.log(usage, max);

                    return [calcLevel(exp) + '',
                            calcWen(wen) + '',
                            calcWu(wu) + '',
                            total, ratio(zhuwins + zhongwins + neiwins + fanwins, total),
                            ratio(offline, total),
                            zhus, ratio(zhuwins, zhus),
                            zhongs, ratio(zhongwins, zhongs),
                            fans, ratio(fanwins, fans),
                            neis, ratio(neiwins, neis),
                            max_names
                           ];
                }

                resolve(getStatsFor(row));
            });
    })
}
