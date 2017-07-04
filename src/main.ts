// vim: set foldmethod=marker: 
import * as Promise from 'promise';
import * as data from './data';
import * as table from './table';
import * as stats from './statistics';

export const URL_BASE     = 'https://raw.githubusercontent.com/BeginnerSlob/TouhouTripleShaRecord/master/data';
export const URL_ACCOUNTS = `${URL_BASE}/accounts.csv`;
export const URL_ZHANGONG = `${URL_BASE}/zhangong.csv`;
export const URL_ACHIEVEMENT = `${URL_BASE}/achievement.csv`;
export const URL_WEN = `${URL_BASE}/wen.csv`;
export const URL_WU = `${URL_BASE}/wu.csv`;
export const URL_LEVEL = `${URL_BASE}/level.csv`;

let playersHeader = ['~uid','用户名','~密码',
                     '~主公胜场','~忠臣胜场','~反贼胜场','~内奸胜场',
                     '~离线','~总场数','经验值','文功','武功',
                     '等级', '文官职', '武官职', '逃跑率', '总胜率',
                     '常用武将'
                    ];
let playersHead = document.querySelector('#table-head') as HTMLTableHeaderCellElement;
let playersHeaderIgnore = table.header(playersHead, playersHeader);

data.getPlayers().then(res =>{
    let body = document.querySelector('#table-body') as HTMLTableDataCellElement;

    let search = document.querySelector('#search-bar') as HTMLInputElement;
    search.addEventListener('change', e => {
        let term = search.value.toLocaleLowerCase();
        let result = null;
        for(let i = 0; i < res.length; i ++){
            for(let j = 0; j < res[i].length; j ++){
                let d = res[i][j] + '';
                if(d.toLocaleLowerCase().indexOf(term) >= 0){
                    result = res[i];
                    break;
                }
            }
            if(result) break;
        }

        table.body(body, [result], playersHeaderIgnore);
        fillPlayerTables(result[0]).then(res => {
            stats.getStatistics(result as any, res[0] as any, res[1] as any).then(extra => {
                result = stats.appendColumn(result, extra);
                table.body(body, [result], playersHeaderIgnore);
            });
        });
    });
});

let recordHeader = ['游戏时间','武将','模式','身份','回合数','存活','结果','经验值','文功','武功','完成成就'];
let recordHead = document.querySelector('#player-table-head') as HTMLTableHeaderCellElement;
let recordIgnores = table.header(recordHead, recordHeader);

function fillPlayerTables(id: string){// {{{
    const task1 = data.getCSV(`${URL_BASE}/${id}_achievement.csv`).then(res => {
        let achievements = document.querySelector('#achievements') as HTMLElement;
        table.achievements(achievements, res);
        return Promise.resolve(res);
    });

    const task2 = data.getCSV(`${URL_BASE}/${id}_records.csv`).then(res => {
        let body = document.querySelector('#player-table-body') as HTMLTableDataCellElement;
        table.body(body, res, recordIgnores);
        return Promise.resolve(res);
    });

    return Promise.all([task1, task2]);
}// }}}
