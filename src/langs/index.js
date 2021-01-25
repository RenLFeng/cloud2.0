let defaultlangs = [{
        name: '简体中文',
        type: 'zh',
        code:2052
    },
    {
        name: 'English',
        type: 'en',
        code:1033
    },
    {
        name: '日本語',
        type: 'jp',
        code:1041
    },
    {
        name: '한글',
        type: 'kor',
        code:1042
    },
    {
        name: 'Français',
        type: 'fra',
        code:1036
    },
    {
        name: 'Deutsch',
        type: 'de',
        code:1031
    },
    // {
    //     name: '印尼文',
    //     type: 'indonesian'
    // },
];
export const lagelists = defaultlangs;
export const FanyiLangs = () => {
    let temp = [];
    for (let v of lagelists) {
        if (v.type == 'indonesian' || v.type == 'zh') {
            continue;
        }
        temp.push(v.type);
    }
    return temp;
};
// str.replace(/<[^>]+>/g,'');