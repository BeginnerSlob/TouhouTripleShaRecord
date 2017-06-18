import * as data from './data';
import * as Promise from 'promise';

export function appendColumns(a: string[][], b: string[][]){
    let c: string[][] = [];
    for(let i = 0; i < a.length; i ++){
        c.push(a[i].concat(b[i]));
    }
    return c;
}

export function getStatistics(rows: string[][]){

    return new Promise<string[][]>(resolve => {
        Promise.all([data.getLevelCalculator(),
                    data.getWenCalculator(),
                    data.getWuCalculator()])
            .then(res => {
                let extraRows: string[][] = [];
                let [calcLevel, calcWen, calcWu] = res;

                for(let i = 0; i < rows.length; i ++){
                    let exp = parseInt(rows[i][9]);
                    let wen = parseInt(rows[i][10]);
                    let wu  = parseInt(rows[i][11]);

                    extraRows.push([calcLevel(exp) + '',
                                   calcWen(wen) + '',
                                   calcWu(wu) + '']);
                }

                resolve(extraRows);
            });
    })
}
