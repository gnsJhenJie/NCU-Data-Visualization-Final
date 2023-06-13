# 這裡是放Data的地方

直接使用 World_Bank_labol_force_data.csv 就可以了

總共有4個檔案
+ **World_Bank_labol_force_data.csv** :  
  這個是有過濾過的CSV，每一個國家只留最新年分和最完整的資料
+ **join_database_w_definitions.csv** :  
  從原始資料從轉過來的CSV
+ **join_database_w_definitions.xlsx** :  
  直接從 World Band 下來的原始資料，有保留各個欄位的解釋
+ **filter.py** :  
  資料過濾的程式碼


join_database_w_definitions.xlsx --轉檔去標頭--> join_database_w_definitions.csv --過濾年分和保留最完整的資料--> World_Bank_labol_force_data.csv
