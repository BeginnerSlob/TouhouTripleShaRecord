import * as Promise from 'promise';
import * as CSV from 'csv-js';

let ALL_URL = 'https://gist.githubusercontent.com/hypercross/6cd44e1019828c886db778e50df621c5/raw/b0b58c6093b94071ccbfcd1ea899edbf53dd2120/test.csv';
function getCSV(url = ALL_URL): Promise{
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
}

function fillTable(body, rows, nobutton? :boolean){
    body.innerHTML = '';

    for(let i = 0; i < rows.length; i ++){
        let tr = document.createElement('tr');
        body.appendChild(tr);

        for(let j = 0; j < rows[i].length; j ++){
            if(rows.ignore && rows.ignore[j])continue;
            let td = document.createElement('td');
            td.innerText = rows[i][j];
            td.classList.add('mdl-data-table__cell--non-numeric');
            tr.appendChild(td);
        }

        if(nobutton)return;
        let p = rows[i][1];
        let td = document.createElement('td');
        let btn = document.createElement('button');
        btn.classList.add('mdl-button');
        btn.classList.add('mdl-js-button');
        btn.innerText = '查看战绩';
        btn.addEventListener('click', e => fillPlayerTable(p));
        td.appendChild(btn);
        tr.appendChild(td);
    }
}

let data: any[] = null;
getCSV().then(res =>{
    console.log(res);
    data = res;

    let head = document.querySelector('#table-head');
    head.innerHTML = '';

    for(let i = 0; i < res[0].length; i ++){
        if(i == 2)continue;
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
    result.ignore = {2: true};
    fillTable(body, result);
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
    fillTable(body, res);
});

function fillPlayerTable(username){
    let url = 'https://gist.githubusercontent.com/hypercross/d1b1be8d1c786063087ca04afa2e50dd/raw/9f22162058d6990cbeb1790c5148470cd54b009f/0_zhanji.csv';
    getCSV(url).then(res => {

        let head = document.querySelector('#player-table-head');
        head.innerHTML = '';

        for(let i = 0; i < res[0].length; i ++){
            let th = document.createElement('th');
            th.innerText = res[0][i];
            th.classList.add('mdl-data-table__cell--non-numeric');
            head.appendChild(th);
        }

        let body = document.querySelector('#player-table-body');
        body.innerHTML = '';
        fillTable(body, res.slice(1), true);
    });
}
