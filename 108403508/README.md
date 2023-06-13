## 介紹
資料集:World_Bank_labol_force_data.csv
欄位:
1. 國家 Country Name
2. 月收入中位數(美元淨值) Real Median Monthly Wages in USD (base 2011), PPP adjusted
: Median earnings for wage workers per month aged 15-64, inflation corrected to 2010 values and adjusted for purchasing power parity using WDI provided exchange values.
3. 農業月收入中位數(當地貨幣) Median Earnings for wage workers per month in agriculture, local nominal currenc
4. 工業月收入中位數(當地貨幣)Median Earnings for wage workers per month in industry, local nominal currency
5. 服務業月收入中位數(當地貨幣)Median Earnings for wage workers per month in service, local nominal currency
6. 每周平均工時 Average weekly working hours
7. 超時工作比例 Excessive working hours,>48 hours per week: >48 hours per week
8. 女/男性工資比例 Female to Male gender wage gap, calculated with median wages: Female to Male gender wage gap for wage workers aged 15-64. Reports the ratio of female wage workers earnings to male wage workers earnings.

資料處理:
1. 改為年收入: 月收入*12
2. 當地貨幣皆換算為美元淨值: 資料*PPPratio
PPPratio = d['Real Median Monthly Wages in USD (base 2011), PPP adjusted'] / d['Median Earnings for wage workers per month, local nominal currency']
借用資料兩欄位計算