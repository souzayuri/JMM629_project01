import pandas as pd


#%% Load the dataset
df = pd.read_csv("data/df_combined.csv")

#%% Convert timestamp to datetime format and extract the hour
df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
df['hour'] = df['timestamp'].dt.hour

#%% Count the number of activities per hour for each individual and biome
activity_count_per_hour_biome = df.groupby(['individual.local.identifier', 'Biome', 'hour']) \
    .size() \
    .reset_index(name='activity_count')

#%% Calculate the average activity count per hour for each individual and biome
avg_activity_per_hour_biome = df.groupby(['individual.local.identifier', 'Biome', 'hour']) \
    .size() \
    .groupby(['individual.local.identifier', 'Biome']) \
    .mean() \
    .reset_index(name='average_activity_count')

# %% Merge the count and average data
activity_summary = activity_count_per_hour_biome.merge(avg_activity_per_hour_biome, 
                                                       on=['individual.local.identifier', 'Biome'])

activity_summary.rename(columns={"individual.local.identifier": "individual_local_identifier"}, inplace=True)

# Extracting the individual names after the last "_"
activity_summary["individual_name"] = activity_summary["individual_local_identifier"].str.split("_").str[-1]

activity_summary.rename(columns={"average_activity_count": "average"}, inplace=True)
activity_summary.rename(columns={"activity_count": "count"}, inplace=True)

activity_summary.to_csv("data/activity_summary.csv", index=False)
# %%
