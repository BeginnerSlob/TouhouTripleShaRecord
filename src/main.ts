// vim: set foldmethod=marker: 
import * as Promise from 'promise';
import * as CSV from 'csv-js';

const URL_ACCOUNTS = 'https://raw.githubusercontent.com/BeginnerSlob/TouhouTripleShaRecord/master/data/accounts.csv';
const URL_ZHANGONG = 'https://raw.githubusercontent.com/BeginnerSlob/TouhouTripleShaRecord/master/data/zhangong.csv';
const URL_ACHIEVEMENT = 'https://raw.githubusercontent.com/BeginnerSlob/TouhouTripleShaRecord/master/data/achievement.csv';
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

        getAchievementTemplates().then(templates => {
            let achievements = document.querySelector('#achievements');
            achievements.innerHTML = '';
            for(let i = 1; i < res.length; i ++){
                let [id, completions, firstCompletion, progress] = res[i];
                let img = 'sha.png';
                let template = templates[id];
                let {title, desc, completionRequired} = template;
                if(completionRequired > 1)desc += `(${progress}/${completionRequired})`;

                let div = makeZhangongIcon({
                    id, img, title, desc, completions, progress,
                    firstCompletion, requiredProgress: completionRequired
                });
                achievements.appendChild(div);
                console.log(div);
            }
            (window as any).componentHandler.upgradeDom();
        });
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

let achievementTemplates: {
    [id: string]:{
        id: string;
        title: string;
        desc: string;
        score: string;
        completionRequired: string;
    }
} = {};
let gotAchievements = false;

function getAchievementTemplates(){
    return new Promise(resolve => {
        if(gotAchievements){
            resolve(achievementTemplates);
            return;
        }
        getCSV(URL_ACHIEVEMENT).then(res =>{
            for(let i = 1; i < res.length; i ++){
                let [id, title, desc, score, completionRequired] = res[i];
                achievementTemplates[id] = {
                    id, title, desc, score, completionRequired
                };
            }
            resolve(achievementTemplates);
        });
    });
}

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
    progress: number;
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
    
    let progress = div.querySelector(`#${item.id}-progress`);
    if(item.requiredProgress <= 1){
        progress.parentElement.removeChild(progress);
    }else{
        progress.addEventListener('mdl-componentupgraded', e => {
            (progress as any).MaterialProgress.setProgress(item.progress / item.requiredProgress * 100);
        });
    }
    if(item.completions > 0){
        div.classList.add('mdl-badge');
        div.dataset['badge'] = item.completions == 1 ? '✓' : item.completions + '';
    }else{
        let img = div.querySelector('img');
        img.style.filter = 'grayscale(1)';
    }

    return div;
}
