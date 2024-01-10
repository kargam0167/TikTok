# TikTok
Digital Nomad Identities on TikTok
This paper studies attributes of the online identity of a niche group of highly mobile remote workers (here and after digital nomads, DNs) and how the social platform of TikTok shapes their online identity narratives.
This study uses a mixed method approach combining qualitative content analysis with the affordance of computational SBMTM topic modeling analysis. 

The Dataset
The dataset is sourced from TikTok and collected through the unofficial [TIKAPI](https://tikapi.io/) using a set of specific hashtags:
    
    Hashtags
    
    - #digitalnomadlifestyle
    - #digitalnomadlife
    - #digitalnomad
    - #remotework
    - #travellife
    - #workfromanywhere
    
TikTok API retrieves all available metadata for TikTok videos associated with a given hashtag and does not limit the results to a percentage of the total. 

 **[TikAPI documentation](https://tikapi.io/documentation/#tag/Profile)**

- The **`/hashtag/videos`** endpoint allows retrieving TikTok videos associated with a given hashtag. It returns a list of video objects containing metadata like ID, description, stats, etc.
- There is no mention of limiting or sampling the results to a subset of available videos.
- The pagination parameters allow retrieving all available results across multiple pages, implying full retrieval is possible.
