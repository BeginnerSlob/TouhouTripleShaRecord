// vim: set foldmethod=marker: 
import * as Promise from 'promise';
import * as CSV from 'csv-js';

const URL_ACCOUNTS = 'https://raw.githubusercontent.com/BeginnerSlob/TouhouTripleShaRecord/master/data/accounts.csv';
const URL_ZHANGONG = 'https://raw.githubusercontent.com/BeginnerSlob/TouhouTripleShaRecord/master/data/zhangong.csv';
const URL_BASE     = 'https://raw.githubusercontent.com/BeginnerSlob/TouhouTripleShaRecord/master/data';

function getCSV(url = URL_ACCOUNTS): Promise{// {{{
    let xhttp = new XMLHttpRequest();

    let promise = new Promise( (resolve, reject) => {
        xhttp.onreadystatechange = () =>{
            if(xhttp.readyState == 4){
                if(xhttp.status == 200){
                    resolve( CSV.parse(xhttp.responseText));
                }else{
                    reject('');
                }
            }
        };
    });

    xhttp.open('GET', url, true);
    xhttp.send();

    return promise;
}// }}}

function fillTable(body, data: {rows: string[][], ignore?: {[key: number]: boolean}, button: boolean}){// {{{
    let {rows, ignore, button} = data;
    body.innerHTML = '';

    for(let i = 0; i < rows.length; i ++){
        let tr = document.createElement('tr');
        body.appendChild(tr);

        for(let j = 0; j < rows[i].length; j ++){
            if(ignore && ignore[j])continue;
            let td = document.createElement('td');
            td.innerText = rows[i][j];
            td.classList.add('mdl-data-table__cell--non-numeric');
            tr.appendChild(td);
        }

        if(!button)continue;
        let p = rows[i][0];
        let td = document.createElement('td');
        let btn = document.createElement('button');
        btn.classList.add('mdl-button');
        btn.classList.add('mdl-js-button');
        btn.innerText = '查看战绩';
        btn.addEventListener('click', e => fillZhangongTable(p));
        td.appendChild(btn);
        tr.appendChild(td);
    }
}// }}}

function fillZhangongTable(id){// {{{
    getCSV(`${URL_BASE}/${id}_achievement.csv`).then(res => {

        let head = document.querySelector('#achievement-table-head');
        head.innerHTML = '';

        let ignore: any = {};
        for(let i = 0; i < res[0].length; i ++){
            let th = document.createElement('th');
            if(res[0][i][0] == '~'){
                ignore[i] = true;
                continue;
            }
            th.innerText = res[0][i];
            th.classList.add('mdl-data-table__cell--non-numeric');
            head.appendChild(th);
        }

        let body = document.querySelector('#achievement-table-body');
        body.innerHTML = '';
        fillTable(body, {rows: res.slice(1), ignore, button: false});
    });

    getCSV(`${URL_BASE}/${id}_record.csv`).then(res => {

        let head = document.querySelector('#player-table-head');
        head.innerHTML = '';

        let ignore: any = {};
        for(let i = 0; i < res[0].length; i ++){
            let th = document.createElement('th');
            if(res[0][i][0] == '~'){
                ignore[i] = true;
                continue;
            }
            th.innerText = res[0][i];
            th.classList.add('mdl-data-table__cell--non-numeric');
            head.appendChild(th);
        }

        let body = document.querySelector('#player-table-body');
        body.innerHTML = '';
        fillTable(body, {rows: res.slice(1), ignore, button: false});
    });
}// }}}

let data: any[] = null;
getCSV().then(res =>{
    console.log(res);
    data = res;

    let head = document.querySelector('#table-head');
    head.innerHTML = '';

    let ignore: any = {};
    for(let i = 0; i < res[0].length; i ++){
        if(res[0][i][0] == '~'){
            ignore[i] = true;
            continue;
        }
        let th = document.createElement('th');
        th.innerText = res[0][i];
        th.classList.add('mdl-data-table__cell--non-numeric');
        head.appendChild(th);
    }
    let th = document.createElement('th');
    th.innerText = '战绩';
    th.classList.add('mdl-data-table__cell--non-numeric');
    head.appendChild(th);

    let body = document.querySelector('#table-body');
    let result = res.slice(1);
    fillTable(body, {rows: result, ignore, button: true});
});

