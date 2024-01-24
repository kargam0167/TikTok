#Digital Nomad Identities on TikTok
This paper studies short video narratives on TikTok, marked with specific hashtags focusing on identity narratives, identity threats, and coping strategies to mitigate such threats. This study uses a mixed method approach combining qualitative content analysis with the affordance of computational SBMTM topic modeling analysis. 

The Dataset
The dataset is sourced from TikTok and collected through the unofficial [TIKAPI](https://tikapi.io/) using a set of specific hashtags:
    
    Hashtags
    
    - #digitalnomadlifestyle
    - #digitalnomadlife
    - #digitalnomad
    - #remotework
    - #travellife
    - #workfromanywhere
    
TikAPI retrieves all available metadata for TikTok videos associated with a given hashtag and does not limit the results to a percentage of the total. 

 **[TikAPI documentation](https://tikapi.io/documentation/#tag/Profile)**

- The **`/hashtag/videos`** endpoint allows retrieving TikTok videos associated with a given hashtag. It returns a list of video objects containing metadata like ID, description, stats, etc.
- There is no mention of limiting or sampling the results to a subset of available videos.
- The pagination parameters allow retrieving all available results across multiple pages, implying full retrieval is possible.

#The dataset
- The **`/hashtag/videos`** endpoint allows retrieving TikTok videos associated with a given hashtag. It returns a list of video objects containing metadata like ID, description, stats, etc.
- There is no mention of limiting or sampling the results to a subset of available videos.
- The pagination parameters allow retrieving all available results across multiple pages, implying full retrieval is possible.

The code example [Collect_Hashtags.ipynb](https://github.com/kargam0167/TikTok/blob/main/Collect_hashtags.ipynb) collects data related to the hashtag "#travellife" from TikTok using the Tikapi library. It fetches a maximum of 50 pages of data related to the hashtag and handles possible exceptions that could occur during the process.

The above code has been executed six times, once for each hashtag. The collected data was stored separately for every hashtag, each time adjusting the filename (e.g., 'digitalnomad.json') to reflect the respective hashtag.

**It's important to note that the data composition can vary over time due to new videos with related hashtags being added. Additionally, TikTok accounts and videos may be deleted, making reproducing the exact dataset at any given time challenging.**

As a result, we have 6 JSON files, each corresponding to the video collection with at least one hashtag. The name of the hashtag is reflected in the name of the file. 
We consolidated multiple JSON files containing scraped data on different hashtags into one comprehensive JSON file. We then create two data frames for each unit of the analysis.


The code for creating a Video unit dataframe is here [Video_Dataframe.ipynb](https://github.com/kargam0167/TikTok/blob/main/Video_Dataframe.ipynb) 
-For the current state of our study we only use the dataset collected in September.

The code for creating an Author unit dataframe is here [Author_Dataframe.ipynb](https://github.com/kargam0167/TikTok/blob/main/Author_Dataframe.ipynb)
-For the current state of our study we only use the dataset collected in September.

#




