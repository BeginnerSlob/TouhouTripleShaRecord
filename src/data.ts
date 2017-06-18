// vim: set foldmethod=marker: 
import * as Promise from 'promise';
import * as main from './main';
import * as CSV from 'csv-js';

export function getCSV(url = main.URL_ACCOUNTS): Promise<string[][]>{// {{{
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

interface AchievementTemplate{// {{{
    id: string;
    title: string;
    desc: string;
    score: string;
    completionRequired: number;
}

interface AchievementTemplateTable{
    [id: string]:AchievementTemplate
}

let achievementTemplates: AchievementTemplateTable = null;

export function getAchievementTemplates(){
    return new Promise<AchievementTemplateTable>(resolve => {
        if(achievementTemplates){
            resolve(achievementTemplates);
            return;
        }
        getCSV(main.URL_ACHIEVEMENT).then(res =>{
            achievementTemplates = {};
            for(let i = 1; i < res.length; i ++){
                let [id, title, desc, score, completionRequiredS] = res[i];
                let completionRequired = parseInt(completionRequiredS);
                achievementTemplates[id] = {
                    id, title, desc, score, completionRequired
                };
            }
            resolve(achievementTemplates);
        });
    });
}// }}}

let players: string[][] = null;// {{{

export function getPlayers(){
    return new Promise<string[][]>(resolve => {
        if(players)resolve(players);
        getCSV(main.URL_ACCOUNTS).then(resolve);
    });
}// }}}
