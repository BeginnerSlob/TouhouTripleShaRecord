import * as data from './data';

export function el(tag: string, traits?: {[key: string]: string}){
    let element = document.createElement(tag);
    if(traits)
        for(let key in traits)
            element.setAttribute(key, traits[key]);
    return element;
}

export function header(header: HTMLTableHeaderCellElement, data: string[], debug?: boolean){
    header.innerHTML = '';

    let ignore: any = {};
    for(let i = 0; i < data.length; i ++){
        if(data[i][0] == '~' && !debug){
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
    score: number;
    completions: number;
    firstCompletion?: string;
    progress: number;
    requiredProgress: number;
}

export function makeZhangongIcon(item: ZhangongItem){
    if(!item.firstCompletion)item.firstCompletion = '';
    if(item.firstCompletion == '1990-01-01')item.firstCompletion = '';
    let temp = document.querySelector('template#template-achievement')!.innerHTML;
    for(let key in item){
        let text = (item as any)[key];
        if(key == 'firstCompletion' && text)text = '完成于：' + text;
        temp = temp.replace(new RegExp(`{{${key}}}`, 'g'), text);
    }
    let div = el('div' );
    div.innerHTML = temp;

    let progress = div.querySelector(`#${item.id}-progress`)!;
    if(item.requiredProgress <= 1){
        progress.parentElement!.removeChild(progress);
    }else{
        progress.parentElement!.insertBefore(el('br'), progress);
        progress.addEventListener('mdl-componentupgraded', e => {
            (progress as any).MaterialProgress.setProgress(Math.min(100, item.progress / item.requiredProgress * 100));
        });
    }
    if(item.completions > 0){
        div.classList.add('mdl-badge');
        div.dataset['badge'] = item.completions == 1 ? '✓' : item.completions + '';
    }else{
        let img = div.querySelector('img')!;
        img.style.filter = 'grayscale(1)';
    }

    return div;
}

export function achievements(achievements: HTMLElement, res: string[][]){
    data.getAchievementTemplates().then(templates => {
        let all = achievements.querySelector('#achievements-panel')!;

        all.innerHTML = '';

        const ourResult: {[key: string]: string[]} = {};
        for(const item of res) {
            console.log(item[0]);
            if(!item[0])break;
            ourResult[item[0]] = item;
        }

        let point = 0;
        for(const id in templates){
            const template = templates[id];
            let {title, desc, score, completionRequired} = template;

            const item = ourResult[id] || [];
            let [_, completionsS, firstCompletion, progressS] = item;
            console.log(item);

            let completions = parseInt(completionsS) || 0;
            let progress = parseInt(progressS) || 0;
            let img = `img/${id}.png`;
            if(completionRequired > 1)desc += `(${progress}/${completionRequired})`;

            let div = makeZhangongIcon({
                id, img, title, desc, completions, progress, score,
                firstCompletion, requiredProgress: completionRequired
            });

            point += completions * score;

            if(completions > 0) div.classList.add('completed-achievement');
            else div.classList.add('uncompleted-achievement');
            all.appendChild(div);
        }
        setZhangong(point);
        (window as any).componentHandler.upgradeDom();
    });
}

const zhangongPoint = document.querySelector("#战功点")!;
export function setZhangong(points: number) {
    zhangongPoint.textContent = points + '';
}
