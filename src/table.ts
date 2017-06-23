import * as data from './data';

export function el(tag: string, traits?: {[key: string]: string}){
    let element = document.createElement(tag);
    if(traits)
        for(let key in traits)
            element.setAttribute(key, traits[key]);
    return element;
}

export function header(header: HTMLTableHeaderCellElement, data: string[]){
    header.innerHTML = '';

    let ignore: any = {};
    for(let i = 0; i < data.length; i ++){
        if(data[i][0] == '~'){
            ignore[i] = true;
            continue;
        }
        let th = el('th', {class: 'mdl-data-table__cell--non-numeric' });
        th.innerText = data[i];
        header.appendChild(th);
    }

    return ignore as {[key: number]: boolean};
}

export function body(body: HTMLTableDataCellElement,
                     rows: string[][],
                     ignore?: {[key: number]: boolean},
                     button?: {name: string, callback: (row: string[]) => void}){
    body.innerHTML = '';

    for(let i = 0; i < rows.length; i ++){
        let tr = el('tr')
        body.appendChild(tr);

        for(let j = 0; j < rows[i].length; j ++){
            if(ignore && ignore[j])continue;
            let td = el('td', {class: 'mdl-data-table__cell--non-numeric'});
            td.innerText = rows[i][j];
            tr.appendChild(td);
        }

        if(!button)continue;
        let td = el('td');
        let btn = el('button', {class: 'mdl-button mdl-js-button'});
        let row = rows[i];
        btn.innerText = button.name;
        btn.addEventListener('click', e => button.callback(row));
        td.appendChild(btn);
        tr.appendChild(td);
    }
}

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

export function makeZhangongIcon(item: ZhangongItem){
    if(!item.firstCompletion)item.firstCompletion = '';
    if(item.firstCompletion == '1990-01-01')item.firstCompletion = '';
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
        progress.parentElement.insertBefore(el('br'), progress);
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

export function achievements(achievements: HTMLElement, res: string[][]){
    data.getAchievementTemplates().then(templates => {
        let all = achievements.querySelector('#achievements-all-panel');
        let uncompleted = achievements.querySelector('#achievements-uncompleted-panel');
        let completed = achievements.querySelector('#achievements-completed-panel');

        all.innerHTML = '';
        uncompleted.innerHTML = '';
        completed.innerHTML = '';

        for(let i = 1; i < res.length; i ++){
            let [id, completionsS, firstCompletion, progressS] = res[i];
            let completions = parseInt(completionsS);
            let progress = parseInt(progressS);
            let img = 'sha.png';
            let template = templates[id];
            let {title, desc, completionRequired} = template;
            if(completionRequired > 1)desc += `(${progress}/${completionRequired})`;

            let div = makeZhangongIcon({
                id, img, title, desc, completions, progress,
                firstCompletion, requiredProgress: completionRequired
            });

            all.appendChild(div);
            if(completions > 0)completed.appendChild(div.cloneNode(true));
            else uncompleted.appendChild(div.cloneNode(true));
        }
        (window as any).componentHandler.upgradeDom();
    });
}