let search = document.querySelector('#search-bar') as HTMLInputElement;
search.addEventListener('change', e => {
    let term = search.value.toLocaleLowerCase();
    let res = [];
    for(let i = 1; i < data.length; i ++){
        for(let j = 0; j < data[i].length; j ++){
            let d = data[i][j] + '';
            if(d.toLocaleLowerCase().indexOf(term) >= 0){
                console.log(`${d} - ${search.value}`)
                res.push(data[i]);
                break;
            }
        }
    }

    let body = document.querySelector('#table-body');
    fillTable(body, {rows: res, ignore: {2: true}, button: true});
});

interface ZhangongItem{
    id: string;
    img: string;
    title: string;
    desc: string;
    completions: number;
    firstCompletion?: string;
    requiredProgress: number;
}

function el(tag: string, traits?: {[key: string]: string}){
    let element = document.createElement(tag);
    if(traits)
        for(let key in traits)
            element.setAttribute(key, traits[key]);
    return element;
}

function makeZhangongIcon(item: ZhangongItem){
    if(!item.firstCompletion)item.firstCompletion = '';
    let temp = document.querySelector('template#template-achievement').innerHTML;
    for(let key in item){
        let text = item[key];
        if(key == 'firstCompletion' && text)text = '完成于：' + text;
        temp = temp.replace(new RegExp(`{{${key}}}`, 'g'), text);
    }
    let div = el('div' );
    div.innerHTML = temp;
    
    console.log(div);
    let progress = div.querySelector(`#${item.id}-progress`);
    if(item.requiredProgress == 1){
        progress.parentElement.removeChild(progress);
        if(item.completions > 0){
            div.classList.add('mdl-badge');
            div.dataset['badge'] = item.completions == 1 ? '✓' : item.completions + '';
        }
    }else{
        if(item.completions >= item.requiredProgress){
            div.classList.add('mdl-badge');
            div.dataset['badge'] = '✓';
        }
        progress.addEventListener('mdl-componentupgraded', e => {
            (progress as any).MaterialProgress.setProgress(Math.min(1, item.completions / item.requiredProgress) * 100);
        });
    }

    return div;
}

let achievements = document.querySelector('#achievements');

interface Achievement{
    id: string;
    img: string;
    title: string;
    desc: string;
    requiredProgress: string;
}
achievements.appendChild(makeZhangongIcon({
    id: 'weisuoyuwei',
    img:'sha.png',
    title: '为所欲为',
    desc: '日天10次(8/10)',
    completions: 8,
    firstCompletion: '2017-10-01',
    requiredProgress: 10,
}));
achievements.appendChild(makeZhangongIcon({
    id: 'sxbk4',
    img:'sha.png',
    title: '为所欲为',
    desc: '日天10次(12/10)',
    completions: 12,
    firstCompletion: '2017-10-01',
    requiredProgress: 10,
}));
achievements.appendChild(makeZhangongIcon({
    id: 'sxbk',
    img:'sha.png',
    title: '丧心病狂',
    desc: '干了某件特别丧的事情',
    completions: 3,
    firstCompletion: '2017-10-01',
    requiredProgress: 1,
}));
achievements.appendChild(makeZhangongIcon({
    id: 'sxbk2',
    img:'sha.png',
    title: '丧心病狂',
    desc: '干了某件特别丧的事情',
    completions: 0,
    requiredProgress: 1,
}));
achievements.appendChild(makeZhangongIcon({
    id: 'sxbk3',
    img:'sha.png',
    title: '丧心病狂',
    desc: '干了某件特别丧的事情',
    completions: 1,
    firstCompletion: '2017-10-01',
    requiredProgress: 1,
}));
