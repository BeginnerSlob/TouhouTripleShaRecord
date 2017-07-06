import * as Promise from 'promise';
import * as main from './main';

declare function require(key: string): any;
const CSV = require('csv-js');

export function getCSV(url = main.URL_ACCOUNTS): Promise<string[][]>{// {{{
    let xhttp = new XMLHttpRequest();

    let promise = new Promise<string[][]>( (resolve, reject) => {
        xhttp.onreadystatechange = () =>{
            if(xhttp.readyState == 4){
                if(xhttp.status == 200){
                    const data =  CSV.parse(xhttp.responseText);
                    resolve(data);
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
    score: number;
    completionRequired: number;
}

interface AchievementTemplateTable{
    [id: string]:AchievementTemplate
}

let achievementTemplates: AchievementTemplateTable | null = null;

export function getAchievementTemplates(){
    return new Promise<AchievementTemplateTable>(resolve => {
        if(achievementTemplates){
            resolve(achievementTemplates);
            return;
        }
        getCSV(main.URL_ACHIEVEMENT).then(res =>{
            achievementTemplates = {};
            for(let i = 0; i < res.length; i ++){
                let [id, title, desc, scoreS, completionRequiredS] = res[i];
                const score = parseFloat(scoreS);
                let completionRequired = parseInt(completionRequiredS);
                achievementTemplates[id] = {
                    id, title, desc, score, completionRequired
                };
            }
            resolve(achievementTemplates);
        });
    });
}// }}}

let players: string[][] | null = null;// {{{

export function getPlayers(){
    return new Promise<string[][]>(resolve => {
        if(players){
            resolve(players);
            return;
        }
        getCSV(main.URL_ACCOUNTS).then(resolve);
    });
}// }}}

type ScoreCalculator = ((score: number) => string) | null;
let levelCalc: ScoreCalculator = null;

export function getLevelCalculator(){
    return new Promise<(score: number) => string>(resolve => {
        if(levelCalc){
            resolve(levelCalc);
            return;
        }
        getCSV(main.URL_LEVEL).then(res => {
            let levels = res as string[][];
            levelCalc =  (exp: number) => {
                for(let i = levels.length - 1; i >= 0; i --){
                    let threshold = parseInt(levels[i][0]);
                    let level = parseInt(levels[i][1]);
                    if(exp >= threshold)return level + '';
                }
                return '0';
            };
            resolve(levelCalc);
        });
    });
}

let wenCalc: ScoreCalculator = null;

export function getWenCalculator(){
    return new Promise<(score: number) => string>(resolve => {
        if(wenCalc){
            resolve(wenCalc);
            return;
        }
        getCSV(main.URL_WEN).then(res => {
            let levels = res as string[][];
            wenCalc =  (exp: number) => {
                for(let i = levels.length - 1; i >= 0; i --){
                    let threshold = parseInt(levels[i][0]);
                    let title = levels[i][1];
                    if(exp >= threshold)return title;
                }
                return '无';
            };
            resolve(wenCalc);
        });
    });
}

let wuCalc: ScoreCalculator = null;

export function getWuCalculator(){
    return new Promise<(score: number) => string>(resolve => {
        if(wuCalc){
            resolve(wuCalc);
            return;
        }
        getCSV(main.URL_WU).then(res => {
            let levels = res as string[][];
            wuCalc =  (exp: number) => {
                for(let i = levels.length - 1; i >= 0; i --){
                    let threshold = parseInt(levels[i][0]);
                    let title = levels[i][1];
                    if(exp >= threshold)return title;
                }
                return '无';
            };
            resolve(wuCalc);
        });
    });
}
