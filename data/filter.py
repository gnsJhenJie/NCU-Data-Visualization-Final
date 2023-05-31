import pandas as pd

data = pd.read_csv('Final Project/join_database_w_definitions.csv')
data = data.reset_index()
data = data.sort_values('Country Name')

countryList = []
for index, row in data.iterrows():
    if row['Country Name'] not in countryList:
        countryList.append(row['Country Name'])
# print(countryList)


completedData = data[data['Subsample'] == 'All']
data = completedData.drop(columns=['index'])
filteredData = data.loc[data.groupby('Country Name')['Year of survey'].idxmax()]

print("total country: {}, total year: {}".format(len(countryList), len(filteredData)))
filteredData.to_csv('./World_Bank_labol_force_data.csv', index=False)
