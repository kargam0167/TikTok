#Digital Nomad Identities on TikTok

The dataset is sourced from TikTok and collected through the unofficial [TIKAPI](https://tikapi.io/) using a set of specific hashtags:
    
    Hashtags
    
    - #digitalnomadlifestyle
    - #digitalnomadlife
    - #digitalnomad
    - #remotework
    - #travellife
    - #workfromanywhere
    
TikAPI retrieves metadata listed below for TikTok videos associated with a given hashtag and does not limit the results to a percentage of the total. 

 **[TikAPI documentation](https://tikapi.io/documentation/#tag/Profile)**

The **`/hashtag/videos`** endpoint allows you to retrieve TikTok videos associated with a given hashtag. It returns a list of video objects containing metadata like ID, description, stats, etc.
- There is no mention of limiting or sampling the results to a subset of available videos.
- The pagination parameters allow retrieving all available results across multiple pages, implying that complete retrieval is possible.

#The dataset
- The **`/hashtag/videos`** endpoint retrieves TikTok videos associated with a given hashtag. It returns a list of video objects containing metadata like ID, description, stats, etc.
- There is no mention of limiting or sampling the results to a subset of available videos.
- The pagination parameters allow retrieving all available results across multiple pages, implying that complete retrieval is possible.

The code example [Collect_Hashtags.ipynb](https://github.com/kargam0167/TikTok/blob/main/Collect_Hashtags.ipynb) collects data related to the hashtag "#travellife" from TikTok using the Tikapi library. It fetches a maximum of 50 pages of data related to the hashtag and handles possible exceptions that could occur during the process.

The above code has been executed six times, once for each hashtag mentioned above. The collected data is stored separately for every hashtag, each time adjusting the filename (e.g., 'digitalnomad.json') to reflect the respective hashtag.

**It's important to note that the data composition can vary over time due to new videos with related hashtags being added. Additionally, TikTok accounts and videos may be deleted, making reproducing the exact dataset at any given time challenging.**

As a result, we have 6 JSON files, each corresponding to the video collection with at least one hashtag. The name of the hashtag is reflected in the name of the file. 
We consolidated multiple JSON files containing scraped data on different hashtags into one comprehensive JSON file that has a hierarchical structure; we work with the main dictionary called `itemList,` which contains:

- 'author' metadata represents TikTok creator information.
- 'authorStats,' which contains statistics such as the number of followers and videos published.
- id: The unique id of the video
- desc: metadata of the video post
- stats: View and like counts
- music: Details about the background music
- video: Technical details about the video, such as resolution, size, etc.

This data management plan is designed to ensure the responsible handling of data:

The code for creating a Video unit dataframe is here [Video_Dataframe.ipynb](https://github.com/kargam0167/TikTok/blob/main/Video_Dataframe.ipynb) 

To ensure the security of the collected data, the study follows following protocol:

- API Key Security: The TikAPI key should be stored as an environment variable on the server-side and not be exposed in the front-end or version control systems.

- Secure Storage: The collected raw data, which is in JSON format, should be stored in a secure, access-controlled database or a file system with encryption at rest.

- Access Control: Access to the raw data is restricted to authorized personnel only, through the use of strong passwords and role-based access control.


**TikTok Video Dataframe**

Only absolutely necessary data points for the study are stored:

| Field | Description | Type |
| --- | --- | --- |
| authorId | ID number of the creator profile | integer |
| videoId | ID number of the video | integer |
| datetime | UTC stamp of when the TikTok video was uploaded | datetime |
| desc | The caption from the video | string |
| hashtagNames | Name of the hashtag | string |
| stickersText | Text captions used in the video | string |


Anonymization is an important step in protecting the privacy of individuals. The following fields are anonymized: videoId and authorId.

Hashing with a salt is a one-way process that has been used to anonymize these identifiers. This method turns the original data into a fixed-size hash, which was used for analysis without exposing the original identifier. The code is here: [Hashing_code.ipynb](https://github.com/kargam0167/TikTok/blob/main/Hashing_code.ipynb)

The raw data was retained only for the duration of necessary to complete the data processing and anonymization and was securely deleted 30 days after the study completion.
The anonymized data is retained for a longer period for longitudinal analysis.

