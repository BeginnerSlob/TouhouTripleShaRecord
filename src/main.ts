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
    '等级', '文官职', '武官职'
    ];
let playersHead = document.querySelector('#table-head') as HTMLTableHeaderCellElement;
let playersHeaderIgnore = table.header(playersHead, playersHeader);

data.getPlayers().then(res =>{
    let body = document.querySelector('#table-body') as HTMLTableDataCellElement;
    let button = {
        name: '查看战绩', callback: row => {
            console.log(row);
            fillPlayerTables(row[0]);
        }
    };
    table.body(body, res, playersHeaderIgnore, button);
    stats.getStatistics(res).then(extra => {
        res = stats.appendColumns(res, extra);
        table.body(body, res, playersHeaderIgnore, button);
    });

    let search = document.querySelector('#search-bar') as HTMLInputElement;
    search.addEventListener('change', e => {
        let term = search.value.toLocaleLowerCase();
        let result = [];
        for(let i = 1; i < res.length; i ++){
            for(let j = 0; j < res[i].length; j ++){
                let d = res[i][j] + '';
                if(d.toLocaleLowerCase().indexOf(term) >= 0){
                    console.log(`${d} - ${search.value}`)
                    result.push(res[i]);
                    break;
                }
            }
        }
        
        table.body(body, result, playersHeaderIgnore, button);
        stats.getStatistics(result).then(extra => {
            result = stats.appendColumns(result, extra);
            table.body(body, result, playersHeaderIgnore, button);
        });
    });
});

let recordHeader = ['游戏时间','武将','模式','身份','回合数','存活','结果','经验值','文功','武功','完成成就'];
let recordHead = document.querySelector('#player-table-head') as HTMLTableHeaderCellElement;
let recordIgnores = table.header(recordHead, recordHeader);

function fillPlayerTables(id: string){// {{{
    data.getCSV(`${URL_BASE}/${id}_achievement.csv`).then(res => {
        let achievements = document.querySelector('#achievements') as HTMLElement;
        table.achievements(achievements, res);
    });

    data.getCSV(`${URL_BASE}/${id}_record.csv`).then(res => {
        let body = document.querySelector('#player-table-body') as HTMLTableDataCellElement;
        table.body(body, res, recordIgnores);
    });
}// }}}
