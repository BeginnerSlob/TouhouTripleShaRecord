import * as data from './data';
import * as Promise from 'promise';

export function appendColumns(a: string[][], b: string[][]){
    let c: string[][] = [];
    for(let i = 0; i < a.length; i ++){
        c.push(a[i].concat(b[i]));
    }
    return c;
}

function ratio(x, y){
    return Math.round(x / y * 10000) / 100 + '%';
}

export function getStatistics(rows: string[][]){

    return new Promise<string[][]>(resolve => {
        Promise.all([data.getLevelCalculator(),
                    data.getWenCalculator(),
                    data.getWuCalculator()])
            .then(res => {
                let extraRows: string[][] = [];
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

                    return [calcLevel(exp) + '',
                            calcWen(wen) + '',
                            calcWu(wu) + '',
                            ratio(offline, total),
                            ratio(zhuwins + zhongwins + neiwins + fanwins, total),
                           ];
                }

                for(let i = 0; i < rows.length; i ++){
                    extraRows.push(getStatsFor(rows[i]));
                }

                resolve(extraRows);
            });
    })
}
