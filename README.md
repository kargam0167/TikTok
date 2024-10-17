#Digital Nomad Identities on TikTok

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

The **`/hashtag/videos`** endpoint allows you to retrieve TikTok videos associated with a given hashtag. It returns a list of video objects containing metadata like ID, description, stats, etc.
- There is no mention of limiting or sampling the results to a subset of available videos.
- The pagination parameters allow retrieving all available results across multiple pages, implying that complete retrieval is possible.

#The dataset
- The **`/hashtag/videos`** endpoint retrieves TikTok videos associated with a given hashtag. It returns a list of video objects containing metadata like ID, description, stats, etc.
- There is no mention of limiting or sampling the results to a subset of available videos.
- The pagination parameters allow retrieving all available results across multiple pages, implying that complete retrieval is possible.

The code example [Collect_Hashtags.ipynb](https://github.com/kargam0167/TikTok/blob/main/Collect_hashtags.ipynb) collects data related to the hashtag "#travellife" from TikTok using the Tikapi library. It fetches a maximum of 50 pages of data related to the hashtag and handles possible exceptions that could occur during the process.

The above code has been executed six times, once for each hashtag mentioned above. The collected data is stored separately for every hashtag, each time adjusting the filename (e.g., 'digitalnomad.json') to reflect the respective hashtag.

**It's important to note that the data composition can vary over time due to new videos with related hashtags being added. Additionally, TikTok accounts and videos may be deleted, making reproducing the exact dataset at any given time challenging.**

As a result, we have 6 JSON files, each corresponding to the video collection with at least one hashtag. The name of the hashtag is reflected in the name of the file. 
We consolidated multiple JSON files containing scraped data on different hashtags into one comprehensive JSON file that has a hierarchical structure; we work with the main dictionary called `itemList,` which contains:

- 'author' metadata represents TikTok creator information.
- 'authorStats,' which contains statistics such as the number of followers and videos published.
- id: The unique id of the video
- desc: Description of the video
- stats: View and like counts
- author: Author info like avatar, id, nickname, etc.
- music: Details about the background music
- video: Technical details about the video, such as resolution, size, etc.

We then create two data frames for each unit of the analysis:

The code for creating a Video unit dataframe is here [Video_Dataframe.ipynb](https://github.com/kargam0167/TikTok/blob/main/Video_Dataframe.ipynb) 
-For the current state of our study, we only use the dataset [collected in September](https://github.com/kargam0167/TikTok/blob/main/Author_DataFrame.ipynb).

**TikTok Video Dataframe**
| Field | Description | Type |
| --- | --- | --- |
| authorId | ID number of the creator profile | integer |
| commentCount | Number of comments made on the video | integer |
| datetime | UTC stamp of when the TikTok video was uploaded | datetime |
| desc | The caption from the video | string |
| diggCount | Number of likes for a video | integer |
| duetEnabled | Duets to the video are allowed | Boolean |
| duetFromId | If filled the video is a duet with another video | integer |
| hashtagNames | Name of the hashtag | string |
| musicAlbum | The name of the album of the song | string |
| musicAuthorName | The author of the sound used in the video | string |
| musicId | ID number for the sound used in a video | integer |
| musicTitle | The music/sound title | string |
| playCount | Number of times a video was played | integer |
| shareCount | Number of times a video was shared | integer |
| stickersText | Text captions used in the video | string |
| videoId | ID number of the video | integer |
| videoLink | Direkt link to the video add | string |

The code for creating an Author unit dataframe is here [Author_Dataframe.ipynb](https://github.com/kargam0167/TikTok/blob/main/Author_Dataframe.ipynb)
-For the current state of our study, we only use the dataset [collected in September](https://github.com/kargam0167/TikTok/blob/main/Video_DataFrame.ipynb).

**TikTok Author Dataframe**
| Fields | Description | Type |
| --- | --- | --- |
| authorId | ID number of the creator profile | Integer |
| authorUniqueId | The handle of the creator profile | String |
| authorDiggCount | The number of videos liked by the user | String |
| authorFollowerCount | Number of accounts following the profile | Integer |
| authorFollowingCount | Number of accounts the profile is following | Integer |
| authorHeartCount | Number of likes, in totality, on the profile's posted content | Integer |
| authorVideoCount | Number of videos posted to the profile in total | Integer |
| avatarLarger | A full-size version of the profile photo (link will have a quick expiration date) | String |
| avatarMedium | A medium-sized version of the profile photo (link will have a quick expiration date)avatarThumb | String |
| avatarThumb | A thumb size of the profile photo (link will have a quick expiration date) | String |
| commentSetting | who can comment on the user content: 0 = Everyone; 1= Friends; 2= Off | Integer |
| downloadSetting | 0: Allow anyone to download videos, 1: Allow friends to download videos, 2: Do not allow anyone to download videos, 3: Allow downloads only in specific regions | Integer |
| duetSetting | 0:Allow anyone to duet videos; 1: Allow friends to duet videos; 2: Do not allow anyone to duet videos | Integer |
| ftc | False/True, indicates minor under 13 year old | Boolean |
| isADVirtual | False/True for Virtual influenser, not a real person | Boolean |
| nickname | Display name of the profile | String |
| openFavorite | False/True, the user has allowed other users to see their bookmarked videos, sounds, and effects on the web version of TikTok | Boolean |
| privateAccount | The user's videos and content are/are'nt accessible to the general public | Boolean |
| relation | 0= No Family pairing feature, 1=Family | Integer |
| secUid | Unique string of characters to identify the user or their content | String |
| secret | Whether the account's content is limited in visibility to a select audience or followers. | Boolean |
| signature | Signature statement in the bio of a profile | String |
| stitchSetting | Whether creator allowes to stitch their content | Binary |
| ttSeller | Identify the seller of a product on TikTok | Boolean |
| verified | #False/True Account is verified | Boolean |



