## index.html
***
|元素       |  class/id 名稱     | 功能                 |
|---       |  ----              | ----              |
|   div    |    pie_main    |   包含標題文字、圓餅圖、選單、按鈕    |
|   svg     | chart  | 圓餅圖 |
|select| countrySelect  | 選擇國家 |
|button| countryBtn  | 按鈕 |
|h4| (對應4種年齡層)  | 用來顯示該國家該年齡層佔比 |
|   div    |    tooltip    |   滑鼠移上去會顯示資料    |


## main.js
***
## 流程
1. 讀檔案，進入ready
    ```
    d3.csv("data/test.csv").then(
        res=>{
            ready(res)
        }
    )
    ```
2. ready執行三個副程式
    ```
    function ready(rawdata){
        data=preprocess(rawdata);   //處理資料
        btninit(data);       //生成動態國家選項
        btnclick(data);    //按下按鈕會發生的事
    }
    ```

3. 資料更改

    資料(World_Bank_labol_force_data.csv)一些欄位標題的值我有重新取名，更改時請務必小心。
    ```
    data.forEach(function(d) {
        d.Country_Name = d['Country Name'];
        d.Children = parseFloat(d['Children, aged 0-14']);
        d.Youth = parseFloat(d['Youth, aged 15-24']);
        d.Adult = parseFloat(d['Adult, aged 25-64']);
        d.Elderly = parseFloat(d['Elderly, aged 65+']);
    });
    ```
    |原始欄位編號|  原始欄位標題   | 新欄位標題  |
    |---|  ----  | ----  |
    |A|Country Name|Country_Name|
    |K| Children, aged 0-14  | Children |
    |L| Youth, aged 15-24  | Youth |
    |M| Adult, aged 25-64  | Adult |
    |N| Elderly, aged 65+  | Elderly |

4. btnclick()
    ```
    //設定圓餅圖參數
    var width = 300;
    var height = 300;
    var radius = Math.min(width, height) / 2;
    var colors = d3.schemeCategory10;

    //設定圓餅圖
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    // 設定按鈕點擊事件處理函式
    d3.select("#countryBtn").on("click", click);
    ```

5. click()

    根據選中的國家過濾資料，繪製圓餅圖，最後顯示過濾後的資料


## style.css
***
1. pie_main
    
    讓整個div在中間從左到右排列，拔掉變回靠左從上到下排列

2. interactive 詳細資訊視窗設定

    搬運老師給的東東

## 成果展示:
***

https://mikaiyen.github.io/D3final/